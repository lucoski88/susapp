const model = require('../models/appModel');

exports.get = async (req, res, next) => {
    const result = await model.findOne({},
        {},
        null);
    res.json(result);
};