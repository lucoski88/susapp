const express = require('express');
const app = express();

const createRouter = require('./routes/createRoute');
const readRouter = require('./routes/readRoute');
const updateRouter = require('./routes/updateRoute');
const deleteRouter = require('./routes/deleteRoute');

app.use('/create', createRouter);
app.use('/read', readRouter);
app.use('/update', updateRouter);
app.use('/delete', deleteRouter);

/*
 * Fallback for not handled paths
 */
app.use((req, res) => {
    res.sendStatus(404);
});

module.exports = app;