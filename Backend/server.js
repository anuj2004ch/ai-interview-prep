require("dotenv").config()
const dns = require("dns")
const mongoose = require("mongoose")
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const { validateEnv } = require("./src/config/env")

async function startServer() {
    const env = validateEnv()

    if (env.DNS_SERVERS) {
        dns.setServers(env.DNS_SERVERS.split(",").map(server => server.trim()).filter(Boolean))
    }

    await connectToDB()

    const server = app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`)
    })

    const shutdown = async signal => {
        console.log(`${signal} received. Shutting down gracefully.`)
        server.close(async () => {
            await mongoose.disconnect()
            process.exit(0)
        })
    }

    process.once("SIGINT", () => shutdown("SIGINT"))
    process.once("SIGTERM", () => shutdown("SIGTERM"))
}

startServer().catch(err => {
    console.error("Failed to start server:", err.message)
    process.exit(1)
})
