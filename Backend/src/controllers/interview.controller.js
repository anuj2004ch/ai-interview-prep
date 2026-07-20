const pdfParse = require("pdf-parse")

const { generateInterviewReport, evaluateAnswer, evaluateDSA, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const userModel = require("../models/user.model")

// ─── Helper: update streak ────────────────────────────────────────────────────
async function updateStreak(userId) {
    const user = await userModel.findById(userId)
    if (!user) return

    const now = new Date()
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    const lastActive = user.lastActiveDate
        ? Date.UTC(user.lastActiveDate.getUTCFullYear(), user.lastActiveDate.getUTCMonth(), user.lastActiveDate.getUTCDate())
        : null

    let newStreak = user.streakDays || 0

    if (!lastActive) {
        newStreak = 1
    } else {
        const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) {
            // same day — no change
        } else if (diffDays === 1) {
            newStreak += 1
        } else {
            newStreak = 1 // streak broken
        }
    }

    await userModel.findByIdAndUpdate(userId, { streakDays: newStreak, lastActiveDate: now })
}

// ─── Generate interview report ────────────────────────────────────────────────
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." })
        }

        let resumeText = ""

        if (req.file && req.file.buffer) {
            if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
                return res.status(400).json({ message: "The uploaded file is not a valid PDF." })
            }

            try {
                const pdfData = await pdfParse(req.file.buffer)
                resumeText = pdfData.text.trim().slice(0, 30000)
            } catch (parseErr) {
                console.error("PDF parse error:", parseErr)
                return res.status(400).json({ message: "Could not parse the uploaded PDF. Please try a different file." })
            }
        }

        if (!resumeText && !selfDescription) {
            return res.status(400).json({ message: "Please provide either a resume or a self description." })
        }

        const aiReport = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...aiReport
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("generateInterViewReportController error:", err)
        res.status(500).json({ message: "Failed to generate interview report. Please try again." })
    }
}

// ─── Get report by ID ─────────────────────────────────────────────────────────
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        res.status(200).json({ message: "Interview report fetched successfully.", interviewReport })
    } catch (err) {
        console.error("getInterviewReportByIdController error:", err)
        res.status(500).json({ message: "Failed to fetch interview report." })
    }
}

// ─── Get all reports ──────────────────────────────────────────────────────────
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -dsaQuestions -checkedTasks")

        res.status(200).json({ message: "Interview reports fetched successfully.", interviewReports })
    } catch (err) {
        console.error("getAllInterviewReportsController error:", err)
        res.status(500).json({ message: "Failed to fetch interview reports." })
    }
}

// ─── Generate resume PDF ──────────────────────────────────────────────────────
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params
        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const { resume, jobDescription, selfDescription } = interviewReport
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })
        res.send(pdfBuffer)
    } catch (err) {
        console.error("generateResumePdfController error:", err)
        res.status(500).json({ message: "Failed to generate resume PDF." })
    }
}

// ─── Feature 2: Evaluate user answer ─────────────────────────────────────────
async function evaluateAnswerController(req, res) {
    try {
        const { question, modelAnswer, userAnswer } = req.body

        const evaluation = await evaluateAnswer({ question, modelAnswer, userAnswer })
        res.status(200).json({ message: "Answer evaluated successfully.", evaluation })
    } catch (err) {
        console.error("evaluateAnswerController error:", err)
        res.status(500).json({ message: "Failed to evaluate answer." })
    }
}

