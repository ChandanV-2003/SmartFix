require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./app/model/user-model');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.DB_URL);
        const users = await User.find({}, 'username email role');
        console.log(JSON.stringify(users, null, 2));
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
checkUsers();
