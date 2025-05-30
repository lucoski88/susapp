const app = require('./app');
const { connectDb, getDb } = require('./config/db');

const port = 3000;

/*
 * Start listening on the specified port
 */
async function startServer() {
    /*
     * blocking until database connection is established correctly or
     * timeout for database connection occurs
     */
    await connectDb();
    const db = getDb();
    if (db) {
        console.log('Database initialized');
    } else {
        console.log("Couldn't initialize database");
        process.exit(1);
    }

    app.listen(port, () => {
        console.log("Listening on port " + port);
    });
}

startServer();