const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const groupMessageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    group: {
        type: String,
        default: 'admin-manager'
    }
}, { timestamps: true });

const GroupMessage = model('GroupMessage', groupMessageSchema);
module.exports = GroupMessage;
