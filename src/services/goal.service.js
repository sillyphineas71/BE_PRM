const Goal = require("../models/Goal");

class GoalService {
  async createGoal(userId, goalData) {
    const { name, target_amount, jar_key, deadline } = goalData;

    // UC-17 Alternative Flow: Validation
    if (target_amount <= 0) {
      throw new Error("Target amount must be greater than 0");
    }

    const newGoal = new Goal({
      user_id: userId,
      name,
      target_amount,
      jar_key,
      deadline,
      status: "ACTIVE", // Default value from UC-17
      current_amount: 0,
      updated_at: new Date(),
    });

    return await newGoal.save();
  }

  async getGoalDetails(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, user_id: userId });

    // UC-18 Alternative Flow: Not found
    if (!goal) {
      throw new Error("Goal not found");
    }

    return goal;
  }

  async updateGoal(userId, goalId, updateData) {
    const { name, target_amount, current_amount, deadline, status } = updateData;

    // Tìm goal hiện tại để lấy dữ liệu cũ nếu không được truyền mới
    const existingGoal = await Goal.findOne({ _id: goalId, user_id: userId });
    if (!existingGoal) {
      throw new Error("Goal not found for update");
    }

    // Chuẩn bị dữ liệu cập nhật
    const update = { updated_at: new Date() };
    if (name !== undefined) update.name = name;
    if (deadline !== undefined) update.deadline = deadline;
    
    // Xử lý số tiền
    const newTarget = target_amount !== undefined ? target_amount : existingGoal.target_amount;
    const newCurrent = current_amount !== undefined ? current_amount : existingGoal.current_amount;
    
    if (target_amount !== undefined) update.target_amount = target_amount;
    if (current_amount !== undefined) update.current_amount = current_amount;

    // Logic tự động cập nhật status dựa trên số tiền
    let newStatus = status !== undefined ? status : existingGoal.status;

    if (newCurrent >= newTarget) {
      newStatus = "DONE";
    } else if (newStatus === "DONE" && newCurrent < newTarget) {
      // Nếu bị giảm tiền xuống dưới mức mục tiêu, chuyển về ACTIVE
      newStatus = "ACTIVE";
    }
    
    update.status = newStatus;

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: goalId, user_id: userId },
      { $set: update },
      { new: true }
    );

    return updatedGoal;
  }

  async addProgress(userId, goalId, amount) {
    if (amount <= 0) {
      throw new Error("Amount to add must be greater than 0");
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, user_id: userId },
      {
        $inc: { current_amount: amount },
        $set: { updated_at: new Date() },
      },
      { new: true },
    );

    if (!goal) {
      throw new Error("Goal not found for adding progress");
    }

    // Tự động chuyển sang DONE nếu đạt mục tiêu
    if (goal.current_amount >= goal.target_amount && goal.status === "ACTIVE") {
      goal.status = "DONE";
      await goal.save();
    }

    return goal;
  }

  async listUserGoals(userId) {
    return await Goal.find({ user_id: userId }).sort({ created_at: -1 });
  }
}

module.exports = new GoalService();
