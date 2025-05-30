const express = require('express');
const app = express();

const createRouter = require('./routes/createRoute')

app.use('/create', createRouter);

/*
 * Fallback for not handled paths
 */
app.use((req, res) => {
    res.sendStatus(404);
});

module.exports = app;