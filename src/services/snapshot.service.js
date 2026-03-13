const JarLedger = require("../models/JarLedger");
const Transaction = require("../models/Transaction");
const MonthlySnapshot = require("../models/MonthlySnapshot");

// ─── Helper: lấy month string "YYYY-MM" từ Date ───
const getMonth = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
};

/**
 * Rebuild monthly snapshot cho 1 user trong 1 tháng.
 *
 * Logic:
 *  - total_income  = tổng delta > 0 từ IncomeEvent ledgers (KHÔNG đếm transfer-in)
 *  - total_expense = tổng |delta| < 0 từ EXPENSE transaction ledgers (KHÔNG đếm transfer-out)
 *  - by_jar[].income  = tổng delta > 0 từ IncomeEvent ledgers cho jar đó
 *  - by_jar[].expense  = tổng |delta| từ EXPENSE ledgers cho jar đó
 *  - by_jar[].end_balance = tổng tất cả delta (mọi loại) từ đầu → cuối tháng (cumulative)
 */
const rebuildSnapshot = async (userId, month) => {
  const [year, mon] = month.split("-").map(Number);
  const startOfMonth = new Date(year, mon - 1, 1);
  const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);

  // ── 1. Lấy tất cả ledger entries TRONG THÁNG để tính income/expense ──
  const monthlyLedgers = await JarLedger.find({
    user_id: userId,
    occurred_at: { $gte: startOfMonth, $lte: endOfMonth },
  });

  // ── 2. Lấy tất cả ledger entries TỪ ĐẦU → CUỐI THÁNG để tính end_balance (cumulative) ──
  const cumulativeLedgers = await JarLedger.find({
    user_id: userId,
    occurred_at: { $lte: endOfMonth },
  });

  // ── 3. Thu thập ref_ids của các TRANSACTION ledger để lookup type ──
  const txRefIds = [
    ...new Set(
      monthlyLedgers
        .filter((l) => l.ref_type === "Transaction")
        .map((l) => l.ref_id.toString())
    ),
  ];

  // Lookup transactions để biết type (EXPENSE vs TRANSFER vs INCOME_ADJUST)
  const txDocs = txRefIds.length > 0
    ? await Transaction.find({ _id: { $in: txRefIds } }, { _id: 1, type: 1 })
    : [];

  const txTypeMap = {};
  for (const tx of txDocs) {
    txTypeMap[tx._id.toString()] = tx.type;
  }

  // ── 4. Tính income/expense theo jar (TRONG THÁNG) ──
  const jarMap = {};
  let totalIncome = 0;
  let totalExpense = 0;

  // Collect tất cả jar_keys từ cả monthly và cumulative ledgers
  const allJarKeys = new Set();

  for (const ledger of monthlyLedgers) {
    allJarKeys.add(ledger.jar_key);

    if (!jarMap[ledger.jar_key]) {
      jarMap[ledger.jar_key] = { income: 0, expense: 0 };
    }

    if (ledger.ref_type === "IncomeEvent") {
      // Thu nhập: delta > 0
      if (ledger.delta > 0) {
        jarMap[ledger.jar_key].income += ledger.delta;
        totalIncome += ledger.delta;
      }
    } else if (ledger.ref_type === "Transaction") {
      const txType = txTypeMap[ledger.ref_id.toString()];
      if (txType === "EXPENSE" && ledger.delta < 0) {
        // Chi tiêu: delta < 0
        jarMap[ledger.jar_key].expense += Math.abs(ledger.delta);
        totalExpense += Math.abs(ledger.delta);
      } else if (txType === "INCOME_ADJUST" && ledger.delta > 0) {
        // Điều chỉnh thu nhập: cộng vào income
        jarMap[ledger.jar_key].income += ledger.delta;
        totalIncome += ledger.delta;
      } else if (txType === "INCOME_ADJUST" && ledger.delta < 0) {
        // Điều chỉnh thu nhập âm: cộng vào expense
        jarMap[ledger.jar_key].expense += Math.abs(ledger.delta);
        totalExpense += Math.abs(ledger.delta);
      }
      // TRANSFER: KHÔNG cộng vào total_income/total_expense
    }
  }

  // ── 5. Tính end_balance cumulative cho mỗi jar ──
  const balanceMap = {};
  for (const ledger of cumulativeLedgers) {
    allJarKeys.add(ledger.jar_key);
    if (!balanceMap[ledger.jar_key]) {
      balanceMap[ledger.jar_key] = 0;
    }
    balanceMap[ledger.jar_key] += ledger.delta;
  }

  // ── 6. Build by_jar array ──
  const byJar = [...allJarKeys].map((jar_key) => ({
    jar_key,
    income: jarMap[jar_key]?.income || 0,
    expense: jarMap[jar_key]?.expense || 0,
    end_balance: balanceMap[jar_key] || 0,
  }));

  // ── 7. Upsert snapshot ──
  await MonthlySnapshot.findOneAndUpdate(
    { user_id: userId, month },
    {
      user_id: userId,
      month,
      total_income: totalIncome,
      total_expense: totalExpense,
      by_jar: byJar,
      updated_at: Date.now(),
    },
    { upsert: true, new: true }
  );
};

module.exports = { rebuildSnapshot, getMonth };
