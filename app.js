require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth.routes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend đang chạy tại: http://localhost:${PORT}`);
});