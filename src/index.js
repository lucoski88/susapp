const app = require('./app');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = 'mongodb://localhost:27017/dio';

const port = 3000;

/*
 * Start listening on the specified port
 */
async function startServer() {
    /*
     * blocking until database connection is established correctly or
     * timeout for database connection occurs
     */
    try {
        await mongoose.connect(mongoDB);
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('Failed to connect to MongoDB');
        process.exit(1);
    }

    app.listen(port, () => {
        console.log("Listening on port " + port);
    });
}

startServer();