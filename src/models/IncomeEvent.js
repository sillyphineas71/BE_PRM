const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  jar_key: { type: String, required: true },
  percent: { type: Number, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const incomeEventSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jar_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: "JarProfile", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  source: { type: String },
  note: { type: String },
  received_at: { type: Date, required: true },
  allocations: { type: [allocationSchema], required: true },
  created_at: { type: Date, default: Date.now },
});

incomeEventSchema.index({ user_id: 1, received_at: -1 });
incomeEventSchema.index({ jar_profile_id: 1 });

module.exports = mongoose.model("IncomeEvent", incomeEventSchema);
