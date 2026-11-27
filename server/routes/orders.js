const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const customerRouter = express.Router();
const adminRouter = express.Router();

class InsufficientStockError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `VO-${datePart}-${randPart}`;
}

// Customer routes (require authentication)
customerRouter.use(requireAuth);

// Create order (checkout) - solves Problem 1 via BEGIN IMMEDIATE + conditional atomic stock decrement
customerRouter.post('/', (req, res) => {
  const { items, customer_name, customer_phone, shipping_address, city, pincode, payment_method } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!customer_name || !customer_phone || !shipping_address || !city || !pincode) {
    return res.status(400).json({ error: 'All delivery address fields are required' });
  }
  if (!['ONLINE', 'COD'].includes(payment_method)) {
    return res.status(400).json({ error: 'Payment method must be ONLINE or COD' });
  }

  // Merge duplicate product_ids in cart
  const mergedMap = new Map();
  for (const item of items) {
    const pid = parseInt(item.product_id, 10);
    const qty = parseInt(item.quantity, 10);
    if (Number.isNaN(pid) || Number.isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Invalid cart item or quantity' });
    }
    mergedMap.set(pid, (mergedMap.get(pid) || 0) + qty);
  }

  const createOrderTx = db.transaction(() => {
    const lineItems = [];
    let totalAmount = 0;

    const getProductStmt = db.prepare('SELECT id, name, price, stock, is_active FROM products WHERE id = ?');
    const decrementStockStmt = db.prepare(
      `UPDATE products
       SET stock = stock - ?, updated_at = datetime('now')
       WHERE id = ? AND is_active = 1 AND stock >= ?`
    );

    // Sort product IDs deterministically to prevent deadlocks
    const sortedEntries = [...mergedMap.entries()].sort((a, b) => a[0] - b[0]);

    for (const [productId, quantity] of sortedEntries) {
      const product = getProductStmt.get(productId);
      if (!product || !product.is_active) {
        const err = new Error(`Product #${productId} is no longer available`);
        err.status = 404;
        throw err;
      }

      // Atomic conditional stock decrement: fails if concurrent request already took the last unit
      const updateResult = decrementStockStmt.run(quantity, productId, quantity);
      if (updateResult.changes === 0) {
        throw new InsufficientStockError(
          `Sorry, "${product.name}" only has ${product.stock} unit(s) left in stock.`
        );
      }

      const subtotal = Number((product.price * quantity).toFixed(2));
      totalAmount += subtotal;
      lineItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity,
        subtotal,
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));
    const orderNumber = generateOrderNumber();

    const orderInsert = db
      .prepare(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_phone,
          shipping_address, city, pincode, payment_method,
          payment_status, status, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', 'Pending', ?)`
      )
      .run(
        orderNumber,
        req.user.id,
        customer_name.trim(),
        customer_phone.trim(),
        shipping_address.trim(),
        city.trim(),
        pincode.trim(),
        payment_method,
        totalAmount
      );

    const orderId = orderInsert.lastInsertRowid;
    const itemInsertStmt = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const li of lineItems) {
      itemInsertStmt.run(orderId, li.product_id, li.product_name, li.unit_price, li.quantity, li.subtotal);
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    return { order, items: lineItems };
  });

  try {
    // .immediate() acquires SQLite RESERVED write lock at transaction start
    const created = createOrderTx.immediate();
    res.status(201).json(created);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Customer: My Orders
customerRouter.get('/my', (req, res) => {
  const orders = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.user.id);

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const enriched = orders.map((order) => ({
    ...order,
    items: itemsStmt.all(order.id),
  }));

  res.json({ orders: enriched });
});

// Customer: Single order detail (own order only)
customerRouter.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

// Admin-only routes (Sales Executive gets 403 Forbidden)
adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/', (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT o.*, u.email AS user_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'All') {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC, o.id DESC';
  const orders = db.prepare(query).all(...params);
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

  res.json({
    orders: orders.map((o) => ({
      ...o,
      items: itemsStmt.all(o.id),
    })),
  });
});

const VALID_ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

adminRouter.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!VALID_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` });
  }

  const updateTx = db.transaction(() => {
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (existing.status === 'Cancelled' && status !== 'Cancelled') {
      const err = new Error('Cannot reopen a cancelled order whose stock has already been returned');
      err.status = 400;
      throw err;
    }

    // If transitioning to Cancelled for the first time, return stock atomically
    if (status === 'Cancelled' && existing.status !== 'Cancelled') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(existing.id);
      const restoreStmt = db.prepare(
        "UPDATE products SET stock = stock + ?, updated_at = datetime('now') WHERE id = ?"
      );
      for (const item of items) {
        restoreStmt.run(item.quantity, item.product_id);
      }
    }

    let nextPaymentStatus = existing.payment_status;
    let nextPaidAt = existing.paid_at;
    if (status === 'Paid' || status === 'Delivered') {
      nextPaymentStatus = 'PAID';
      if (!nextPaidAt) {
        nextPaidAt = new Date().toISOString();
      }
    } else if (status === 'Cancelled' && existing.payment_status === 'PAID') {
      nextPaymentStatus = 'REFUNDED';
    }

    db.prepare(
      `UPDATE orders
       SET status = ?, payment_status = ?, paid_at = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(status, nextPaymentStatus, nextPaidAt, existing.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(existing.id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(existing.id);
    return { ...updated, items };
  });

  try {
    const order = updateTx.immediate();
    res.json({ order });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = { customerRouter, adminRouter };
