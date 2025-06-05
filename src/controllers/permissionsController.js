const Permission = require('../models/permissionModel')

const defaultLimit = 10;
const maxLimit = 100;

exports.find = async (req, res, next) => {
    const { appId, appName, types } = req.query;
    const filter = {};
    if (appId) filter.appId = appId;
    if (appName) filter.appName = appName;
    if (types) {
        let typesArray;
        if (typeof types === 'string') {
            typesArray = types.split(',').map(t => t.trim());
        } else if (Array.isArray(types)) {
            typesArray = types;
        } else {
            typesArray = [types];
        }
        filter.allPermissions = {
            $elemMatch: {
                type: { $in: typesArray }
            }
        };
    }

    let limit = req.query.limit;
    if (limit) {
        limit = Math.min(maxLimit, limit);
    } else {
        limit = defaultLimit;
    }

    const result = await Permission.find(filter).limit(limit);
    res.json(result);
};

exports.create = async (req, res, next) => {
    try {
        const permissionDetail = new Permission(req.body);
        const doc = await permissionDetail.save();
        res.status(201).json(doc);
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            res.status(409).json({ error: 'Duplicate entry. A record with the same unique key already exists.' });
        } else if (err.name === 'StrictModeError') {
            const allowedFields = Object.keys(Permission.schema.paths);
            const allowed = allowedFields.filter(field => !['_id'].includes(field));
            const incomingFields = Object.keys(req.body);
            const extraFields = incomingFields.filter(field => !allowed.includes(field));
            res.status(400).json({ error: ('Request contains unknown fields: ' + extraFields)});
        }  else if (err.name === 'ValidationError' && req.body.appId === undefined) {
            res.status(400).json({ error: 'Missing \'appId\' field' });
        } else {
            next(err);
        }
    }
};

exports.update = async (req, res, next) => {
    const { appId } = req.query;
    if (!appId) {
        res.status(400).json({ error: 'Missing \'appId\' field' });
    }

    const filter = { appId: appId };

    const result = await Permission.updateMany(filter, req.body);
    res.json(result);
};

exports.delete = async (req, res, next) => {
    const { appId, appName } = req.query;
    const filter = {};
    if (appId) filter.appId = appId;
    if (appName) filter.appName = appName;

    const result = await Permission.deleteMany(filter);
    res.json(result);
};

exports.getAllTypes =  async (req, res, next) => {
    const result = await Permission.distinct('allPermissions.type');
    const filtered = await result.filter(type => type !== null && type !== undefined);
    res.json(filtered);
};