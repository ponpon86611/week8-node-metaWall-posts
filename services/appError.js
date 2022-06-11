const appError = (statusCode, errMessage, next) => {
    const error = new Error(errMessage);
    error.statusCode = statusCode;
    error.isOperational = true;
    // if(next === undefined) {
    //     return error;
    // }
    next(error);
}

module.exports = appError;