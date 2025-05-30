const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('read');
});

module.exports = router;