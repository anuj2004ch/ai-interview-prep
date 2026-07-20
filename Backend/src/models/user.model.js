const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: { type: String, required: [true, "Username is required"], unique: true, trim: true },
    email:    { type: String, required: [true, "Email is required"], unique: true, trim: true, lowercase: true },
    password: { type: String, required: [true, "Password is required"], select: false },

    // Feature 3: prep streak tracking
    streakDays:     { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
}, { timestamps: true })

const userModel = mongoose.model("users", userSchema)
module.exports = userModel
