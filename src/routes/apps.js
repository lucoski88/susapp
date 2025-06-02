const express = require('express');
const router = express.Router();
const appsController = require('../controllers/appsController');

router.get('/', appsController.find);
router.post('/create', () => {});
router.post('/update', () => {});
router.post('/delete', () => {});

router.use((err, req, res, next) => {
    res.sendStatus(500);
});

module.exports = router;