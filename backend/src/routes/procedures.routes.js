const router = require('express').Router();
const ctrl = require('../controllers/procedures.controller');

router.get('/', ctrl.getByClient);
router.get('/upcoming', ctrl.getUpcoming);
router.post('/', ctrl.create);

module.exports = router;
