const jarService = require("../services/jar.service");

exports.getJarBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const balances = await jarService.getJarBalances(userId);
    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJarHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jar_key } = req.params;
    
    const history = await jarService.getJarHistory(userId, jar_key);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
