const Permission = require('../models/permissionModel')

exports.get = async (req, res, next) => {
    const result = await Permission.findOne();
    res.json(result);
};
