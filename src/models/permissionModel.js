const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    _id: String,
    appId : String,
    appName : String
});

module.exports = mongoose.model('Permission', PermissionSchema);