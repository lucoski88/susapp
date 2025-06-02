const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionArraySchema = new Schema({
    permission: String,
    type: String
}, { _id: false });

const PermissionSchema = new Schema({
    _id: String,
    appId : String,
    appName : String,
    allPermissions: [PermissionArraySchema]
});

module.exports = mongoose.model('Permission', PermissionSchema);