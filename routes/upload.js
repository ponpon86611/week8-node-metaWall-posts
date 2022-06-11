const express = require('express');
const router = express.Router();
const appError = require('../services/appError');
const handleErrorAsync = require('../services/handleErrorAsync');
const sizeOf = require('image-size');
const upload = require('../services/image');
const { ImgurClient } = require('imgur');
const {isAuth,generateSendJWT} = require('../services/auth');

router.post('/', isAuth, upload, handleErrorAsync(async (req, res, next) => {
    //multer 會在req上夾帶filess
    if(!req.files.length) {
        return appError(400, '未上傳檔案', next);
    }

    const client = new ImgurClient({
        clientId: process.env.IMGUR_CLIENTID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET,
        refreshToken: process.env.IMGUR_REFRESH_TOKEN
    });

    const response = await client.upload({
        image: req.files[0].buffer.toString('base64'),
        type: 'base64',
        album: process.env.IMGUR_ALBUM_ID
    });

    res.status(200).json({
        status: "success",
        imgUrl: response.data.link
    })
}))

module.exports = router;;