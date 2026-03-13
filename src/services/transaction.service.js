const Transaction = require("../models/Transaction");
const JarLedger = require("../models/JarLedger");
const { rebuildSnapshot, getMonth } = require("./snapshot.service");

// ═══════════════════════════════════════════════════
// UC-09: Thêm chi tiêu (Create Expense)
// ═══════════════════════════════════════════════════
const createExpense = async (userId, data) => {
  const { amount, jar_key, note, occurred_at, currency = "VND", tags, meta } = data;

  // Validate
  if (!amount || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  // 1. Tạo transaction
  const transaction = await Transaction.create({
    user_id: userId,
    type: "EXPENSE",
    amount,
    currency,
    jar_key,
    note,
    tags: tags || [],
    occurred_at: new Date(occurred_at),
    meta,
  });

  // 2. Tạo 1 jar_ledger (delta âm)
  await JarLedger.create({
    user_id: userId,
    jar_key,
    delta: -amount,
    ref_type: "Transaction",
    ref_id: transaction._id,
    occurred_at: new Date(occurred_at),
  });

  // 3. Rebuild snapshot
  const month = getMonth(occurred_at);
  await rebuildSnapshot(userId, month);

  return transaction;
};

// ═══════════════════════════════════════════════════
// UC-10: Sửa chi tiêu (Update Expense)
// ═══════════════════════════════════════════════════
const updateExpense = async (userId, transactionId, updateData) => {
  // 1. Tìm transaction
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user_id: userId,
  });

  if (!transaction) {
    throw new Error("TRANSACTION_NOT_FOUND");
  }

  // Lưu month cũ để rebuild nếu month thay đổi
  const oldMonth = getMonth(transaction.occurred_at);

  // 2. Validate amount nếu có thay đổi
  if (updateData.amount !== undefined && updateData.amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  // 3. Update transaction fields
  const allowedFields = ["amount", "jar_key", "note", "occurred_at", "currency", "tags", "meta"];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      transaction[field] = field === "occurred_at" ? new Date(updateData[field]) : updateData[field];
    }
  }
  transaction.updated_at = Date.now();
  await transaction.save();

  // 4. Xóa ledger cũ theo ref_id
  await JarLedger.deleteMany({ ref_id: transactionId, ref_type: "Transaction" });

  // 5. Tạo ledger mới
  await JarLedger.create({
    user_id: userId,
    jar_key: transaction.jar_key,
    delta: -transaction.amount,
    ref_type: "Transaction",
    ref_id: transaction._id,
    occurred_at: transaction.occurred_at,
  });

  // 6. Rebuild snapshot (cả tháng cũ và mới nếu khác)
  const newMonth = getMonth(transaction.occurred_at);
  await rebuildSnapshot(userId, newMonth);
  if (oldMonth !== newMonth) {
    await rebuildSnapshot(userId, oldMonth);
  }

  return transaction;
};

// ═══════════════════════════════════════════════════
// UC-10: Xóa chi tiêu (Delete Expense)
// ═══════════════════════════════════════════════════
const deleteExpense = async (userId, transactionId) => {
  // 1. Tìm transaction
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user_id: userId,
  });

  if (!transaction) {
    throw new Error("TRANSACTION_NOT_FOUND");
  }

  const month = getMonth(transaction.occurred_at);

  // 2. Xóa ledger theo ref_id
  await JarLedger.deleteMany({ ref_id: transactionId, ref_type: "Transaction" });

  // 3. Xóa transaction
  await Transaction.deleteOne({ _id: transactionId });

  // 4. Rebuild snapshot
  await rebuildSnapshot(userId, month);

  return { deleted: true };
};

// ═══════════════════════════════════════════════════
// UC-11: Chuyển tiền giữa các lọ (Transfer)
// ═══════════════════════════════════════════════════
const createTransfer = async (userId, data) => {
  const { from_jar_key, to_jar_key, amount, note, occurred_at, currency = "VND" } = data;

  // Validate
  if (!amount || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }
  if (from_jar_key === to_jar_key) {
    throw new Error("SAME_JAR");
  }

  // 1. Tạo transaction
  const transaction = await Transaction.create({
    user_id: userId,
    type: "TRANSFER",
    amount,
    currency,
    from_jar_key,
    to_jar_key,
    note,
    occurred_at: new Date(occurred_at),
  });

  // 2. Tạo 2 jar_ledger: from (-), to (+)
  await JarLedger.insertMany([
    {
      user_id: userId,
      jar_key: from_jar_key,
      delta: -amount,
      ref_type: "Transaction",
      ref_id: transaction._id,
      occurred_at: new Date(occurred_at),
    },
    {
      user_id: userId,
      jar_key: to_jar_key,
      delta: amount,
      ref_type: "Transaction",
      ref_id: transaction._id,
      occurred_at: new Date(occurred_at),
    },
  ]);

  // 3. Rebuild snapshot
  const month = getMonth(occurred_at);
  await rebuildSnapshot(userId, month);

  return transaction;
};

// ═══════════════════════════════════════════════════
// UC-12: Xem danh sách giao dịch
// ═══════════════════════════════════════════════════
const getTransactions = async (userId, filters = {}) => {
  const { month, jar_key, type } = filters;

  const query = { user_id: userId };

  // Filter theo type
  if (type) {
    query.type = type;
  }

  // Filter theo jar_key (cho EXPENSE/INCOME_ADJUST hoặc TRANSFER)
  if (jar_key) {
    query.$or = [
      { jar_key: jar_key },
      { from_jar_key: jar_key },
      { to_jar_key: jar_key },
    ];
  }

  // Filter theo tháng (YYYY-MM)
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);
    query.occurred_at = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const transactions = await Transaction.find(query).sort({ occurred_at: -1 });
  return transactions;
};

module.exports = {
  createExpense,
  updateExpense,
  deleteExpense,
  createTransfer,
  getTransactions,
};
