const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const publicEnquiryRouter = express.Router();
const crmLeadRouter = express.Router();

// Public: Bulk Order Enquiry -> automatically creates a Lead in the CRM
publicEnquiryRouter.post('/', (req, res) => {
  const { name, phone, email, product_id, product_name, quantity, message } = req.body;
  if (!name || !phone || !email || !quantity) {
    return res.status(400).json({ error: 'Name, phone, email, and quantity are required' });
  }

  const numQty = parseInt(quantity, 10);
  if (Number.isNaN(numQty) || numQty <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive integer' });
  }

  let resolvedProductName = product_name ? product_name.trim() : '';
  let resolvedProductId = product_id ? parseInt(product_id, 10) : null;

  if (resolvedProductId) {
    const prod = db.prepare('SELECT id, name FROM products WHERE id = ?').get(resolvedProductId);
    if (prod) {
      resolvedProductName = prod.name;
    } else {
      resolvedProductId = null;
    }
  }

  if (!resolvedProductName) {
    return res.status(400).json({ error: 'Please select or specify a product' });
  }

  const result = db
    .prepare(
      `INSERT INTO leads (name, phone, email, product_id, product_name, quantity, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'New')`
    )
    .run(
      name.trim(),
      phone.trim(),
      email.trim().toLowerCase(),
      resolvedProductId,
      resolvedProductName,
      numQty,
      message ? message.trim() : ''
    );

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({
    message: 'Thank you! Your bulk order enquiry has been received. Our team will contact you shortly.',
    lead,
  });
});

// CRM: Admin and Sales Executive can view & update leads
crmLeadRouter.use(requireAuth, requireRole('ADMIN', 'SALES_EXECUTIVE'));

crmLeadRouter.get('/', (req, res) => {
  const { status, todayFollowUps, search } = req.query;
  let query = `
    SELECT l.*, u.name AS assigned_to_name
    FROM leads l
    LEFT JOIN users u ON l.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status && status !== 'All') {
    query += ' AND l.status = ?';
    params.push(status);
  }

  if (todayFollowUps === 'true') {
    // Compare YYYY-MM-DD in local server date
    const today = new Date().toISOString().slice(0, 10);
    query += ' AND l.follow_up_date = ?';
    params.push(today);
  }

  if (search && search.trim()) {
    query += ' AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ? OR l.product_name LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY l.created_at DESC, l.id DESC';
  const leads = db.prepare(query).all(...params);
  res.json({ leads });
});

const VALID_LEAD_STATUSES = ['New', 'Contacted', 'Converted', 'Lost'];

crmLeadRouter.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const { status, notes, follow_up_date } = req.body;
  if (status !== undefined && !VALID_LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid lead status. Must be one of: ${VALID_LEAD_STATUSES.join(', ')}` });
  }

  db.prepare(
    `UPDATE leads
     SET status = ?, notes = ?, follow_up_date = ?, assigned_to = COALESCE(assigned_to, ?), updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    status !== undefined ? status : existing.status,
    notes !== undefined ? notes : existing.notes,
    follow_up_date !== undefined ? (follow_up_date || null) : existing.follow_up_date,
    req.user.id,
    req.params.id
  );

  const updated = db
    .prepare(
      `SELECT l.*, u.name AS assigned_to_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = ?`
    )
    .get(req.params.id);
  res.json({ lead: updated });
});

module.exports = { publicEnquiryRouter, crmLeadRouter };
