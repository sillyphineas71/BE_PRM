const express = require("express");
const router = express.Router();
const jarController = require("../controllers/jar.controller");
const authMiddleware = require("../middleware/auth.middleware");

// UC-13: GET /api/jars/balances
router.get("/balances", authMiddleware, jarController.getJarBalances);

// UC-14: GET /api/jars/:jar_key/history
router.get("/:jar_key/history", authMiddleware, jarController.getJarHistory);

module.exports = router;
