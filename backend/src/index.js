require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { authenticate, requireRole } = require('./middleware/auth');
const automationService = require('./services/automation.service');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ProntoBella API' });
});

// Public routes (no auth)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/checkin', require('./routes/checkin.routes'));

// Protected routes (any authenticated user)
app.use('/api/clients', authenticate, require('./routes/clients.routes'));
app.use('/api/visits', authenticate, require('./routes/visits.routes'));
app.use('/api/procedures', authenticate, require('./routes/procedures.routes'));

// Owner-only routes
app.use('/api/dashboard', authenticate, requireRole('owner'), require('./routes/dashboard.routes'));
app.use('/api/automations', authenticate, requireRole('owner'), require('./routes/automations.routes'));
app.use('/api/seguimiento', authenticate, requireRole('owner'), require('./routes/seguimiento.routes'));

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ ProntoBella API corriendo en http://localhost:${PORT}`);
});

// Automation engine — run on startup and every hour
automationService.evaluateAndQueue()
  .then((r) => console.log('Automatizaciones iniciales:', r))
  .catch((err) => console.error('Error en automatizaciones:', err.message));

setInterval(() => {
  automationService.evaluateAndQueue()
    .then((r) => console.log('Automatizaciones evaluadas:', r))
    .catch((err) => console.error('Error en automatizaciones:', err.message));
}, 60 * 60 * 1000); // Every hour
