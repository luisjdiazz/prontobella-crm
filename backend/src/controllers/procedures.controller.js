const proceduresQ = require('../queries/procedures.queries');
const { RETOUCH_INTERVALS } = require('../utils/constants');

exports.getByClient = async (req, res, next) => {
  try {
    const { client_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ error: 'client_id requerido' });
    }
    const result = await proceduresQ.findByClient(client_id);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const result = await proceduresQ.findUpcoming(days);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { client_id, visit_id, procedure_type } = req.body;
    if (!client_id || !procedure_type) {
      return res.status(400).json({ error: 'client_id y procedure_type requeridos' });
    }

    const interval = RETOUCH_INTERVALS[procedure_type];
    if (!interval) {
      return res.status(400).json({ error: 'Tipo de procedimiento inválido' });
    }

    // Calculate next retouch date
    const nextRetouch = new Date();
    nextRetouch.setDate(nextRetouch.getDate() + interval.days);

    const result = await proceduresQ.create({
      client_id,
      visit_id,
      procedure_type,
      next_retouch: nextRetouch,
    });

    res.status(201).json({
      ...result.rows[0],
      retouch_label: interval.label,
    });
  } catch (err) {
    next(err);
  }
};
