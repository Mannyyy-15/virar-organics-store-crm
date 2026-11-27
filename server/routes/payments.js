const express = require('express');
const crypto = require('crypto');
const Stripe = require('stripe');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const paymentRouter = express.Router();
const webhookRouter = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'virar_test_webhook_secret_2026';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

function signTestWebhook(rawPayload) {
  return crypto.createHmac('sha256', PAYMENT_WEBHOOK_SECRET).update(rawPayload).digest('hex');
}

/**
 * Idempotent order payment processor (Problem 2 solution):
 * 1. Inserts event_id into webhook_events (UNIQUE constraint prevents duplicate event processing).
 * 2. Conditionally updates order WHERE id = ? AND status = 'Pending' AND payment_status != 'PAID'.
 */
function processPaymentWebhook({ eventId, provider, eventType, orderId, gatewayPaymentId, rawPayload }) {
  const tx = db.transaction(() => {
    try {
      db.prepare(
        `INSERT INTO webhook_events (event_id, provider, event_type, order_id, payload)
         VALUES (?, ?, ?, ?, ?)`
      ).run(eventId, provider, eventType, orderId, rawPayload);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { duplicate: true, updated: false };
      }
      throw err;
    }

    const updateRes = db
      .prepare(
        `UPDATE orders
         SET status = 'Paid',
             payment_status = 'PAID',
             gateway_payment_id = COALESCE(gateway_payment_id, ?),
             paid_at = COALESCE(paid_at, datetime('now')),
             updated_at = datetime('now')
         WHERE id = ? AND status = 'Pending' AND payment_status != 'PAID'`
      )
      .run(gatewayPaymentId || null, orderId);

    return { duplicate: false, updated: updateRes.changes > 0 };
  });

  return tx.immediate();
}

// Create payment session for an existing Pending ONLINE order
paymentRouter.post('/create-session', requireAuth, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({ error: 'order_id is required' });
  }

  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(order_id, req.user.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (order.payment_status === 'PAID' || order.status !== 'Pending') {
    return res.status(400).json({ error: 'Order is already paid or cannot be paid' });
  }

  // Real Stripe Checkout in TEST mode if STRIPE_SECRET_KEY is configured
  if (stripe) {
    try {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: items.map((item) => ({
          price_data: {
            currency: 'inr',
            product_data: { name: item.product_name },
            unit_amount: Math.round(item.unit_price * 100),
          },
          quantity: item.quantity,
        })),
        metadata: {
          order_id: String(order.id),
          order_number: order.order_number,
        },
        success_url: `${APP_URL}/orders?payment=success&order=${order.order_number}`,
        cancel_url: `${APP_URL}/orders?payment=cancelled&order=${order.order_number}`,
      });

      db.prepare("UPDATE orders SET gateway_session_id = ?, updated_at = datetime('now') WHERE id = ?").run(
        session.id,
        order.id
      );

      return res.json({ mode: 'stripe', checkoutUrl: session.url, sessionId: session.id });
    } catch (err) {
      console.error('Stripe session error:', err);
      return res.status(500).json({ error: 'Failed to create Stripe checkout session' });
    }
  }

  // Built-in Test Payment Gateway simulator (when Stripe keys are not provided)
  const sessionId = `test_sess_${order.id}_${Date.now()}`;
  db.prepare("UPDATE orders SET gateway_session_id = ?, updated_at = datetime('now') WHERE id = ?").run(
    sessionId,
    order.id
  );

  return res.json({
    mode: 'test_gateway',
    sessionId,
    orderId: order.id,
    orderNumber: order.order_number,
    amount: order.total_amount,
  });
});

// Built-in Test Payment Gateway: triggers an asynchronous server-to-server webhook
// Supports simulating "customer closes browser before returning to site"
paymentRouter.post('/test-gateway/complete', requireAuth, async (req, res) => {
  const { order_id, simulate_browser_close } = req.body;
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
    .get(order_id, req.user.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const eventId = `evt_test_${order.id}_${crypto.randomBytes(6).toString('hex')}`;
  const paymentId = `pay_test_${crypto.randomBytes(6).toString('hex')}`;
  const payloadObj = {
    id: eventId,
    type: 'payment.succeeded',
    data: {
      order_id: order.id,
      order_number: order.order_number,
      payment_id: paymentId,
      amount: order.total_amount,
    },
  };
  const rawPayload = JSON.stringify(payloadObj);
  const signature = signTestWebhook(rawPayload);

  // Process through the exact same webhook logic
  const result = processPaymentWebhook({
    eventId,
    provider: 'test_gateway',
    eventType: 'payment.succeeded',
    orderId: order.id,
    gatewayPaymentId: paymentId,
    rawPayload,
  });

  res.json({
    paid: true,
    simulatedBrowserClose: Boolean(simulate_browser_close),
    webhookEventId: eventId,
    webhookSignature: signature,
    result,
  });
});

// Server-to-server Webhook endpoint (Stripe or Test Gateway)
webhookRouter.post('/payment', (req, res) => {
  const rawBody = req.rawBody || JSON.stringify(req.body);

  // Case 1: Real Stripe Webhook
  const stripeSig = req.headers['stripe-signature'];
  if (stripe && STRIPE_WEBHOOK_SECRET && stripeSig) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, stripeSig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = parseInt(session.metadata?.order_id, 10);
      if (!Number.isNaN(orderId)) {
        const result = processPaymentWebhook({
          eventId: event.id,
          provider: 'stripe',
          eventType: event.type,
          orderId,
          gatewayPaymentId: session.payment_intent || session.id,
          rawPayload: rawBody.toString(),
        });
        return res.json({ received: true, ...result });
      }
    }
    return res.json({ received: true, ignored: true });
  }

  // Case 2: Signed Test Gateway Webhook (HMAC-SHA256)
  const testSig = req.headers['x-webhook-signature'];
  const expectedSig = signTestWebhook(rawBody.toString());
  if (!testSig || !crypto.timingSafeEqual(Buffer.from(testSig), Buffer.from(expectedSig))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  let parsed;
  try {
    parsed = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (parsed.type === 'payment.succeeded' && parsed.data?.order_id) {
    const result = processPaymentWebhook({
      eventId: parsed.id,
      provider: 'test_gateway',
      eventType: parsed.type,
      orderId: parseInt(parsed.data.order_id, 10),
      gatewayPaymentId: parsed.data.payment_id,
      rawPayload: rawBody.toString(),
    });
    return res.json({ received: true, ...result });
  }

  res.json({ received: true, ignored: true });
});

module.exports = { paymentRouter, webhookRouter, signTestWebhook, processPaymentWebhook };
