const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
    _id: String,
    appId : String,
    appName : String
});

const permissionModel = mongoose.model('permissions', PermissionSchema);

exports.model = permissionModel;