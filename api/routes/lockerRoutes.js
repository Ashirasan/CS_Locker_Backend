const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');

router.get('/', lockerController.getAllLockers);
router.get('/:id', lockerController.getLockerById);
router.post('/createLocker', lockerController.createLocker);
router.put('/updateLocker/:id', lockerController.updateStatusLocker);
router.post('/reservetionLocker', lockerController.reservationLocker);
module.exports = router;