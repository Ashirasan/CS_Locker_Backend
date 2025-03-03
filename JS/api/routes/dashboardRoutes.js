const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/data', dashboardController.data_dashboard);

module.exports = router;