const test = require("node:test")
const assert = require("node:assert/strict")
const request = require("supertest")

process.env.NODE_ENV = "test"

const app = require("../src/app")
const { validateEnv } = require("../src/config/env")

test("health endpoint reports that the API is available", async () => {
    const response = await request(app).get("/api/health")

    assert.equal(response.status, 200)
    assert.deepEqual(response.body, { status: "ok" })
})

test("unknown endpoints return a JSON 404", async () => {
    const response = await request(app).get("/api/does-not-exist")

    assert.equal(response.status, 404)
    assert.equal(response.body.message, "Route not found.")
})

test("registration rejects weak input before accessing the database", async () => {
    const response = await request(app)
        .post("/api/auth/register")
        .send({ username: "a", email: "not-an-email", password: "123" })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, "Invalid request data.")
    assert.ok(response.body.errors.length >= 3)
})

test("protected interview endpoints reject missing authentication", async () => {
    const response = await request(app).get("/api/interview/")

    assert.equal(response.status, 401)
    assert.equal(response.body.message, "Token not provided.")
})

test("public report endpoint rejects malformed MongoDB IDs", async () => {
    const response = await request(app).get("/api/interview/public/not-an-id")

    assert.equal(response.status, 400)
    assert.equal(response.body.message, "Invalid interviewId.")
})

test("malformed JSON produces a client error instead of a server error", async () => {
    const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send('{"email":')

    assert.equal(response.status, 400)
    assert.equal(response.body.message, "Request body contains invalid JSON.")
})

test("environment validation accepts a complete configuration", () => {
    const env = validateEnv({
        NODE_ENV: "test",
        PORT: "3000",
        MONGO_URI: "mongodb://localhost:27017/test",
        JWT_SECRET: "x".repeat(32),
        GROQ_API_KEY: "test-key"
    })

    assert.equal(env.PORT, 3000)
    assert.equal(env.GROQ_MODEL, "llama-3.3-70b-versatile")
})

test("environment validation rejects short JWT secrets", () => {
    assert.throws(() => validateEnv({
        NODE_ENV: "test",
        MONGO_URI: "mongodb://localhost:27017/test",
        JWT_SECRET: "short",
        GROQ_API_KEY: "test-key"
    }), /JWT_SECRET/)
})
