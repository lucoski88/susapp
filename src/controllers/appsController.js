const App = require('../models/appModel');

const defaultLimit = 10;
const maxLimit = 100;

exports.find = async (req, res, next) => {
    const { appName, appId, rating, free } = req.query;
    const filter = {};

    if (appName) filter['App Name'] = appName;
    if (appId) filter['App Id'] = appId;
    if (rating) filter['Rating'] = rating;
    if (free) filter['Free'] = free;

    let limit = req.query.limit;
    if (limit) {
        limit = Math.min(maxLimit, limit);
    } else {
        limit = defaultLimit;
    }

    const result = await App.find(filter).limit(limit);
    res.json(result);
};

exports.create = async (req, res, next) => {
    const app = new App(req.body);
    try {
        const doc = await app.save();
        res.json(doc);
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            res.status(409).json({ error: 'Duplicate entry. A record with the same unique key already exists.' });
        } else {
            next(err);
        }
    }
};