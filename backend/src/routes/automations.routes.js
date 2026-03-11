const router = require('express').Router();
const ctrl = require('../controllers/automations.controller');

router.get('/', ctrl.getAll);
router.get('/pending', ctrl.getPending);
router.post('/run', ctrl.runNow);
router.post('/:id/mark-sent', ctrl.markSent);

module.exports = router;
