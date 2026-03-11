const automationsQ = require('../queries/automations.queries');
const automationService = require('../services/automation.service');

exports.getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await automationsQ.findAll(status);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getPending = async (req, res, next) => {
  try {
    const result = await automationsQ.findPending();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.markSent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await automationsQ.markSent(id);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Automatización no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.runNow = async (req, res, next) => {
  try {
    const results = await automationService.evaluateAndQueue();
    res.json({ message: 'Automatizaciones evaluadas', results });
  } catch (err) {
    next(err);
  }
};
