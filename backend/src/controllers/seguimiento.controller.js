const seguimientoQ = require('../queries/seguimiento.queries');

exports.getFollowUpList = async (req, res, next) => {
  try {
    const result = await seguimientoQ.getFollowUpList();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getFollowUpStats = async (req, res, next) => {
  try {
    const result = await seguimientoQ.getFollowUpStats();
    res.json(result.rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.logFollowUp = async (req, res, next) => {
  try {
    const { clientId, messageType, messageText } = req.body;
    if (!clientId || !messageType) {
      return res.status(400).json({ error: 'clientId y messageType son requeridos' });
    }
    const result = await seguimientoQ.logFollowUp(clientId, messageType, messageText || '');
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
