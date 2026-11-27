const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('ADMIN', 'SALES_EXECUTIVE'));

router.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7); // YYYY-MM

  const newLeads = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE status = 'New'").get().count;
  const todayFollowUps = db
    .prepare('SELECT COUNT(*) AS count FROM leads WHERE follow_up_date = ?')
    .get(today).count;
  const totalLeads = db.prepare('SELECT COUNT(*) AS count FROM leads').get().count;
  const convertedLeads = db
    .prepare("SELECT COUNT(*) AS count FROM leads WHERE status = 'Converted'")
    .get().count;

  // Sales Executive only gets CRM lead metrics (no orders/revenue/products)
  if (req.user.role === 'SALES_EXECUTIVE') {
    return res.json({
      role: req.user.role,
      metrics: {
        newLeads,
        todayFollowUps,
        totalLeads,
        convertedLeads,
      },
    });
  }

  // Admin gets full store + CRM metrics
  const ordersToday = db
    .prepare("SELECT COUNT(*) AS count FROM orders WHERE substr(created_at, 1, 10) = ?")
    .get(today).count;

  const revenueThisMonth = db
    .prepare(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM orders
       WHERE substr(created_at, 1, 7) = ?
         AND status != 'Cancelled'
         AND (payment_status = 'PAID' OR status IN ('Paid', 'Shipped', 'Delivered'))`
    )
    .get(monthPrefix).total;

  const lowStockProducts = db
    .prepare('SELECT COUNT(*) AS count FROM products WHERE is_active = 1 AND stock <= 5')
    .get().count;

  res.json({
    role: req.user.role,
    metrics: {
      ordersToday,
      revenueThisMonth,
      newLeads,
      todayFollowUps,
      lowStockProducts,
    },
  });
});

module.exports = router;
