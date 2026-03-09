const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/users/me", authMiddleware, authController.getProfile);
router.put("/users/me", authMiddleware, authController.updateProfile);

// Route Test Phân quyền (Chỉ admin mới được lấy danh sách tất cả user)
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  authController.getAllUsers,
);
router.put("/users/me/currency", authMiddleware, authController.updateCurrency);

module.exports = router;
