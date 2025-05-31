const { getDb } = require('../config/db');

exports.get = async (req, res, next) => {
    try {
        let db = getDb();
        let collection = db.collection('permissions');
        res.json(await collection.findOne());
    } catch(err) {
        return next(err);
    }
};
