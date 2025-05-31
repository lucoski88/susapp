const express = require('express');
const router = express.Router();

router.get('/');
router.post('/create');
router.post('/update');
router.post('/delete');

module.exports = router;