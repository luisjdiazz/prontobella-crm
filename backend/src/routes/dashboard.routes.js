const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');

router.get('/stats', ctrl.getStats);
router.get('/pipeline', ctrl.getPipeline);
router.get('/retoques', ctrl.getRetouches);
router.get('/servicios', ctrl.getPopularServices);

module.exports = router;
