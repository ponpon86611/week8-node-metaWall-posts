const jwt = require('jsonwebtoken');
const handleErrorAsync = require('../services/handleErrorAsync');
const appError = require('./appError');
const User = require('../models/userModel');

const generateSendJWT= (user, statusCode, res)=>{
    // 產生 JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRES_DAY
    });
    
    user.password = undefined;
    res.status(statusCode).json({
      status: 'success',
      user:{
        token,
        name: user.name
      }
    });
}

//驗證
const isAuth = handleErrorAsync( async (req, res, next) => {
    //需確認token是否存在
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return next(appError(401,'您尚未登入，請先登入', next));
    }
    //驗證 token 的正確性
    const decode = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if(err) {
                reject(err)
            } else {
                resolve(payload)
            }
        })
    })
  
    const currentUser = await User.findById(decode.id);
    req.user = currentUser;
    next();
})

module.exports = {
    generateSendJWT,
    isAuth
}



