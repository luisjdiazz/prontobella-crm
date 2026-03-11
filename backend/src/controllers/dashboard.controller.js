const dashboardQ = require('../queries/dashboard.queries');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await dashboardQ.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

exports.getPipeline = async (req, res, next) => {
  try {
    const pipeline = await dashboardQ.getPipeline();
    res.json(pipeline);
  } catch (err) {
    next(err);
  }
};

exports.getRetouches = async (req, res, next) => {
  try {
    const result = await dashboardQ.getUpcomingRetouches();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getPopularServices = async (req, res, next) => {
  try {
    const result = await dashboardQ.getPopularServices();
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
