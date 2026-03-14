const router = require('express').Router();
const exportService = require('../services/export.service');

// GET /api/export/clients?period=today|week|month&minVisits=1&maxVisits=5
router.get('/clients', async (req, res, next) => {
  try {
    const { period, minVisits, maxVisits } = req.query;
    const { buffer, count } = await exportService.exportClients({ period, minVisits, maxVisits });

    const label = period || 'todos';
    const filename = `clientes_${label}_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

// GET /api/export/backup — full backup (clients + visits + procedures)
router.get('/backup', async (req, res, next) => {
  try {
    const { buffer } = await exportService.generateBackup();
    const filename = `prontobella_backup_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
