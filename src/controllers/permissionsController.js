const model = require('../models/permissionModel')

exports.get = async (req, res, next) => {
    const result = await model.findOne();
    res.json(result);
};
