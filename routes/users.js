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

//追蹤其他人
router.post('/:id/follow', isAuth, handleErrorAsync(userController.follow));

//取消追蹤他人
router.delete('/:id/unfollow', isAuth, handleErrorAsync(userController.unfollow));

//取得個人追蹤名單
router.get('/following', isAuth, handleErrorAsync(userController.getFollowing));

//取得個人按讚列表
router.get('/getLikeList', isAuth, handleErrorAsync(userController.getLikeList));

module.exports = router;
