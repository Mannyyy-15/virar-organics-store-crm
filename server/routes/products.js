const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Public: list categories
publicRouter.get('/categories', (req, res) => {
  const rows = db
    .prepare('SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category ASC')
    .all();
  res.json({ categories: rows.map((r) => r.category) });
});

// Public: list products with optional category & search
publicRouter.get('/', (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search && search.trim()) {
    query += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY id DESC';
  const products = db.prepare(query).all(...params);
  res.json({ products });
});

// Public: single product detail
publicRouter.get('/:id', (req, res) => {
  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
    .get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// Admin only: list all products (including inactive)
adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json({ products });
});

adminRouter.post('/', (req, res) => {
  const { name, category, description, price, unit, stock, image_url } = req.body;
  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Name, category, description, price, and stock are required' });
  }
  const numPrice = Number(price);
  const numStock = parseInt(stock, 10);
  if (Number.isNaN(numPrice) || numPrice < 0 || Number.isNaN(numStock) || numStock < 0) {
    return res.status(400).json({ error: 'Price and stock must be non-negative numbers' });
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const result = db
    .prepare(
      `INSERT INTO products (name, slug, category, description, price, unit, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name.trim(),
      slug,
      category.trim(),
      description.trim(),
      numPrice,
      (unit || '500g').trim(),
      numStock,
      image_url ? image_url.trim() : null
    );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ product });
});

adminRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, category, description, price, unit, stock, image_url, is_active } = req.body;
  const numPrice = price !== undefined ? Number(price) : existing.price;
  const numStock = stock !== undefined ? parseInt(stock, 10) : existing.stock;

  if (Number.isNaN(numPrice) || numPrice < 0 || Number.isNaN(numStock) || numStock < 0) {
    return res.status(400).json({ error: 'Price and stock must be non-negative numbers' });
  }

  db.prepare(
    `UPDATE products
     SET name = ?, category = ?, description = ?, price = ?, unit = ?, stock = ?, image_url = ?, is_active = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    name !== undefined ? name.trim() : existing.name,
    category !== undefined ? category.trim() : existing.category,
    description !== undefined ? description.trim() : existing.description,
    numPrice,
    unit !== undefined ? unit.trim() : existing.unit,
    numStock,
    image_url !== undefined ? (image_url ? image_url.trim() : null) : existing.image_url,
    is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ product: updated });
});

adminRouter.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Soft-delete if referenced by orders, otherwise hard delete
  const orderRef = db.prepare('SELECT id FROM order_items WHERE product_id = ? LIMIT 1').get(req.params.id);
  if (orderRef) {
    db.prepare("UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    return res.json({ message: 'Product archived (referenced in past orders)' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = { publicRouter, adminRouter };
