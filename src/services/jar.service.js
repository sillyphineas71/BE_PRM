const JarLedger = require("../models/JarLedger");
const mongoose = require("mongoose");

exports.getJarBalances = async (userId) => {
  // Aggregate jar ledgers to find the current balance for each jar
  const balances = await JarLedger.aggregate([
    { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$jar_key",
        balance: { $sum: "$delta" },
      }
    },
    {
      $project: {
        jar_key: "$_id",
        balance: 1,
        _id: 0
      }
    }
  ]);

  // If a jar has no ledger entries, it won't appear here (so it's 0)
  return balances;
};

exports.getJarHistory = async (userId, jarKey) => {
  const history = await JarLedger.find({ user_id: userId, jar_key: jarKey })
                                 .sort({ occurred_at: -1 })
                                 .populate('ref_id'); // If you want to populate the transaction or income event detail
                                 
  return history;
};
