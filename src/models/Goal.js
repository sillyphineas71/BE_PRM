const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  target_amount: { type: Number, required: true },
  current_amount: { type: Number, required: true, default: 0 },
  jar_key: { type: String, required: true },
  deadline: { type: Date },
  status: { type: String, enum: ["ACTIVE", "DONE", "PAUSED"], required: true, default: "ACTIVE" },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

goalSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model("Goal", goalSchema);
