const authService = require('../services/auth.service');

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