const User = require('../models/User');
const bcrypt = require('bcrypt'); // Cần chạy: npm install bcrypt
const jwt = require('jsonwebtoken'); // Cần chạy: npm install jsonwebtoken

const register = async (userData) => {
    // Kiểm tra email tồn tại (UC-01)
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) throw new Error('409');

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = new User({
        full_name: userData.full_name,
        email: userData.email,
        password_hash: hashedPassword
    });
    return await newUser.save();
};

const login = async (email, password) => {
    // Xác thực thông tin (UC-02)
    const user = await User.findOne({ email });
    if (!user) throw new Error('401');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('401');

    // Trả về token và thông tin user
    const token = jwt.sign({ id: user._id }, 'SECRET_KEY_CUA_DUC', { expiresIn: '7d' });
    return { token, user };
};

module.exports = { register, login };