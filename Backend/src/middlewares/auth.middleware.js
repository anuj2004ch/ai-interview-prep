const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    let decoded

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return res.status(401).json({ message: "Invalid token." })
    }

    if (!decoded.jti) {
        return res.status(401).json({ message: "Invalid token." })
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.exists({ jti: decoded.jti })

        if (isTokenBlacklisted) {
            return res.status(401).json({ message: "Token is invalid." })
        }

        req.user = decoded
        next()
    } catch (error) {
        next(error)
    }

}


module.exports = { authUser }
