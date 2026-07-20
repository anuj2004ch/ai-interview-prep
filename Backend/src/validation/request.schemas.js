const { z } = require("zod")

const nonEmptyText = (label, max) => z.string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`)

const registerSchema = z.object({
    username: z.string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username may contain only letters, numbers, dots, underscores and hyphens"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
    password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be at most 72 characters")
}).strict()

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
    password: z.string().min(1, "Password is required").max(72)
}).strict()

const generateReportSchema = z.object({
    jobDescription: nonEmptyText("Job description", 12000),
    selfDescription: z.string().trim().max(5000, "Self description must be at most 5000 characters").optional().default("")
}).strict()

const evaluateAnswerSchema = z.object({
    question: nonEmptyText("Question", 5000),
    modelAnswer: nonEmptyText("Model answer", 10000),
    userAnswer: nonEmptyText("User answer", 10000)
}).strict()

const toggleTaskSchema = z.object({
    dayIndex: z.number().int().nonnegative(),
    taskIndex: z.number().int().nonnegative()
}).strict()

const evaluateDSASchema = z.object({
    title: nonEmptyText("Title", 200),
    description: nonEmptyText("Description", 12000),
    approach: z.string().trim().max(12000).optional().default(""),
    code: z.string().max(30000).optional().default(""),
    language: z.string().trim().max(40).optional().default("unknown")
}).strict().refine(data => data.approach.length > 0 || data.code.trim().length > 0, {
    message: "Approach or code is required",
    path: ["approach"]
})

module.exports = {
    registerSchema,
    loginSchema,
    generateReportSchema,
    evaluateAnswerSchema,
    toggleTaskSchema,
    evaluateDSASchema
}
