import { useState } from "react"
import { InterviewContext } from "./interview.context"

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState(null)
    const [reports, setReports] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [streak, setStreak] = useState(0)

    return (
        <InterviewContext.Provider value={{
            loading, setLoading,
            report, setReport,
            reports, setReports,
            analytics, setAnalytics,
            streak, setStreak
        }}>
            {children}
        </InterviewContext.Provider>
    )
}
