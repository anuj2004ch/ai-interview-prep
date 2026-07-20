const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { randomUUID } = require("crypto")
const tokenBlacklistModel = require("../models/blacklist.model")

function getCookieOptions(includeMaxAge = true) {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.COOKIE_SAME_SITE || "lax",
        path: "/"
    }

    if (includeMaxAge) options.maxAge = 24 * 60 * 60 * 1000
    return options
}

function createToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d", jwtid: randomUUID() }
    )
}

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        const exists = await userModel.findOne({ $or: [{ username }, { email }] })
        if (exists) {
            return res.status(409).json({ message: "Account already exists with this email or username" })
        }

        const hash = await bcrypt.hash(password, 10)
        const user = await userModel.create({ username, email, password: hash })

        const token = createToken(user)

        res.cookie("token", token, getCookieOptions())
        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error("registerUserController error:", err)
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Account already exists with this email or username" })
        }
        res.status(500).json({ message: "Registration failed. Please try again." })
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = createToken(user)

        res.cookie("token", token, getCookieOptions())
        res.status(200).json({
            message: "User logged in successfully.",
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error("loginUserController error:", err)
        res.status(500).json({ message: "Login failed. Please try again." })
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                if (decoded.jti && decoded.exp) {
                    await tokenBlacklistModel.updateOne(
                        { jti: decoded.jti },
                        { $setOnInsert: { jti: decoded.jti, expiresAt: new Date(decoded.exp * 1000) } },
                        { upsert: true }
                    )
                }
            } catch {
                // An invalid or expired token still needs its browser cookie cleared.
            }
        }

        res.clearCookie("token", getCookieOptions(false))
        res.status(200).json({ message: "User logged out successfully" })
    } catch (err) {
        console.error("logoutUserController error:", err)
        res.status(500).json({ message: "Logout failed." })
    }
}

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)
        if (!user) return res.status(404).json({ message: "User not found." })
        res.status(200).json({
            message: "User details fetched successfully",
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error("getMeController error:", err)
        res.status(500).json({ message: "Failed to fetch user details." })
    }
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }
