const mongoose = require("mongoose");

const byJarSchema = new mongoose.Schema({
  jar_key: { type: String, required: true },
  income: { type: Number, required: true },
  expense: { type: Number, required: true },
  end_balance: { type: Number, required: true },
}, { _id: false });

const monthlySnapshotSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  total_income: { type: Number, required: true },
  total_expense: { type: Number, required: true },
  by_jar: { type: [byJarSchema], required: true },
  updated_at: { type: Date, default: Date.now },
});

monthlySnapshotSchema.index({ user_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlySnapshot", monthlySnapshotSchema);
