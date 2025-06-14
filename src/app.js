const express = require('express');
const app = express();

const appsRouter = require('./routes/apps');
const permissionsRouter = require('./routes/permissions');
const {join} = require("node:path");

// CORS headers to allow frontend requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


app.use(express.json());
app.use('/apps', appsRouter);
app.use('/permissions', permissionsRouter);

app.use(express.static(join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
});

/*
 * Fallback for not handled paths
 */
app.use((req, res) => {
    res.sendStatus(404);
});


module.exports = app;