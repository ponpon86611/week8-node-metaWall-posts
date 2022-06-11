const Post = require('../models/postsModel');
const User = require('../models/userModel');
const resHandler = require('../services/resHandler');
const appError = require('../services/appError');
//因本週目標是將 try catch 拿掉，故在刪除或修改時需判斷 id 是否符合 mongoDB 的 ObjectId，故引入
const mongoose = require('mongoose');

const postController = {
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
     async addPost(req, res, next) {
        const newPost = req.body;
        if(!newPost.user || !newPost.content ){ 
            return appError(400, 'ID與內容須填寫!', next);
        }

        //不符合 ObjectId 格式
        if( ! mongoose.isObjectIdOrHexString(newPost.user)) {
            return appError(400, `ID 格式不符...`, next);
        }

        //確認是否有該user， res: null 不存在
        const userInfo = await User.findById(newPost.user).exec();
        if(!userInfo) {
            return appError(400, 'ID 不存在!', next);
        }

        const post = await Post.create(newPost);
        resHandler.successHandler(res, '貼文新增成功', 200);
    },
    async deletePostAll(req, res, next) {
        if(req.url === '/posts/') return appError(404, `無此頁面...`, next);
        await Post.deleteMany({});
        // const posts = await Post.find();
        resHandler.successHandler(res, [], 200); 
    },
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