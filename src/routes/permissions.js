const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');

router.get('/', permissionsController.find);
router.post('/create', permissionsController.create);
router.post('/update', permissionsController.update);
router.delete('/delete', permissionsController.delete);

router.use((err, req, res, next) => {
    res.sendStatus(500);
    console.error(err);
});

module.exports = router;