const express = require('express');
const router = express.Router();
const lockerController = require('../controllers/lockerController');


router.get('/getLockerAll', lockerController.getAllLockers);
router.get('/getLockerById/:id', lockerController.getLockerById);


router.post('/createLocker', lockerController.createLocker);
router.put('/updateLocker/:id', lockerController.updateStatusLocker);


// reservetion 
router.get('/getRsvAll',lockerController.getRsvAll);
router.get('/getRsvByUserId/:user_id',lockerController.getRsvByUserId);

router.post('/reservetionLocker', lockerController.reservationLocker);
router.post('/cancelreservationLocker', lockerController.cancelreservationLocker);
// board
router.post('/comparePassword', lockerController.comparePassword);

//unlockapp
router.post('/unlockByApp', lockerController.unlockByApp);


module.exports = router;