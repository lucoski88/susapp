const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AppSchema = new Schema({
    'App Name': { type: String, index: true },
    'App Id': { type: String, required: true, unique: true, index: true },
    'Category': { type: String, index: true },
    'Rating': Schema.Types.Double,
    'Rating Count': Schema.Types.Int32,
    'Installs': String,
    'Minimum Installs': Schema.Types.Int32,
    'Maximum Installs': Schema.Types.Int32,
    'Free': Schema.Types.Boolean,
    'Price': Schema.Types.Double,
    'Currency': String,
    'Size': String,
    'Minimum Android': String,
    'Developer Id': String,
    'Developer Website': String,
    'Developer Email': String,
    'Released': String,
    'Last Updated': String,
    'Content Rating': { type: String, index: true },
    'Privacy Policy': String,
    'Ad Supported': Schema.Types.Boolean,
    'In App Purchases': Schema.Types.Boolean,
    'Editors Choice': Schema.Types.Boolean,
    'Scraped Time': String
}, {
    strict: 'throw',
    versionKey: false
});

module.exports = mongoose.model('App', AppSchema);