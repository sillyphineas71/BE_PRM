const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/income.controller");
const authMiddleware = require("../middleware/auth.middleware");

// UC-07: POST /api/incomes
router.post("/", authMiddleware, incomeController.addIncome);

// UC-08: GET /api/incomes
router.get("/", authMiddleware, incomeController.getIncomeHistory);

module.exports = router;
