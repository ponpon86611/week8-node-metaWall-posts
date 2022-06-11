const express = require('express');
const router = express.Router();
const postsController = require('../controller/postsConteoller');
const handleErrorAsync = require('../services/handleErrorAsync');

router.get('/posts', handleErrorAsync(postsController.getPosts));

router.post('/posts', handleErrorAsync(postsController.addPost));

router.delete('/posts', handleErrorAsync(postsController.deletePostAll));

router.delete('/posts/:id', handleErrorAsync(postsController.deletePostOne));

router.patch('/posts/:id', handleErrorAsync(postsController.patchPost));

module.exports = router;