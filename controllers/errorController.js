const AppError = require("../utils/appError");

const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (error) => {
    const message = `Duplicate field value ${error.keyValue.name}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = (error) => {
    const errors = Object.values(error.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please login again!', 401);
const handleJWTEpiredError = () => new AppError('Your token has expired! Please login again.', 401);

const sendErrorDev = (error, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(error.statusCode).json({
            status: error.status,
            error: error,
            message: error.message,
            stack: error.stack
        });
    }
    // Rendered website
    console.error('Error ', error);
    return res.status(error.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: error.message
    });
}

const sendErrorProd = (error,req, res) => { 
    // API
    if (req.originalUrl.startsWith('/api')) {
        // operational, trusted error: send message to client
        if (error.isOperational) {
            return res.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        }
        // programming or other unknown error: don't leak error details
        // 1) Log the error    
        console.error('Error ', error);

        // 2) Send a generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    // Rendered website
    // operational, trusted error: send message to client
    if (error.isOperational) {
        return res.status(error.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: error.message
        });
    }
    // programming or other unknown error: don't leak error details
    // 1) Log the error    
    console.error('Error ', error);

    // 2) Send a generic message
    return res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Try again later!'
    });
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let err = {...error};
        err.message = error.message;

        if (error.name === 'CastError') err =  handleCastErrorDB(err);
        if (error.code === 11000) err = handleDuplicateFieldsDB(err);
        if (error.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (error.name === 'JsonWebTokenError') err = handleJWTError();
        if (error.name === 'TokenExpiredError') err = handleJWTEpiredError();

        sendErrorProd(err, req, res);
    }
};