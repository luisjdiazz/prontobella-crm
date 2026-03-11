const router = require('express').Router();
const ctrl = require('../controllers/visits.controller');

router.get('/', ctrl.getByClient);
router.get('/today', ctrl.getToday);
router.post('/', ctrl.create);

module.exports = router;
