const router = require('express').Router();
const ctrl = require('../controllers/seguimiento.controller');
const { FOLLOWUP_TEMPLATES } = require('../utils/constants');

router.get('/list', ctrl.getFollowUpList);
router.get('/stats', ctrl.getFollowUpStats);
router.get('/templates', (req, res) => res.json(FOLLOWUP_TEMPLATES));
router.post('/log', ctrl.logFollowUp);

module.exports = router;
