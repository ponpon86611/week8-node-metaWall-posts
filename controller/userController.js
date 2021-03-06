const User = require('../models/userModel');
const Post = require('../models/postsModel');
const resHandler = require('../services/resHandler');
const appError = require('../services/appError');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {generateSendJWT} = require('../services/auth');

const mongoose = require('mongoose');



const userController = {
    //註冊
    async signUp(req, res, next) {
        let {name, email, password} = req.body;
        /**歸納步驟
         * 1.驗證註冊頁面欄位是否都有填寫(換言之不可為空)
         * 2.第一步驗證通過後，再來驗證格式是否符合
         * 3.第二部驗證通過後，要建立新的user到資料庫中，密碼不可為明碼
         */
        if( !name  || name.trim() === '' || !email || email.trim() === '' || !password || password.trim() === '') {
            return appError(400, '欄位未正確填寫，不可以為空', next);
        }

        if(!validator.isEmail(email)) {
            return appError(400, 'email 格式不正確，請填寫正確 email', next);
        }
            
        email = email.trim();
        //先確認email是否已有註冊過，避免報出 重大錯誤: MongoServerError: E11000 duplicate key error collection: week6.users index: email_1 dup key: { email: "apple0203@gmail.com" }
        const userCheck = await User.findOne({email});
        if(userCheck) {
            return appError(400, 'email已使用過', next);
        }      

        if(!validator.isLength(password, {min: 8})) {
            return appError(400, '密碼至少需要 8 碼', next);
        }
        name = name.trim();
        
        password = password.trim();

        password = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            password,
            name
        });
        //註冊完成會進入產生token為設計為註冊後將幫使用者登入，故產生token，若設計為註冊後依然要使用者自行登入則不需要產生token
        generateSendJWT(user, 201, res);
    },
    //登入
    async signIn(req, res, next) {
        let {email, password} = req.body;

        if(!email || email.trim() === '' || !password || password.trim() === '') {
            return appError(400, '欄位未正確填寫，不可以為空', next);
        }

        if(!validator.isEmail(email)) {
            return appError(400, 'email 格式不正確，請填寫正確 email', next);
        }

        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return appError(400, '帳號或密碼錯誤', next);
        }

        const auth = await bcrypt.compare(password, user.password);
        if(!auth) {
            return appError(400, '帳號或密碼錯誤', next);
        }
        generateSendJWT(user, 200, res);
    },
    //修改密碼
    async updatePassword(req, res, next) {
        let {password, confirmPassword} = req.body;
        if(password !== confirmPassword) {
            return appError(400, '密碼不一致', next);
        }

        if(!validator.isLength(password.trim(), {min: 8})) {
            return appError(400, '密碼至少需要 8 碼', next);
        }

        password = await bcrypt.hash(password.trim(), 12);
        const user = await User.findByIdAndUpdate(req.user.id, {
            password: password
        });

        generateSendJWT(user, 200, res);
    },
    //取得個人資料
    async getProfile(req, res, next) {
        resHandler.successHandler(res, req.user, 200);
    },
    //更新個人資料
    async updateProfile(req, res, next) {
        let {name, photo, sex} = req.body;
        if(!name || name.trim() === '') {
            return appError(400, '暱稱未正確填寫，不可以為空', next);
        }
        const updateUser = await User.findByIdAndUpdate(req.user.id, 
            {
                name,
                photo,
                sex
            },
            { new: true }
        )
        resHandler.successHandler(res, updateUser, 200);
    },
    //追蹤朋友
    async follow(req, res, next) {  
        const userId = req.params.id;
        /**
         * 1.ID格式檢查 及 是否存在
         * 2.不能追蹤自己，故須先判斷
         */
        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(userId)) {
            return appError(400, `ID格式不符`, next);
        }

        const userExist = await User.findById(userId).exec();
        if( !userExist ) {
            return appError(400, `使用者不存在喔`, next);
        }

        if(userId === req.user.id) {
            return appError(401, `無法追蹤自己`, next);
        }

        await User.updateOne(
            {
                _id: req.user.id,
                'following.user': {$ne: userId}
            },
            {
                $addToSet: {following: {user: userId}}
            }
        );

        await User.updateOne(
            {
                _id: userId,
                'followers.user': {$ne: req.user.id}
            },
            {
                $addToSet: { followers: {user: req.user.id}}
            }
        );

        resHandler.successHandler(res, '已成功追蹤', 200);
    },
    //取消追蹤他人
    async unfollow(req, res, next) {
        const userId = req.params.id;
        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(userId)) {
            return appError(400, `ID格式不符`, next);
        }

        const userExist = await User.findById(userId).exec();
        if( !userExist ) {
            return appError(400, `使用者不存在喔`, next);
        }

        if(userId === req.user.id) {
            return appError(401, `無法取消追蹤自己`, next);
        }

        await User.updateOne(
            {
                _id: req.user.id
            },
            {
                $pull: {following: {user: userId}}
            }
        );

        await User.updateOne(
            {
                _id: userId
            },
            {
                $pull: {followers: {user: req.user.id}}
            }
        );

        resHandler.successHandler(res, '已成功取消追蹤', 200);
    },
    //取得個人追蹤名單
    async getFollowing(req, res, next) {
        const userId = req.user.id;
        const followingList = await User.findById(userId).populate({
            path: 'following.user',
            select: 'name _id'
        })

        resHandler.successHandler(res, followingList, 200);
    },
    //取得個人按讚列表
    async getLikeList(req, res, next) {
        const likeList = await Post.find({
            likes: [req.user.id]
        }).populate({
            path: 'user',
            select: 'name _id'
        });

        resHandler.successHandler(res, likeList, 200);
    }
}

module.exports = userController;