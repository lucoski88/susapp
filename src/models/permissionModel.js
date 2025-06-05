const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PermissionArraySchema = new Schema({
    permission: {
        type: String,
        index: true
    },
    type: {
        type: String,
        index: true
    }
}, {
    _id: false,
    strict: 'throw',
    versionKey: false
});

const PermissionSchema = new Schema({
    appId : {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    appName : String,
    allPermissions: [PermissionArraySchema]
}, {
    versionKey: false,
    strict: 'throw'
});

module.exports = mongoose.model('Permission', PermissionSchema);