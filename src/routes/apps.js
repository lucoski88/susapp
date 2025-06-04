const express = require('express');
const router = express.Router();
const appsController = require('../controllers/appsController');

router.get('/', appsController.find);
router.post('/create', appsController.create);
router.post('/update', appsController.update);
router.delete('/delete', appsController.delete);
router.get('/categories', appsController.getAllCategories)
router.get('/contentRatings', appsController.getAllContentRatings)

router.use((err, req, res, next) => {
    res.sendStatus(500);
});

module.exports = router;