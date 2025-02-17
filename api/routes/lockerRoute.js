const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');

router.get('/', lockerController.getAllLockers);
router.get('/:id', lockerController.getLockerById);
module.exports = router;