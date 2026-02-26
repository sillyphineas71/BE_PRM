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
            pay_day: user.pay_day || ""
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        // Tìm và cập nhật full_name dựa trên req.user.id từ middleware
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { full_name: req.body.full_name, updated_at: Date.now() },
            { new: true } // Trả về dữ liệu mới sau khi sửa
        ).select('-password_hash');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};