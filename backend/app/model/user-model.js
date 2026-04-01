const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const userSchema = new Schema ({
    username: String,
    email: String,
    phone: Number,
    password: String,
    role: {
        type: String,
        default: 'user',
        enum: ['admin', 'manager', 'technician', 'user']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    }
}, {timestamps: true});

const User = model('User', userSchema);

module.exports = User;