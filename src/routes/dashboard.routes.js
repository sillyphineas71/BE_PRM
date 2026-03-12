const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/dashboard/monthly?month=YYYY-MM
router.get("/monthly", authMiddleware, dashboardController.getMonthlyDashboard);

module.exports = router;
