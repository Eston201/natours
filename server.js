const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(error.name, error.message);
    process.exit(1);
});

dotenv.config({
    path: './config.env'
});
const app = require('./app');

// Database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(() => console.log("DB connection successful"));

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