// ─── Feature 3: Toggle task completion ───────────────────────────────────────
async function toggleTaskController(req, res) {
    try {
        const { interviewId } = req.params
        const { dayIndex, taskIndex } = req.body

        const report = await interviewReportModel
            .findOne({
                _id: interviewId,
                user: req.user.id
            })
            .select("preparationPlan checkedTasks")

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const day = report.preparationPlan[dayIndex]

        if (!day || !day.tasks[taskIndex]) {
            return res.status(400).json({
                message: "Task index is outside this preparation plan."
            })
        }

        const task = { dayIndex, taskIndex }

        const exists = report.checkedTasks.some(
            checkedTask =>
                checkedTask.dayIndex === dayIndex &&
                checkedTask.taskIndex === taskIndex
        )

        const update = exists
            ? {
                $pull: {
                    checkedTasks: task
                }
            }
            : {
                $addToSet: {
                    checkedTasks: task
                }
            }

        const updatedReport = await interviewReportModel
            .findOneAndUpdate(
                {
                    _id: interviewId,
                    user: req.user.id
                },
                update,
                {
                    returnDocument: "after",
                    runValidators: true
                }
            )
            .select("checkedTasks")

        if (!updatedReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        if (!exists) {
            try {
                await updateStreak(req.user.id)
            } catch (streakError) {
                console.error("Streak update failed:", streakError)
            }
        }

        return res.status(200).json({
            message: "Task toggled successfully.",
            checkedTasks: updatedReport.checkedTasks
        })
    } catch (err) {
        console.error("toggleTaskController error:", err)

        return res.status(500).json({
            message: "Failed to toggle task."
        })
    }
}

// ─── Feature 3: Get streak ────────────────────────────────────────────────────
async function getStreakController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("streakDays lastActiveDate")
        if (!user) return res.status(404).json({ message: "User not found." })

        res.status(200).json({
            message: "Streak fetched successfully.",
            streakDays: user.streakDays || 0,
            lastActiveDate: user.lastActiveDate
        })
    } catch (err) {
        console.error("getStreakController error:", err)
        res.status(500).json({ message: "Failed to fetch streak." })
    }
}

// ─── Feature 5: Toggle public sharing ────────────────────────────────────────
async function toggleShareController(req, res) {
    try {
        const { interviewId } = req.params
        const report = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!report) return res.status(404).json({ message: "Interview report not found." })

        report.isPublic = !report.isPublic
        await report.save()

        res.status(200).json({
            message: `Report is now ${report.isPublic ? "public" : "private"}.`,
            isPublic: report.isPublic
        })
    } catch (err) {
        console.error("toggleShareController error:", err)
        res.status(500).json({ message: "Failed to toggle share." })
    }
}

// ─── Feature 5: Get public report (no auth) ───────────────────────────────────
async function getPublicReportController(req, res) {
    try {
        const { interviewId } = req.params
        const report = await interviewReportModel
            .findOne({ _id: interviewId, isPublic: true })
            .select("-resume -selfDescription -jobDescription -user -__v -checkedTasks -dsaQuestions")

        if (!report) {
            return res.status(404).json({ message: "Report not found or is not public." })
        }

        res.status(200).json({ message: "Public report fetched successfully.", interviewReport: report })
    } catch (err) {
        console.error("getPublicReportController error:", err)
        res.status(500).json({ message: "Failed to fetch public report." })
    }
}

// ─── Feature 6: Analytics ────────────────────────────────────────────────────
async function getAnalyticsController(req, res) {
    try {
        const reports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: 1 })
            .select("title matchScore skillGaps createdAt")

        // Score trend
        const scoreTrend = reports.map(r => ({
            title:     r.title,
            score:     r.matchScore ?? 0,
            date:      r.createdAt
        }))

        // Skill gap frequency
        const gapMap = {}
        reports.forEach(r => {
            r.skillGaps.forEach(g => {
                const key = g.skill.trim().toLowerCase()
                if (!gapMap[key]) gapMap[key] = { count: 0, severity: g.severity, label: g.skill.trim() }
                gapMap[key].count++
            })
        })
        const topSkillGaps = Object.entries(gapMap)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 8)
            .map(([, data]) => ({ skill: data.label, count: data.count, severity: data.severity }))

        const avgScore = reports.length
            ? Math.round(reports.reduce((s, r) => s + (r.matchScore ?? 0), 0) / reports.length)
            : 0

        res.status(200).json({
            message: "Analytics fetched successfully.",
            analytics: { scoreTrend, topSkillGaps, totalReports: reports.length, avgScore }
        })
    } catch (err) {
        console.error("getAnalyticsController error:", err)
        res.status(500).json({ message: "Failed to fetch analytics." })
    }
}

module.exports = {
    evaluateDSAController,
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    evaluateAnswerController,
    toggleTaskController,
    getStreakController,
    toggleShareController,
    getPublicReportController,
    getAnalyticsController
}

// ─── DSA: Evaluate code / approach ───────────────────────────────────────────
async function evaluateDSAController(req, res) {
    try {
        const { title, description, approach, code, language } = req.body

        const result = await evaluateDSA({ title, description, approach, code, language })
        res.status(200).json({ message: "DSA solution evaluated.", result })
    } catch (err) {
        console.error("evaluateDSAController error:", err)
        res.status(500).json({ message: "Failed to evaluate DSA solution." })
    }
}
