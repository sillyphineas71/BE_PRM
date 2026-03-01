const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const register = async (userData) => {

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('409');


    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = new User({
        full_name: userData.full_name,
        email: userData.email,
        password_hash: hashedPassword
    });
    return await newUser.save();
};

const login = async (email, password) => {

    const user = await User.findOne({ email });
    if (!user) throw new Error('401');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('401');

    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );
    return { token, user };
};

module.exports = { register, login };