const mongoose = require('mongoose');

const jarProfileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profile_name: { type: String, required: true },
    is_active: { type: Boolean, default: false },
    jars: [
        {
            name: { type: String, required: true },
            icon: { type: String, default: "savings" },
            color: { type: String, default: "#6366F1" },
            percent: { type: Number, required: true, min: 0, max: 100 },
            amount: { type: Number, default: 0 }
        }
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JarProfile', jarProfileSchema);
