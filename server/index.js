require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure DB initializes on startup
require('./db');

const authRoutes = require('./routes/auth');
const { publicRouter: productPublicRoutes, adminRouter: productAdminRoutes } = require('./routes/products');
const { customerRouter: orderCustomerRoutes, adminRouter: orderAdminRoutes } = require('./routes/orders');
const { publicEnquiryRouter, crmLeadRouter } = require('./routes/leads');
const dashboardRoutes = require('./routes/dashboard');
const { paymentRouter, webhookRouter } = require('./routes/payments');

const app = express();

app.use(cors());

// Preserve rawBody for cryptographic webhook signature verification (Stripe & Test Gateway)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Virar Organics API', timestamp: new Date().toISOString() });
});

// Public & Customer routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productPublicRoutes);
app.use('/api/orders', orderCustomerRoutes);
app.use('/api/enquiries', publicEnquiryRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/webhooks', webhookRouter);

// Admin & CRM routes (role-protected on server)
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/admin/orders', orderAdminRoutes);
app.use('/api/crm/leads', crmLeadRouter);
app.use('/api/crm/dashboard', dashboardRoutes);

// Serve built React frontend in production
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Virar Organics server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
