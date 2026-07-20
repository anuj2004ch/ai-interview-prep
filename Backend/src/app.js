const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const multer = require("multer")
const { rateLimit } = require("express-rate-limit")
const { getClientOrigins } = require("./config/env")

const app = express()
const allowedOrigins = getClientOrigins()

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1)

app.disable("x-powered-by")
app.use(helmet())
app.use(express.json({ limit: "64kb" }))
app.use(cookieParser())
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
        const error = new Error("Origin is not allowed by CORS.")
        error.status = 403
        callback(error)
    },
    credentials: true
}))

app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()
    const origin = req.get("origin")
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: "Request origin is not allowed." })
    }
    next()
})

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." }
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((req, res) => {
    res.status(404).json({ message: "Route not found." })
})

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Resume must be 3MB or smaller."
            : "Invalid file upload."
        return res.status(400).json({ message })
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Request body contains invalid JSON." })
    }

    if (!err.status || err.status >= 500) console.error("Unhandled error:", err)

    res.status(err.status || 500).json({
        message: err.status && err.status < 500 ? err.message : "Internal server error."
    })
})

module.exports = app
