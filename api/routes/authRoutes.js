const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authController');



router.post('/login', authenticationController.login,);
router.post('/register', authenticationController.register);
router.post('/logout', authenticationController.logout);

module.exports = router;