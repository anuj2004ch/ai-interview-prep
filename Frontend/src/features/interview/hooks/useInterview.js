import { useCallback, useContext } from "react"
import { InterviewContext } from "../interview.context"
import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
    evaluateAnswer,
    toggleTask,
    getStreak,
    toggleShare,
    getAnalytics
} from "../services/interview.api"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) throw new Error("useInterview must be used within an InterviewProvider")

    const {
        loading, setLoading,
        report, setReport,
        reports, setReports,
        analytics, setAnalytics,
        streak, setStreak
    } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReportById = useCallback(async id => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            setReport(response.interviewReport)
            return response.interviewReport
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        const response = await getAllInterviewReports()
        setReports(response.interviewReports)
        return response.interviewReports
    }, [setReports])

    const fetchStreak = useCallback(async () => {
        const response = await getStreak()
        setStreak(response.streakDays || 0)
        return response.streakDays || 0
    }, [setStreak])

    const fetchAnalytics = useCallback(async () => {
        const response = await getAnalytics()
        setAnalytics(response.analytics)
        return response.analytics
    }, [setAnalytics])

    const loadDashboard = useCallback(async () => {
        setLoading(true)
        try {
            const results = await Promise.allSettled([
                getReports(),
                fetchStreak(),
                fetchAnalytics()
            ])

            if (results.every(result => result.status === "rejected")) {
                throw results[0].reason
            }
        } finally {
            setLoading(false)
        }
    }, [fetchAnalytics, fetchStreak, getReports, setLoading])

    const getResumePdf = useCallback(async interviewReportId => {
        const response = await generateResumePdf({ interviewReportId })
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
        const link = document.createElement("a")

        try {
            link.href = url
            link.download = `resume_${interviewReportId}.pdf`
            document.body.appendChild(link)
            link.click()
        } finally {
            link.remove()
            window.URL.revokeObjectURL(url)
        }
    }, [])

    const scoreAnswer = useCallback(async ({ question, modelAnswer, userAnswer }) => {
        const response = await evaluateAnswer({ question, modelAnswer, userAnswer })
        return response.evaluation
    }, [])

    const toggleTaskCompletion = useCallback(async ({ interviewId, dayIndex, taskIndex }) => {
        const response = await toggleTask({ interviewId, dayIndex, taskIndex })
        setReport(previous => previous
            ? { ...previous, checkedTasks: response.checkedTasks }
            : previous
        )
        return response.checkedTasks
    }, [setReport])

    const toggleReportShare = useCallback(async id => {
        const response = await toggleShare(id)
        setReport(previous => previous
            ? { ...previous, isPublic: response.isPublic }
            : previous
        )
        return response.isPublic
    }, [setReport])

    return {
        loading,
        report,
        reports,
        analytics,
        streak,
        generateReport,
        getReportById,
        getReports,
        loadDashboard,
        getResumePdf,
        scoreAnswer,
        toggleTaskCompletion,
        fetchStreak,
        toggleReportShare,
        fetchAnalytics
    }
}
