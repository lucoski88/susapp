const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');

router.get('/', permissionsController.get);
router.post('/create', () => {});
router.post('/update', () => {});
router.post('/delete', () => {});

router.use((err, req, res, next) => {
    res.sendStatus(500);
});

module.exports = router;