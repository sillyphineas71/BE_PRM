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
            currency: user.currency,
            monthly_income: user.monthly_income || "", 
            pay_day: user.pay_day || ""
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const updateData = { updated_at: Date.now() };
        if (req.body.full_name !== undefined) {
            updateData.full_name = req.body.full_name;
        }
        if (req.body.monthly_income !== undefined) {
            updateData.monthly_income = req.body.monthly_income;
        }
        if (req.body.pay_day !== undefined) {
            updateData.pay_day = req.body.pay_day;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password_hash');
        
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật currency (khi người dùng chọn ngôn ngữ)
exports.updateCurrency = async (req, res) => {
    try {
        const { currency } = req.body;
        
        if (!currency || !['VND', 'USD'].includes(currency)) {
            return res.status(400).json({ 
                message: "Invalid currency. Must be VND or USD" 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { currency: currency, updated_at: Date.now() },
            { new: true }
        ).select('-password_hash');
        
        res.status(200).json({
            success: true,
            message: "Currency updated successfully",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};