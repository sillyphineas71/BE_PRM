const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Không thể xác thực quyền truy cập!' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này!' });
        }

        next();
    };
};

module.exports = authorizeRoles;
