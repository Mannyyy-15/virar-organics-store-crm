const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

// Use an isolated temporary SQLite database for tests
const testDbPath = path.join(__dirname, 'test-db.sqlite');
for (const ext of ['', '-wal', '-shm']) {
  if (fs.existsSync(testDbPath + ext)) {
    fs.unlinkSync(testDbPath + ext);
  }
}

process.env.DB_PATH = testDbPath;
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.PAYMENT_WEBHOOK_SECRET = 'test_webhook_secret';

const app = require('../server/index');
const seed = require('../server/seed');
const { signTestWebhook } = require('../server/routes/payments');

seed();

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;

  async function req(urlPath, { method = 'GET', token, body, headers = {} } = {}) {
    const res = await fetch(`${baseUrl}${urlPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  }

  try {
    console.log('1. Testing authentication & RBAC...');
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@virarorganics.in', password: 'Admin@123' },
    });
    assert.equal(adminLogin.status, 200);
    const adminToken = adminLogin.data.token;

    const salesLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'sales@virarorganics.in', password: 'Sales@123' },
    });
    assert.equal(salesLogin.status, 200);
    const salesToken = salesLogin.data.token;

    const custLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'customer@virarorganics.in', password: 'Customer@123' },
    });
    assert.equal(custLogin.status, 200);
    const custToken = custLogin.data.token;

    // Sales Executive must be blocked from products & orders on server
    assert.equal((await req('/admin/products', { token: salesToken })).status, 403);
    assert.equal((await req('/admin/orders', { token: salesToken })).status, 403);
    // Customer must be blocked from CRM & Admin
    assert.equal((await req('/crm/leads', { token: custToken })).status, 403);
    assert.equal((await req('/admin/products', { token: custToken })).status, 403);

    // Sales Executive dashboard must NOT expose ordersToday or revenueThisMonth
    const salesDash = await req('/crm/dashboard', { token: salesToken });
    assert.equal(salesDash.status, 200);
    assert.equal(salesDash.data.metrics.ordersToday, undefined);
    assert.equal(salesDash.data.metrics.revenueThisMonth, undefined);
    assert.ok(typeof salesDash.data.metrics.newLeads === 'number');
    console.log('   ✔ RBAC enforced on all server endpoints');

    console.log('2. Testing Problem 1: Concurrent checkout for last 1 unit in stock...');
    const createdProd = await req('/admin/products', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Concurrency Test Honey',
        category: 'Honey & Sweeteners',
        description: 'Limited single jar',
        price: 500,
        unit: '500g',
        stock: 1,
      },
    });
    assert.equal(createdProd.status, 201);
    const prodId = createdProd.data.product.id;

    const orderPayload = {
      items: [{ product_id: prodId, quantity: 1 }],
      customer_name: 'Concurrent Buyer',
      customer_phone: '9820012345',
      shipping_address: '123 Virar West',
      city: 'Virar',
      pincode: '401303',
      payment_method: 'ONLINE',
    };

    const [r1, r2] = await Promise.all([
      req('/orders', { method: 'POST', token: custToken, body: orderPayload }),
      req('/orders', { method: 'POST', token: custToken, body: orderPayload }),
    ]);

    const statuses = [r1.status, r2.status].sort();
    assert.deepEqual(statuses, [201, 409], `Expected one 201 and one 409, got ${statuses}`);

    const prodAfter = await req(`/products/${prodId}`);
    assert.equal(prodAfter.data.product.stock, 0, 'Stock must be exactly 0, never negative');
    console.log('   ✔ Exactly 1 concurrent order succeeded, 1 failed with 409, stock = 0');

    console.log('3. Testing Order Cancellation stock return...');
    const winningOrder = r1.status === 201 ? r1.data.order : r2.data.order;
    const cancelRes = await req(`/admin/orders/${winningOrder.id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'Cancelled' },
    });
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.data.order.status, 'Cancelled');

    const prodRestored = await req(`/products/${prodId}`);
    assert.equal(prodRestored.data.product.stock, 1, 'Stock must return to 1 after cancellation');
    console.log('   ✔ Cancelling order atomically returned stock to 1');

    console.log('4. Testing Problem 2: Webhook payment & idempotency...');
    const onlineOrderRes = await req('/orders', {
      method: 'POST',
      token: custToken,
      body: orderPayload,
    });
    assert.equal(onlineOrderRes.status, 201);
    const onlineOrder = onlineOrderRes.data.order;
    assert.equal(onlineOrder.status, 'Pending');

    const webhookBody1 = {
      id: 'evt_unique_001',
      type: 'payment.succeeded',
      data: {
        order_id: onlineOrder.id,
        order_number: onlineOrder.order_number,
        payment_id: 'pay_001',
        amount: onlineOrder.total_amount,
      },
    };
    const sig1 = signTestWebhook(JSON.stringify(webhookBody1));
    const wh1 = await req('/webhooks/payment', {
      method: 'POST',
      headers: { 'x-webhook-signature': sig1 },
      body: webhookBody1,
    });
    assert.equal(wh1.status, 200);
    assert.equal(wh1.data.duplicate, false);
    assert.equal(wh1.data.updated, true);

    // Duplicate delivery of same event_id
    const wh1Dup = await req('/webhooks/payment', {
      method: 'POST',
      headers: { 'x-webhook-signature': sig1 },
      body: webhookBody1,
    });
    assert.equal(wh1Dup.status, 200);
    assert.equal(wh1Dup.data.duplicate, true);
    assert.equal(wh1Dup.data.updated, false);

    // Different event_id for same already-paid order
    const webhookBody2 = { ...webhookBody1, id: 'evt_unique_002' };
    const sig2 = signTestWebhook(JSON.stringify(webhookBody2));
    const wh2 = await req('/webhooks/payment', {
      method: 'POST',
      headers: { 'x-webhook-signature': sig2 },
      body: webhookBody2,
    });
    assert.equal(wh2.status, 200);
    assert.equal(wh2.data.updated, false);

    const orderCheck = await req(`/orders/${onlineOrder.id}`, { token: custToken });
    assert.equal(orderCheck.data.order.status, 'Paid');
    assert.equal(orderCheck.data.order.payment_status, 'PAID');
    console.log('   ✔ Webhook marked order Paid and prevented duplicate processing');

    console.log('5. Testing Bulk Order Enquiry -> Auto Lead Creation...');
    const enqRes = await req('/enquiries', {
      method: 'POST',
      body: {
        name: 'Test Wholesale Buyer',
        phone: '+91 98200 99999',
        email: 'wholesale@example.com',
        product_id: prodId,
        quantity: 25,
        message: 'Monthly supply enquiry',
      },
    });
    assert.equal(enqRes.status, 201);
    assert.equal(enqRes.data.lead.status, 'New');
    console.log('   ✔ Bulk enquiry automatically created CRM lead');

    console.log('\nALL TESTS PASSED!');
  } finally {
    server.close();
    for (const ext of ['', '-wal', '-shm']) {
      if (fs.existsSync(testDbPath + ext)) {
        try {
          fs.unlinkSync(testDbPath + ext);
        } catch {
          // ignore cleanup lock on Windows
        }
      }
    }
  }
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
