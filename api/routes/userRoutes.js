const express = require('express');
const router = express.Router();
const verifyToken = require('../../middlewares/verifyToken');
const userController = require('../controllers/userController');

router.get('/',verifyToken ,userController.getAllUsers);
// router.get('/getUserById/:id', userController.getUserById);
module.exports = router;