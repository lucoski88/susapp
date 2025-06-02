const App = require('../models/appModel');

exports.get = async (req, res, next) => {
    const result = await App.findOne({},
        {},
        null);
    res.json(result);
};