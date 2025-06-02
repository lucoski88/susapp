const App = require('../models/appModel');
const Permission = require("../models/permissionModel");

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
    try {
        const app = new App(req.body);
        const doc = await app.save();
        res.json(doc);
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            res.status(409).json({ error: 'Duplicate entry. A record with the same unique key already exists.' });
        } else if (err.name === 'StrictModeError') {
            const allowedFields = Object.keys(App.schema.paths);
            const allowed = allowedFields.filter(field => !['_id'].includes(field));
            const incomingFields = Object.keys(req.body);
            const extraFields = incomingFields.filter(field => !allowed.includes(field));
            res.status(400).json({ error: ('Request contains unknown fields: ' + extraFields)});
        } else {
            next(err);
        }
    }
};

exports.update = async (req, res, next) => {
    
};

exports.delete = async (req, res, next) => {

};