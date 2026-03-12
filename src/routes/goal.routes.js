const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goal.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Tất cả các route đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get("/", goalController.list);
router.post("/", goalController.create);
router.get("/:id", goalController.getDetails);
router.patch("/:id", goalController.update);
router.post("/:id/add-progress", goalController.addProgress);

module.exports = router;
