const express = require('express');
const router = express.Router();
const jarProfileController = require('../controllers/jarprofile.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Tất cả routes cần xác thực
router.use(authMiddleware);

// UC-04: Tạo jar profile mặc định (6 lọ)
router.post('/', jarProfileController.createJarProfile);

// Lấy tất cả jar profiles của user
router.get('/', jarProfileController.getUserProfiles);

// Lấy jar profile active
router.get('/active', jarProfileController.getActiveProfile);

// UC-05: Cập nhật tỷ lệ phân bổ
router.put('/:profileId', jarProfileController.updateJarPercentages);

// UC-06: Kích hoạt jar profile
router.put('/:profileId/activate', jarProfileController.activateJarProfile);

module.exports = router;
