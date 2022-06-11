const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const handleErrorAsync = require('../services/handleErrorAsync');
const {isAuth} = require('../services/auth');


router.post('/sign_up', handleErrorAsync(userController.signUp));

router.post('/sign_in', handleErrorAsync(userController.signIn));

router.post('/updatePassword', isAuth, handleErrorAsync(userController.updatePassword));

router.get('/profile', isAuth, handleErrorAsync(userController.getProfile));

router.patch('/profile', isAuth, handleErrorAsync(userController.updateProfile));

module.exports = router;
