const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  avatar_url: { type: String, default: "" },
  currency: { type: String, default: "VND" },
  monthly_income: { type: Number, default: null },
  pay_day: { type: Number, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
