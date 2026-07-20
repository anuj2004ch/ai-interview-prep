import React, { useEffect, useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth.js'

// ─── Feature 6: Mini Analytics Dashboard ──────────────────────────────────────
const AnalyticsDashboard = ({ analytics }) => {
    if (!analytics || analytics.totalReports === 0) return null

    const { scoreTrend, topSkillGaps, totalReports, avgScore } = analytics
    const avgColor = avgScore >= 80 ? '#22c55e' : avgScore >= 60 ? '#f59e0b' : '#ef4444'
    const severityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
    const maxScore = 100

    return (
        <section className='analytics-panel'>
            <h2 className='analytics-title'>📊 Your Progress</h2>

            {/* Summary cards */}
            <div className='analytics-summary'>
                <div className='analytics-stat'>
                    <span className='analytics-stat__val'>{totalReports}</span>
                    <span className='analytics-stat__label'>Reports</span>
                </div>
                <div className='analytics-stat'>
                    <span className='analytics-stat__val' style={{ color: avgColor }}>{avgScore}%</span>
                    <span className='analytics-stat__label'>Avg Match</span>
                </div>
                <div className='analytics-stat'>
                    <span className='analytics-stat__val' style={{ color: '#a78bfa' }}>
                        {scoreTrend.length >= 2
                            ? `${scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score > 0 ? '+' : ''}${scoreTrend[scoreTrend.length - 1].score - scoreTrend[0].score}%`
                            : '—'
                        }
                    </span>
                    <span className='analytics-stat__label'>Trend</span>
                </div>
            </div>

            <div className='analytics-body'>
                {/* Score chart */}
                {scoreTrend.length > 1 && (
                    <div className='analytics-chart'>
                        <p className='analytics-chart__label'>Match Score History</p>
                        <div className='analytics-bars'>
                            {scoreTrend.map((item, i) => (
                                <div key={i} className='analytics-bar-wrap'>
                                    <div className='analytics-bar-outer'>
                                        <div
                                            className='analytics-bar-fill'
                                            style={{
                                                height: `${(item.score / maxScore) * 100}%`,
                                                background: item.score >= 80 ? '#22c55e' : item.score >= 60 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <span className='analytics-bar-val'>{item.score}%</span>
                                    <span className='analytics-bar-name'>{item.title?.slice(0, 10) || `#${i + 1}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skill gaps */}
                {topSkillGaps.length > 0 && (
                    <div className='analytics-gaps'>
                        <p className='analytics-chart__label'>Recurring Skill Gaps</p>
                        <div className='analytics-gap-list'>
                            {topSkillGaps.map((gap, i) => (
                                <div key={i} className='analytics-gap-item'>
                                    <span className='analytics-gap-name'>{gap.skill}</span>
                                    <div className='analytics-gap-bar'>
                                        <div
                                            className='analytics-gap-fill'
                                            style={{
                                                width: `${(gap.count / totalReports) * 100}%`,
                                                background: severityColor[gap.severity] || '#888'
                                            }}
                                        />
                                    </div>
                                    <span className='analytics-gap-count'>{gap.count}x</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = () => {
    const { loading, generateReport, loadDashboard, reports, analytics, streak } = useInterview()
    const { handleLogout } = useAuth()
    const [jobDescription, setJobDescription]   = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName]               = useState("")
    const [generateError, setGenerateError]     = useState("")
    const resumeInputRef = useRef()
    const dashboardLoadedRef = useRef(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (dashboardLoadedRef.current) return
        dashboardLoadedRef.current = true
        loadDashboard().catch(() => setGenerateError("Could not load all dashboard data. Please refresh to try again."))
    }, [loadDashboard])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
            setGenerateError("Please select a PDF resume.")
            e.target.value = ""
            setFileName("")
            return
        }

        if (file.size > 3 * 1024 * 1024) {
            setGenerateError("Resume must be 3MB or smaller.")
            e.target.value = ""
            setFileName("")
            return
        }

        setGenerateError("")
        setFileName(file.name)
    }

    const handleGenerateReport = async () => {
        setGenerateError("")
        if (!jobDescription.trim()) {
            setGenerateError("Please paste a job description first.")
            return
        }
        const resumeFile = resumeInputRef.current?.files[0]
        if (!resumeFile && !selfDescription.trim()) {
            setGenerateError("Please upload your resume or write a self description.")
            return
        }
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (data?._id) navigate(`/interview/${data._id}`)
        } catch (error) {
            setGenerateError(error?.response?.data?.message || "Something went wrong. Please try again.")
        }
    }

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate("/login", { replace: true })
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className="spinner"></div>
                <h1>Preparing your interview dashboard...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header with streak */}
            <header className='page-header'>
                <div className='page-header__main'>
                    <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                    <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
                </div>
                <div className='page-header__actions'>
                    {streak > 0 && (
                        <div className='streak-badge'>
                            <span className='streak-badge__fire'>🔥</span>
                            <span className='streak-badge__val'>{streak}</span>
                            <span className='streak-badge__label'>{streak === 1 ? 'day' : 'days'} streak</span>
                        </div>
                    )}
                    <button className='logout-btn' onClick={handleLogoutClick}>Log out</button>
                </div>
            </header>

            {/* Analytics dashboard (Feature 6) */}
            <AnalyticsDashboard analytics={analytics} />

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>REQUIRED</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className='upload-section'>
                            <div className='section-label-group'>
                                <label className='section-label'>Upload Resume</label>
                                <span className='badge badge--best'>BEST RESULTS</span>
                            </div>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink, #d20d3b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                </span>
                                <p className='dropzone__title'>
                                    {fileName
                                        ? <span className="file-selected">✓ {fileName}</span>
                                        : "Click to upload or drag & drop"
                                    }
                                </p>
                                {!fileName && <p className='dropzone__subtitle'>PDF (Max 3MB)</p>}
                                <input onChange={handleFileChange} ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf' />
                            </label>
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required.</p>
                        </div>
                    </div>
                </div>

                {generateError && (
                    <div className='generate-error'>{generateError}</div>
                )}

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; ~30 seconds</span>
                    <button onClick={handleGenerateReport} className='generate-btn' disabled={loading}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports */}
            {reports && reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <div className='report-item__info'>
                                    <h3>{report.title || 'Untitled Position'}</h3>
                                    <p className='report-meta'>{new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className='report-item__right'>
                                    <span className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>
                                        {report.matchScore}%
                                    </span>
                                    {report.isPublic && <span className='public-badge'>🔗 Shared</span>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home
