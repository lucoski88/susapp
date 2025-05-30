const express = require('express');
const updateRouter = express.Router();

updateRouter.get('/', (req, res) => {
    res.status(200).send('Updated');
});

module.exports = updateRouter;