const incomeService = require("../services/income.service");

exports.addIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomeData = req.body;
    
    if (!incomeData.amount || incomeData.amount <= 0) {
      return res.status(400).json({ message: "Số tiền thu nhập không hợp lệ." });
    }

    const savedIncome = await incomeService.addIncome(userId, incomeData);
    res.status(201).json({ message: "Thêm thu nhập thành công", data: savedIncome });
  } catch (error) {
    if (error.message.startsWith("400:")) {
      res.status(400).json({ message: error.message.split(":")[1].trim() });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

exports.getIncomeHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query; // format YYYY-MM
    
    const history = await incomeService.getIncomeHistory(userId, { month });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
