/**
 * ==============================================================================
 * Auth Routes: Admin Login & Registration
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.loginOrRegister);
router.post('/login', authController.loginOrRegister);
router.post('/register', authController.loginOrRegister);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/', authController.getSessionHealth);

module.exports = router;
