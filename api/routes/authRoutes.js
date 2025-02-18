const express = require('express');
const router = express.Router();
const authenticationController = require('../controllers/authController');

router.post('/register', (req, res) => {
    res.send('Register');
});

router.post('/login', authenticationController.login,);

module.exports = router;