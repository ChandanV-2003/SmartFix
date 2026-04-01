const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const complaintSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    issueTitle: {
        type: String,
        required: true,
        trim: true
    },
    issueDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },
    assignedTechnicians: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const Complaint = model('Complaint', complaintSchema);

module.exports = Complaint;
