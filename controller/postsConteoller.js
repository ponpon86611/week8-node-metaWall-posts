const Post = require('../models/postsModel');
const User = require('../models/userModel');
const resHandler = require('../services/resHandler');
const appError = require('../services/appError');
//因本週目標是將 try catch 拿掉，故在刪除或修改時需判斷 id 是否符合 mongoDB 的 ObjectId，故引入
const mongoose = require('mongoose');

const postController = {
    //取得所有貼文
     async getPosts(req, res, next) {
        //排序，預設為 DESC(由新到舊)，若網址有帶上 timeSort=asc 則為 ASC (由舊到新)
        const timeSort = req.query.timeSort == "asc" ? "createAt":"-createAt"
        const searchKeyword = req.query.q !== undefined ? {"content": new RegExp(req.query.q)} : {};
        const posts = await Post.find(searchKeyword).populate({
            path: 'user',
            select: 'name photo'
        }).sort(timeSort);
        resHandler.successHandler(res, posts, 200);
    },
    //取得單一貼文
    async getSinglePost(req, res, next) {
        /**
         * 1.確認貼文id是否符合格式
         * 2.確認id是否存在於table內
         */
        const postId = req.params.id;
        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(postId)) {
            return appError(400, `ID 格式不符...`, next);
        }

        const postIdExist = await Post.findById(postId).exec();
        if(!postIdExist) {
            return appError(400, `該貼文不存在喔...`, next);
        }

        const post = await Post.findById(postId).populate({
            path: 'user',
            select: 'name photo'
        })
        resHandler.successHandler(res, post, 200);
    },
    async getSelfPosts(req, res, next) {
        const userId = req.params.id;
        /**
         * 1.確認貼文id是否符合格式
         * 2.確認id是否存在於table內
         */
        if( ! mongoose.isObjectIdOrHexString(userId)) {
            return appError(400, `ID 格式不符...`, next);
        }

        //多一層判斷
        if(userId !== req.user.id) {
            //403 Forbidden  用戶端並無訪問權限，例如未被授權，所以伺服器拒絕給予應有的回應。不同於 401，伺服端知道用戶端的身份
            return appError(403, `您沒有權限...`, next);
        }

        const selfPosts = await Post.find({user:userId}).populate({
            path: 'user',
            select: 'name photo'
        });

        resHandler.successHandler(res, selfPosts, 200);
    },
    //新增貼文
    async addPost(req, res, next) {
        // const newPost = req.body;
        const {content, user, imgUrl} = req.body;
        if(!user || !content ){ 
            return appError(400, 'ID與內容須填寫!', next);
        }

        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(user)) {
            return appError(400, `ID 格式不符...`, next);
        }

        //確認是否有該user， res: null 不存在
        const userInfo = await User.findById(user).exec();
        if(!userInfo) {
            return appError(400, 'ID 不存在!', next);
        }

        const post = await Post.create({content, user, imgUrl});
        resHandler.successHandler(res, post, 200);
    },
    //刪除所有貼文
    async deletePostAll(req, res, next) {
        if(req.url === '/posts/') return appError(404, `無此頁面...`, next);
        await Post.deleteMany({});
        // const posts = await Post.find();
        resHandler.successHandler(res, [], 200); 
    },
    //刪除單筆貼文
     async deletePostOne(req, res, next) {
        //須考慮到傳入不存在的id 或是 不符合格式的id EX: 125drg
        const deletePostId = req.params.id;
        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(deletePostId)) {
            return appError(400, `刪除貼文失敗...`, next);
        }

        const posts = await Post.findByIdAndDelete(deletePostId);
        if(posts) {
            const posts = await Post.find();
            resHandler.successHandler(res, posts, 200);
        } else {
            // posts is null 代表傳入符合格式的16進制的id，但不存在於DB中，故會回傳null
            return appError(400, `刪除貼文失敗，該貼文不存在`, next);
        }    
    },
    //修改貼文
     async patchPost(req, res, next) {
        // const updatePost = req.body;
        const {content, image} = req.body;
        const updatePostId = req.params.id;  

        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(updatePostId)) {
            return appError(400, `修改貼文失敗，要修改的貼文ID格式不符`, next);
        }

        if( !content || (typeof content === 'string' && !content.trim()) ) {
            return appError(400, '貼文內容須填寫', next);
        } else if (typeof content !== 'string') {
            return appError(400, '貼文內容格式錯誤', next);
        }

        const updatePost = {content: content.trim()};
        if( image ) {
            updatePost.image = image;
        }

        const updatePostRes = await Post.findByIdAndUpdate(updatePostId, updatePost);
        if( updatePostRes ) {
            const posts = await Post.find();
            resHandler.successHandler(res, posts, 200);
        } else {
            // posts is null 代表傳入符合格式的16進制的id，但不存在於DB中，故會回傳null
            return appError(400, '修改貼文失敗，該貼文不存在', next);
        }       
    }
}

module.exports = postController;