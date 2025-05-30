const app = require('./app');
const port = 3000;

/*
 * Start listening on the specified port
 */
app.listen(port, () => {
    console.log("Listening on port " + port);
});