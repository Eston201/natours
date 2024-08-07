require('./db');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('../utils/appError');
// Controllers
const globalErrorHandler = require('../controllers/errorController');
const tourRouter = require('../routes/tourRoutes');
const userRouter = require('../routes/userRoutes');
const reviewRouter = require('../routes/reviewRoutes');
const viewRouter = require('../routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '..', 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({extended: true, limit: '10kb'})); // To handle html form submission -> data in body
app.use(cookieParser());

// Data sanitizations against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization again XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 
    'ratingsQuantity', 
    'ratingsAverage', 
    'maxGroupSize', 
    'difficulty', 
    'price'
  ]
}));

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// URL that does NOT exist
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error handling middleware
app.use(globalErrorHandler);

// Start the server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App is listening on port ${port}...`);
});

// global unhandled rejections
process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(error.name, error.message);
  server.close(() => {
      process.exit(1);
  });
});

module.exports = app;