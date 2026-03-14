require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { authenticate, requireRole } = require('./middleware/auth');
const automationService = require('./services/automation.service');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    // Allow any vercel.app or railway.app domain
    if (allowed.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      return callback(null, true);
    }
    callback(null, true); // Allow all for now, restrict later
  },
  credentials: true,
}));
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
app.use('/api/export', authenticate, requireRole('owner'), require('./routes/export.routes'));

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ ProntoBella API corriendo en http://localhost:${PORT}`);
});

// Daily backup — runs every 24 hours
const exportService = require('./services/export.service');
const fs = require('fs');
const path = require('path');

async function runDailyBackup() {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const { buffer, clients, visits, procedures } = await exportService.generateBackup();
    const filename = `prontobella_backup_${new Date().toISOString().split('T')[0]}.xlsx`;
    fs.writeFileSync(path.join(backupDir, filename), Buffer.from(buffer));

    // Keep only last 30 backups
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.xlsx')).sort();
    while (files.length > 30) {
      fs.unlinkSync(path.join(backupDir, files.shift()));
    }

    console.log(`Backup completado: ${filename} (${clients} clientes, ${visits} visitas, ${procedures} procedimientos)`);
  } catch (err) {
    console.error('Error en backup diario:', err.message);
  }
}

// Run backup on startup and every 24 hours
runDailyBackup();
setInterval(runDailyBackup, 24 * 60 * 60 * 1000);

// Automation engine — run on startup and every hour
automationService.evaluateAndQueue()
  .then((r) => console.log('Automatizaciones iniciales:', r))
  .catch((err) => console.error('Error en automatizaciones:', err.message));

setInterval(() => {
  automationService.evaluateAndQueue()
    .then((r) => console.log('Automatizaciones evaluadas:', r))
    .catch((err) => console.error('Error en automatizaciones:', err.message));
}, 60 * 60 * 1000); // Every hour
