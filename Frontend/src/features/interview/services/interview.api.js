import { api } from "../../../services/api"

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    if (resumeFile) formData.append("resume", resumeFile)

    const response = await api.post("/api/interview/", formData)
    return response.data
}

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)
    return response.data
}

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")
    return response.data
}

export const generateResumePdf = async ({ interviewReportId }) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })
    return response.data
}

// Feature 2: Evaluate answer
export const evaluateAnswer = async ({ question, modelAnswer, userAnswer }) => {
    const response = await api.post("/api/interview/evaluate-answer", { question, modelAnswer, userAnswer })
    return response.data
}

// Feature 3: Toggle task
export const toggleTask = async ({ interviewId, dayIndex, taskIndex }) => {
    const response = await api.patch(`/api/interview/report/${interviewId}/tasks`, { dayIndex, taskIndex })
    return response.data
}

// Feature 3: Get streak
export const getStreak = async () => {
    const response = await api.get("/api/interview/streak")
    return response.data
}

// Feature 5: Toggle share
export const toggleShare = async (interviewId) => {
    const response = await api.patch(`/api/interview/report/${interviewId}/share`)
    return response.data
}

// Feature 5: Get public report
export const getPublicReport = async (interviewId) => {
    const response = await api.get(`/api/interview/public/${interviewId}`)
    return response.data
}

// Feature 6: Get analytics
export const getAnalytics = async () => {
    const response = await api.get("/api/interview/analytics")
    return response.data
}

// DSA: evaluate code/approach
export const evaluateDSASolution = async ({ title, description, approach, code, language }) => {
    const response = await api.post("/api/interview/dsa/evaluate", { title, description, approach, code, language })
    return response.data
}
