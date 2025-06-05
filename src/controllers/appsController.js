const App = require('../models/appModel');

const defaultLimit = 10;
const maxLimit = 100;

exports.find = async (req, res, next) => {
    const { appName, appId, category,
        contentRating, developerId,
        minInstalls, maxInstalls,
        minPrice, maxPrice,
        minRating, maxRating } = req.query;
    const filter = {};

    if (appName) filter['App Name'] = appName;
    if (appId) filter['App Id'] = appId;
    if (category) filter['Category'] = category;
    if (contentRating) filter['Content Rating'] = contentRating;
    if (developerId) filter['Developer Id'] = developerId;
    if (minInstalls || maxInstalls) {
        filter['Maximum Installs'] = {};
        if (minInstalls) filter['Maximum Installs'].$gte = parseInt(minInstalls);
        if (maxInstalls) filter['Maximum Installs'].$lte = parseInt(maxInstalls);
    }
    if (minPrice || maxPrice) {
        filter['Price'] = {};
        if (minPrice) filter['Price'].$gte = parseFloat(minPrice);
        if (maxPrice) filter['Price'].$lte = parseFloat(maxPrice);
    }
    if (minRating || maxRating) {
        filter['Rating'] = {};
        if (minRating) filter['Rating'].$gte = parseFloat(minRating);
        if (maxRating) filter['Rating'].$lte = parseFloat(maxRating);
    }


    let limit = req.query.limit;
    if (limit) {
        limit = Math.min(maxLimit, limit);
    } else {
        limit = defaultLimit;
    }

    const result = await App.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'permissions',
                localField: 'App Id',
                foreignField: 'appId',
                pipeline: [
                    {
                        $unwind: '$allPermissions'
                    },
                    {
                        $project: {
                            _id: 0,
                            permission: '$allPermissions.permission',
                            type: '$allPermissions.type',
                        }
                    }
                ],
                as: 'permissions'
            }
        }
    ]).limit(limit);
    res.json(result);
};

exports.create = async (req, res, next) => {
    try {
        const app = new App(req.body);
        const doc = await app.save();
        res.status(201).json(doc);
    } catch (err) {
        if (err.name === 'MongoServerError' && err.code === 11000) {
            res.status(409).json({ error: 'Duplicate entry. A record with the same unique key already exists.' });
        } else if (err.name === 'StrictModeError') {
            const allowedFields = Object.keys(App.schema.paths);
            const allowed = allowedFields.filter(field => !['_id'].includes(field));
            const incomingFields = Object.keys(req.body);
            const extraFields = incomingFields.filter(field => !allowed.includes(field));
            res.status(400).json({ error: ('Request contains unknown fields: ' + extraFields)});
        } else if (err.name === 'ValidationError' && req.body['App Id'] === undefined) {
            res.status(400).json({ error: 'Missing \'App Id\' field' });
        } else {
            next(err);
        }
    }
};

exports.update = async (req, res, next) => {
    const { appId } = req.query;
    if (!appId) {
        res.status(400).json({ error: 'Missing \'appId\' field' });
        return;
    }

    const filter = { 'App Id': appId };

    const result = await App.updateMany(filter, req.body);
    res.json(result);
};

exports.delete = async (req, res, next) => {
    const { appName, appId, rating, free } = req.query;
    const filter = {};

    if (appName) filter['App Name'] = appName;
    if (appId) filter['App Id'] = appId;
    if (rating) filter['Rating'] = rating;
    if (free) filter['Free'] = free;

    const result = await App.deleteMany(filter);
    res.json(result);
};

exports.getAllCategories =  async (req, res, next) => {
    const result = await App.distinct('Category');
    const filtered = await result.filter(type => type !== null && type !== undefined);
    res.json(filtered);
};

exports.getAllContentRatings =  async (req, res, next) => {
    const result = await App.distinct('Content Rating');
    const filtered = await result.filter(type => type !== null && type !== undefined);
    res.json(filtered);
};