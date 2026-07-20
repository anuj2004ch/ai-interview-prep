const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const { validate, validateObjectId } = require("../middlewares/validate.middleware")
const {
    generateReportSchema,
    evaluateAnswerSchema,
    toggleTaskSchema,
    evaluateDSASchema
} = require("../validation/request.schemas")

const interviewRouter = express.Router()

// Generate new interview report
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    validate(generateReportSchema),
    interviewController.generateInterViewReportController
)

// Get all reports (summary list)
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

// Feature 6: Analytics
interviewRouter.get("/analytics", authMiddleware.authUser, interviewController.getAnalyticsController)

// Feature 3: Streak
interviewRouter.get("/streak", authMiddleware.authUser, interviewController.getStreakController)

// Feature 5: Public report (no auth required)
interviewRouter.get("/public/:interviewId", validateObjectId("interviewId"), interviewController.getPublicReportController)

// Get report by ID
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, validateObjectId("interviewId"), interviewController.getInterviewReportByIdController)

// Generate resume PDF
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, validateObjectId("interviewReportId"), interviewController.generateResumePdfController)

// Feature 2: Evaluate user's answer
interviewRouter.post("/evaluate-answer", authMiddleware.authUser, validate(evaluateAnswerSchema), interviewController.evaluateAnswerController)

// Feature 3: Toggle task completion
interviewRouter.patch("/report/:interviewId/tasks", authMiddleware.authUser, validateObjectId("interviewId"), validate(toggleTaskSchema), interviewController.toggleTaskController)

// Feature 5: Toggle public sharing
interviewRouter.patch("/report/:interviewId/share", authMiddleware.authUser, validateObjectId("interviewId"), interviewController.toggleShareController)

// DSA: evaluate code/approach
interviewRouter.post("/dsa/evaluate", authMiddleware.authUser, validate(evaluateDSASchema), interviewController.evaluateDSAController)

module.exports = interviewRouter
