const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');


router.get('/', lockerController.getAllLockers);
router.get('/:id', lockerController.getLockerById);


router.post('/createLocker', lockerController.createLocker);
router.put('/updateLocker/:id', lockerController.updateStatusLocker);


// reservetion 
router.get('/getRsvLockerAll',lockerController.getRsvLockerAll);
router.post('/getRsvLockerUserID',lockerController.getRsvLockerUserID)
router.post('/reservetionLocker', lockerController.reservationLocker);
router.post('/cancelreservationLocker', lockerController.cancelreservationLocker);
// board
router.post('/comparePassword', lockerController.comparePassword);


module.exports = router;