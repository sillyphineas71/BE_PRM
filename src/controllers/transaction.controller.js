const transactionService = require("../services/transaction.service");

// UC-09: Thêm chi tiêu
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, jar_key, note, occurred_at, currency, tags, meta } = req.body;

    const transaction = await transactionService.createExpense(userId, {
      amount,
      jar_key,
      note,
      occurred_at,
      currency,
      tags,
      meta,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.message === "INVALID_AMOUNT") {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UC-10: Sửa chi tiêu
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = await transactionService.updateExpense(userId, id, req.body);

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.message === "TRANSACTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    if (error.message === "INVALID_AMOUNT") {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UC-10: Xóa chi tiêu
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await transactionService.deleteExpense(userId, id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    if (error.message === "TRANSACTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UC-11: Chuyển tiền giữa các lọ
exports.createTransfer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from_jar_key, to_jar_key, amount, note, occurred_at, currency } = req.body;

    const transaction = await transactionService.createTransfer(userId, {
      from_jar_key,
      to_jar_key,
      amount,
      note,
      occurred_at,
      currency,
    });

    res.status(201).json({
      success: true,
      message: "Transfer created successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.message === "INVALID_AMOUNT") {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }
    if (error.message === "SAME_JAR") {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer to the same jar",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UC-12: Xem danh sách giao dịch
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, jar_key, type } = req.query;

    const transactions = await transactionService.getTransactions(userId, {
      month,
      jar_key,
      type,
    });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
