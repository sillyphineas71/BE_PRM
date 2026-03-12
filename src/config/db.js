const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log("✅ Database Name: PRM393_DB");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Thoát chương trình nếu lỗi kết nối
  }
};

module.exports = connectDB;
