const dotenv = require('dotenv');
dotenv.config({
    path: './config.env'
});
const mongoose = require('mongoose');

// Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(error.name, error.message);
    process.exit(1);
});

// Database
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(() => console.log("DB connection successful"));