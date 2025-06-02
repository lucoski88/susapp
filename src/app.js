const express = require('express');
const app = express();

const appsRouter = require('./routes/apps');
const permissionsRouter = require('./routes/permissions');

app.use(express.json());
app.use('/apps', appsRouter);
app.use('/permissions', permissionsRouter);

/*
 * Fallback for not handled paths
 */
app.use((req, res) => {
    res.sendStatus(404);
});

module.exports = app;