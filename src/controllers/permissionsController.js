const { getDb } = require('../config/db');

exports.get = async (req, res, next) => {
    let db = getDb();
    let collection = db.collection('permissions');
    res.json(await collection.findOne());
};
