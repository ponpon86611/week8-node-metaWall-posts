const mongoose = require('mongoose');

// 定義欄位驗證的錯誤訊息請在此設定
const postMessage = {
    userName: {
        validError: '貼文姓名必須填寫'
    },
    content: {
        validError: '貼文內容必須填寫'
    },
    userID: {
        validError: '貼文 ID 必須填寫'
    }
}

const postsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user', // 連接 user collection
            required: [true, postMessage.userID.validError]
        },
        image: {
            type: String,
            default: ''
        },
        createAt: {
            type:Date,
            default: Date.now,
            // select: false
        },
        content: {
            type: String,
            required: [true, postMessage.content.validError]
        },
        likes: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false
    }
)

const Post = mongoose.model('Post', postsSchema);

module.exports = Post;