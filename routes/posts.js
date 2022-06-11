const express = require('express');
const router = express.Router();
const postsController = require('../controller/postsConteoller');
const handleErrorAsync = require('../services/handleErrorAsync');

//取得所有貼文
router.get('/posts', handleErrorAsync(postsController.getPosts));

//新增貼文
router.post('/posts', handleErrorAsync(postsController.addPost));

//刪除所有貼文
router.delete('/posts', handleErrorAsync(postsController.deletePostAll));

//刪除單筆貼文
router.delete('/posts/:id', handleErrorAsync(postsController.deletePostOne));

//修改貼文
router.patch('/posts/:id', handleErrorAsync(postsController.patchPost));

module.exports = router;