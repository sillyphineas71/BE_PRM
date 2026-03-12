const mongoose = require("mongoose");

const metaSchema = new mongoose.Schema({
  payment_method: { type: String },
  location: { type: String },
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["EXPENSE", "INCOME_ADJUST", "TRANSFER"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  
  jar_key: { type: String }, // Used for EXPENSE / INCOME_ADJUST
  from_jar_key: { type: String }, // Used for TRANSFER
  to_jar_key: { type: String }, // Used for TRANSFER
  
  note: { type: String },
  tags: { type: [String], default: [] },
  occurred_at: { type: Date, required: true },
  meta: { type: metaSchema },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

transactionSchema.index({ user_id: 1, occurred_at: -1 });
transactionSchema.index({ user_id: 1, jar_key: 1, occurred_at: -1 });
transactionSchema.index({ user_id: 1, type: 1, occurred_at: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
