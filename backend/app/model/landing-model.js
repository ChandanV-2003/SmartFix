const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const landingSchema = new Schema({
    hero: {
        title: { type: String, default: 'Expert Solutions for All Your Repair Needs' },
        subtitle: { type: String, default: 'SmartFix connects you with professional technicians to solve your maintenance issues quickly and reliably.' },
        buttonText: { type: String, default: 'Get Started' }
    },
    features: [{
        title: String,
        description: String,
        icon: String
    }],
    about: {
        title: { type: String, default: 'About Our Mission' },
        description: { type: String, default: 'SmartFix was founded on the principle that maintenance shouldn’t be a headache. We’ve built a platform that brings transparency and efficiency to every repair task.' },
        stats: [{
            label: String,
            value: String
        }]
    },
    contact: {
        email: { type: String, default: 'support@smartfix.com' },
        phone: { type: String, default: '+1 (555) 000-FIXIT' },
        address: { type: String, default: '123 Repair St, Tech City' }
    },
    version: { type: Number, default: 1 } // To trigger refresh if needed
}, { timestamps: true });

const Landing = model('Landing', landingSchema);
module.exports = Landing;
