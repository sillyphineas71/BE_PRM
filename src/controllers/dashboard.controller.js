const dashboardService = require("../services/dashboard.service");

class DashboardController {
  async getMonthlyDashboard(req, res) {
    try {
      const userId = req.user.id;
      // Get month from query or default to current month
      let month = req.query.month;

      if (!month) {
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = String(now.getMonth() + 1).padStart(2, "0");
        month = `${year}-${monthNum}`;
      }

      const result = await dashboardService.getMonthlyDashboard(userId, month);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res
        .status(500)
        .json({ message: "Internal server error fetching dashboard." });
    }
  }
}

module.exports = new DashboardController();
