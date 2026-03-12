const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar_url: { type: String, default: "" },
  currency: { type: String, default: "VND" },
  monthly_income: { type: Number },
  pay_day: { type: Number },
  jars: {
    type: Map,
    of: Number,
    default: {
      "Nhu cầu thiết yếu": 55,
      "Giáo dục": 10,
      "Giải trí": 10,
      "Tiết kiệm dài hạn": 10,
      "Tự do tài chính": 10,
      "Cho đi": 5,
    },
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);