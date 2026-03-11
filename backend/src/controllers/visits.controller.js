const visitsQ = require('../queries/visits.queries');

exports.getByClient = async (req, res, next) => {
  try {
    const { client_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id requerido' });
    }
    const result = await visitsQ.findByClient(client_id);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getToday = async (req, res, next) => {
  try {
    const result = await visitsQ.findToday();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date requerido (YYYY-MM-DD)' });
    }
    const result = await visitsQ.findByDate(date);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { client_id, notes, created_by } = req.body;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id requerido' });
    }
    const result = await visitsQ.create({ client_id, notes, created_by });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
