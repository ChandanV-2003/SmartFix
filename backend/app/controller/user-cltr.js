const User = require('../model/user-model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs')
const { userRegisterValidationSchema, userLoginValidationSchema } = require('../validator/user-validator')
const usersCltr = {};

usersCltr.register = async (req, res) => {
    const body = req.body;
    const { error, value } = userRegisterValidationSchema.validate(body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ error: error.details.map(err => err.message) });
    }
    try {
        const userPresentWithEmail = await User.findOne({ email: value.email });
        if (userPresentWithEmail) {
            return res.status(400).json({ error: 'This email already taken' });
        } else {
            const user = new User(value);
            const salt = await bcryptjs.genSalt();
            const hashPassword = await bcryptjs.hash(value.password, salt)
            user.password = hashPassword;
            const userCount = await User.countDocuments();
            if (userCount == 0) {
                user.role = 'admin';
            }
            await user.save();
            const safeUser = user.toObject();
            delete safeUser.password;
            res.status(201).json(safeUser);
        }
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong!!' });
    }
};

usersCltr.login = async (req, res) => {
    const body = req.body;
    const { error, value } = userLoginValidationSchema.validate(body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ error: error.details.map(err => err.message) });
    }
    const userPresent = await User.findOne({ email: value.email });
    if (!userPresent) {
        return res.status(400).json({ error: 'invalid email' });
    }
    const isPasswordMatch = await bcryptjs.compare(value.password, userPresent.password);

    if (!isPasswordMatch) {
        return res.status(400).json({ error: 'invalid password' })
    }
    // generate a jwt & send the jwt

    const tokenData = { 
        userId: userPresent._id, 
        role: userPresent.role,
        userEmail: userPresent.email,
        userName: userPresent.username
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: '7d' });
    const safeUser = userPresent.toObject();
    delete safeUser.password;
    res.json({ token: token, user: safeUser });
};

usersCltr.account = async(req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json(user);
    } catch (err) {

        res.status(500).json({ error: "Something went wrong"});
    }
};

usersCltr.list = async(req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {

        res.status(500).json({ error: "Something went wrong"});
    }
};

usersCltr.update = async (req, res) => {
    const id = req.params.id;
    const { role } = req.body;
    const validRoles = ['admin', 'manager', 'technician', 'user'];

    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid or missing role' });
    }

    // Check if trying to assign admin role
    if (role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        // Check if this user is already an admin
        const currentUser = await User.findById(id);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // If user is not already admin and we already have 2 admins, reject
        if (currentUser.role !== 'admin' && adminCount >= 2) {
            return res.status(400).json({ error: 'Maximum limit of 2 administrators reached' });
        }
    }

    try {
        const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {

        res.status(500).json({ error: 'Something went wrong' });
    }
};

usersCltr.remove = async (req, res) => {
    const id = req.params.id;
     if(id == req.userId){
        return res.status(400).json({ error : 'admin cannot delete his own account'});
        
    }
    try{
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json( { } ) 
        }
        
        res.json(user);

    } catch (err) {

        res.status(500).json({ error: "Something went wrong"});
    }
};

module.exports = usersCltr; 