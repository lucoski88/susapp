const express = require('express');
const router = express.Router();
const appsController = require('../controllers/appsController');

router.get('/', appsController.get);
router.post('/create', () => {});
router.post('/update', () => {});
router.post('/delete', () => {});

module.exports = router;