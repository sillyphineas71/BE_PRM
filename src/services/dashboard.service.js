const MonthlySnapshot = require("../models/MonthlySnapshot");

class DashboardService {
  async getMonthlyDashboard(userId, month) {
    // month format: YYYY-MM
    let snapshot = await MonthlySnapshot.findOne({ user_id: userId, month });

    if (!snapshot) {
      // Return zeroed structure if snapshot doesn't exist (Alternative/Exception Flow)
      return {
        user_id: userId,
        month,
        total_income: 0,
        total_expense: 0,
        by_jar: [
          { jar_key: "necessity", income: 0, expense: 0, end_balance: 0 },
          { jar_key: "education", income: 0, expense: 0, end_balance: 0 },
          { jar_key: "saving", income: 0, expense: 0, end_balance: 0 },
          { jar_key: "play", income: 0, expense: 0, end_balance: 0 },
          { jar_key: "investment", income: 0, expense: 0, end_balance: 0 },
          { jar_key: "charity", income: 0, expense: 0, end_balance: 0 },
        ],
        updated_at: new Date(),
        message: "No snapshot found, returning default values.",
      };
    }

    return snapshot;
  }

  async getHistory(userId, monthsLimit = 6) {
    // Find last X months of snapshots for charts (line/bar)
    const snapshots = await MonthlySnapshot.find({ user_id: userId })
      .sort({ month: -1 })
      .limit(monthsLimit);

    return snapshots.reverse(); // Return in chronological order
  }
}

module.exports = new DashboardService();
