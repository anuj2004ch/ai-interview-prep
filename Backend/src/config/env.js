const { z } = require("zod")

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
    GROQ_MODEL: z.string().min(1).default("llama-3.3-70b-versatile"),
    CLIENT_ORIGINS: z.string().default("http://localhost:5173,http://localhost:4173"),
    DNS_SERVERS: z.string().optional(),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax")
})

function validateEnv(env = process.env) {
    const result = envSchema.safeParse(env)

    if (!result.success) {
        const details = result.error.issues
            .map(issue => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ")
        throw new Error(`Invalid environment configuration: ${details}`)
    }

    return result.data
}

function getClientOrigins() {
    return (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:4173")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
}

module.exports = { validateEnv, getClientOrigins }
