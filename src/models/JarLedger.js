const mongoose = require("mongoose");

const jarLedgerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jar_key: { type: String, required: true },
  delta: { type: Number, required: true },
  
  ref_type: { type: String, enum: ["IncomeEvent", "Transaction"], required: true },
  ref_id: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "ref_type" },
  
  occurred_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
});

jarLedgerSchema.index({ user_id: 1, jar_key: 1, occurred_at: -1 });
jarLedgerSchema.index({ ref_type: 1, ref_id: 1 });

module.exports = mongoose.model("JarLedger", jarLedgerSchema);
