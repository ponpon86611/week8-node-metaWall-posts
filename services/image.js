const multer = require('multer');
const path = require('path');
const appError = require('./appError');

/**
 * multer(opts)
 * dest or storage : 文件儲存的位置
 * fileFilter : 設定能接受的檔案類型
 * limits : 上傳檔案的大小限制
 */
const upload = multer({
    limits: {
        fileSize: 2*1024*1024 //限制為 2MB
    },
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if(ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            //呼叫自定義的錯誤，避免只是因為上傳了錯誤的格式而報出重大錯誤的資訊...
            return appError(400,'檔案格式有誤，僅能上傳 jpg、png 和 jpeg 格式的檔案!', cb);
        }
        cb(null, true); // 第二個參數為 true，代表可進入下一個 middleware
    }
}).any();

module.exports = upload;