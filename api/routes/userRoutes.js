const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const userController = require('../controllers/userController');

router.get('/getUserAll',verifyToken ,userController.getUserAll);
router.get('/getUserById:user_id',userController.getUserById)

module.exports = router;