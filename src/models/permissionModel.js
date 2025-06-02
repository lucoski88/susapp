const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionArraySchema = new Schema({
    permission: String,
    type: String
}, { _id: false });

const PermissionSchema = new Schema({
    appId : String,
    appName : String,
    allPermissions: [PermissionArraySchema]
}, { versionKey: false });

module.exports = mongoose.model('Permission', PermissionSchema);