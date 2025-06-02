const Permission = require('../models/permissionModel')

const defaultLimit = 10;
const maxLimit = 100;

exports.get = async (req, res, next) => {
    const { appId, appName } = req.query;
    const filter = {};
    if (appId) filter.appId = appId;
    if (appName) filter.appName = appName;

    let limit = req.query.limit;
    if (limit) {
        Math.min(maxLimit, limit);
    } else {
        limit = defaultLimit;
    }

    const result = await Permission.find(filter).limit(limit);
    res.json(result);
};
