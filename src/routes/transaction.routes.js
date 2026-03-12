const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Tất cả routes cần xác thực
router.use(authMiddleware);

// UC-11: Chuyển tiền giữa các lọ (đặt trước route có :id)
router.post("/transfer", transactionController.createTransfer);

// UC-09: Thêm chi tiêu
router.post("/", transactionController.createExpense);

// UC-12: Xem danh sách giao dịch (filter theo query params)
router.get("/", transactionController.getTransactions);

// UC-10: Sửa chi tiêu
router.put("/:id", transactionController.updateExpense);

// UC-10: Xóa chi tiêu
router.delete("/:id", transactionController.deleteExpense);

module.exports = router;
