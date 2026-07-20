const mongoose = require('mongoose')

const blacklistTokenSchema = new mongoose.Schema({
    jti: {
        type: String,
        required: [true, "Token ID is required"],
        unique: true,
       
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0
    }
}, {
    timestamps: true
})

const tokenBlacklistModel = mongoose.model("blacklistTokens", blacklistTokenSchema)
module.exports = tokenBlacklistModel
