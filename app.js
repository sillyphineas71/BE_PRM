require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const jarProfileRoutes = require("./src/routes/jarprofile.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const reportRoutes = require("./src/routes/report.routes");
const goalRoutes = require("./src/routes/goal.routes");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/jar-profiles", jarProfileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend đang chạy tại: http://localhost:${PORT}`);
});
