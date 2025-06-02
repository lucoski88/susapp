const App = require('../models/appModel');
const Permission = require("../models/permissionModel");

const defaultLimit = 10;
const maxLimit = 100;

exports.get = async (req, res, next) => {
    const { appName, rating } = req.query;
    const filter = {};

    if (appName) filter['App Name'] = appName;
    if (rating) filter['Rating'] = rating;

    let limit = req.query.limit;
    if (limit) {
        limit = Math.min(maxLimit, limit);
    } else {
        limit = defaultLimit;
    }

    const result = await App.find(filter).limit(limit);
    res.json(result);
};