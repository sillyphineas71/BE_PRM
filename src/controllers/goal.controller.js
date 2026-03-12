const goalService = require("../services/goal.service");

class GoalController {
  async create(req, res) {
    try {
      const goal = await goalService.createGoal(req.user.id, req.body);
      res.status(201).json(goal);
    } catch (error) {
      if (error.message === "Target amount must be greater than 0") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error creating goal." });
    }
  }

  async getDetails(req, res) {
    try {
      const goal = await goalService.getGoalDetails(req.user.id, req.params.id);
      res.status(200).json(goal);
    } catch (error) {
      if (error.message === "Goal not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error fetching goal details." });
    }
  }

  async update(req, res) {
    try {
      const goal = await goalService.updateGoal(req.user.id, req.params.id, req.body);
      res.status(200).json(goal);
    } catch (error) {
      if (error.message === "Goal not found for update") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Error updating goal." });
    }
  }

  async addProgress(req, res) {
    try {
      const { amount } = req.body;
      const goal = await goalService.addProgress(req.user.id, req.params.id, amount);
      res.status(200).json(goal);
    } catch (error) {
      if (error.message === "Goal not found for adding progress") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === "Amount to add must be greater than 0") {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Error adding goal progress." });
    }
  }

  async list(req, res) {
    try {
      const goals = await goalService.listUserGoals(req.user.id);
      res.status(200).json(goals);
    } catch (error) {
      res.status(500).json({ message: "Error listing goals." });
    }
  }
}

module.exports = new GoalController();
