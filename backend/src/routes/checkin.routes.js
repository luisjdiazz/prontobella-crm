const router = require('express').Router();
const ctrl = require('../controllers/checkin.controller');

router.post('/', ctrl.checkin);

module.exports = router;
