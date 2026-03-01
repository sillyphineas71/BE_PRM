const authService = require('../services/auth.service');
const User = require('../models/User');
exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: "Thành công", data: user });
    } catch (err) {
        if (err.message === '409') res.status(409).json({ message: "Email đã tồn tại" });
        else res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === '401') res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        else res.status(500).json({ message: err.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password_hash');
        // Trả về dữ liệu thực tế từ DB
        res.status(200).json({
            full_name: user.full_name,
            email: user.email,
            monthly_income: user.monthly_income || "", 
            pay_day: user.pay_day || "",
            jars: user.jars || {}
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const updateData = { updated_at: Date.now() };
        if (req.body.full_name !== undefined) updateData.full_name = req.body.full_name;
        if (req.body.monthly_income !== undefined) {
            updateData.monthly_income = parseInt(req.body.monthly_income, 10);
            if (isNaN(updateData.monthly_income)) updateData.monthly_income = 0;
        }
        if (req.body.pay_day !== undefined) {
            updateData.pay_day = parseInt(req.body.pay_day, 10);
            if (isNaN(updateData.pay_day)) updateData.pay_day = 1;
        }
        if (req.body.jars !== undefined) {
            updateData.jars = req.body.jars;
        }

        // Tìm và cập nhật dựa trên req.user.id từ middleware
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { returnDocument: 'after' } 
        ).select('-password_hash');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password_hash');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};