const express = require('express');
const deleteRouter = express.Router();

deleteRouter.get('/', (req, res) => {
    res.status(200).send('Deleted');
});

module.exports = deleteRouter;