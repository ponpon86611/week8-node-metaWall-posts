const resHander = {
    successHandler(res, data, statusCode = 200) {
        res.status(statusCode);
        res.send({
            "status": "success",
            data
        });
    },
    errorHandler(res, message, statusCode = 400) {
        res.status(statusCode);
        res.send({
            "status": "fail",
            message
        })
    }
}

module.exports = resHander;