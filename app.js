const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const conn = require('./connection');

const  resHandler = require('./services/resHandler');

//router
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const uploadRouter = require('./routes/upload');

const app = express();

// 程式出現重大錯誤時
process.on('uncaughtException', err => {
    // 將錯誤記錄起來，等服務都處理完後，停掉該 process
    console.error('Uncaughted Exception！')
    console.error(err);
    process.exit(1);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(postsRouter);
app.use('/upload', uploadRouter);

const resErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        message: err.message,
        error: err,
        stack: err.stack
    });
}

const resErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            message: err.message
        });
    } else {
        // log 紀錄
        console.error('重大錯誤:', err);
        res.status(500).json({
            status: "error",
            message: '系統錯誤，請洽系統管理員'
        });
    }
}

// 404 not found.
app.use((req, res, next) => {
    resHandler.errorHandler(res, 'page not found...', 404)
})

// 統一處理app中有丟到middleware且參數為error型別
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    //env for dev
    if(process.env.NODE_ENV === 'dev') {
        return resErrorDev(err, res);
    }

    //env for production
    if(err.name === 'ValidationError') {
        err.message = '欄位填寫不正確，請重新輸入';
        err.isOperational = true;
        err.statusCode = 400; // 因這邊為自己能捕捉到確切的錯誤，故應該回傳狀態碼400而非500
        return resErrorProd(err, res);
    }

    //env for production if json format error
    if(err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        err.message = '資料格式有誤:' + err.message;
        err.isOperational = true;
        return resErrorProd(err, res);
    }
    resErrorProd(err, res);
})

// 未捕捉到的 catch 
process.on('unhandledRejection', (reason, promise) => {
    console.error('未捕捉到的 rejection：', promise, 'cause：', reason);
});

module.exports = app;
