const mongoose = require('mongoose');

// 定義欄位驗證的錯誤訊息請在此設定
const userMessage = {
    name: {
        validError: '請輸入您的名字'
    },
    email: {
        validError: '請輸入您的 Email'
    },
    password: {
        validError: '請輸入密碼'
    }
}

const userSchema = new mongoose.Schema(
  {
      name: {
        type: String,
        required: [true, userMessage.name.validError]
      },
      email: {
        type: String,
        required: [true, userMessage.email.validError],
        unique: true,
        lowercase: true,
        select: false
      },
      photo: String,
      sex: {
        type: String,
        enum: ['male','female']
      },
      password: {
        type: String,
        required: [true, userMessage.password.validError],
        minlength: 8,
        select: false
      },
      createdAt: {
        type: Date,
        default: Date.now,
        select: false
      }
  },
  {
      versionKey: false
  }
);

const User = mongoose.model('user', userSchema);

module.exports = User;