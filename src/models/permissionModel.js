const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionArraySchema = new Schema({
    permission: String,
    type: String
}, {
    _id: false,
    strict: 'throw',
    versionKey: false
});

const PermissionSchema = new Schema({
    appId : {
        type: String,
        required: true,
        unique: true
    },
    appName : String,
    allPermissions: [PermissionArraySchema]
}, {
    versionKey: false,
    strict: 'throw'
});

module.exports = mongoose.model('Permission', PermissionSchema);