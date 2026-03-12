const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboard.service");
const authMiddleware = require("../middleware/auth.middleware");

// UC-16: Xem báo cáo lịch sử (để vẽ biểu đồ)
// GET /api/reports/history?limit=6
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 6;
    const history = await dashboardService.getHistory(userId, limit);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch report history." });
  }
});

module.exports = router;
