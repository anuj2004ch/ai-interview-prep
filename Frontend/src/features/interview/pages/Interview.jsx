import React, { useState, useEffect, useRef } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, useNavigate } from 'react-router'
import DSACoding from './DSACoding'

const NAV_ITEMS = [
    { id: 'technical',  label: 'Technical Questions',  icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'dsa',        label: 'DSA / Coding',         icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><polyline points="9 9 12 12 15 9"/></svg> },
    { id: 'roadmap',    label: 'Road Map',             icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
    { id: 'skillgaps',  label: 'Skill Gaps',           icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
]

// ─── Feature 2: Answer Scorer ─────────────────────────────────────────────────
const AnswerScorer = ({ question, modelAnswer, scoreAnswer }) => {
    const [userAnswer, setUserAnswer] = useState('')
    const [result, setResult]         = useState(null)
    const [scoring, setScoring]       = useState(false)

    const handleScore = async () => {
        if (!userAnswer.trim()) return
        setScoring(true)
        setResult(null)
        try {
            const ev = await scoreAnswer({ question, modelAnswer, userAnswer })
            setResult(ev)
        } catch {
            setResult({ error: true })
        } finally {
            setScoring(false)
        }
    }

    const gradeColor = {
        'Excellent': '#22c55e', 'Good': '#84cc16',
        'Average': '#f59e0b', 'Needs Work': '#f97316', 'Poor': '#ef4444'
    }

    return (
        <div className='answer-scorer'>
            <p className='scorer-label'>Practice your answer</p>
            <textarea
                className='scorer-textarea'
                placeholder='Type your answer here and get AI feedback...'
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
            />
            <button className='scorer-btn' onClick={handleScore} disabled={scoring || !userAnswer.trim()}>
                {scoring ? 'Scoring...' : '⚡ Score My Answer'}
            </button>

            {result && !result.error && (
                <div className='scorer-result'>
                    <div className='scorer-header'>
                        <span className='scorer-score'>{result.score}/10</span>
                        <span className='scorer-grade' style={{ color: gradeColor[result.grade] || '#fff' }}>
                            {result.grade}
                        </span>
                    </div>
                    <div className='scorer-sections'>
                        <div className='scorer-section'>
                            <p className='scorer-section-title'>✓ Strengths</p>
                            <ul>{result.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                        <div className='scorer-section'>
                            <p className='scorer-section-title'>↑ Improve</p>
                            <ul>{result.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                    </div>
                    {result.tip && <p className='scorer-tip'>💡 {result.tip}</p>}
                </div>
            )}
            {result?.error && <p className='scorer-error'>Could not score answer. Please try again.</p>}
        </div>
    )
}

// ─── Question Card ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, scoreAnswer }) => {
    const [open, setOpen]           = useState(false)
    const [showScorer, setShowScorer] = useState(false)

    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                    <button
                        className='practice-toggle-btn'
                        onClick={() => setShowScorer(s => !s)}
                    >
                        {showScorer ? '▲ Hide Practice' : '✏ Practice This Answer'}
                    </button>
                    {showScorer && (
                        <AnswerScorer
                            question={item.question}
                            modelAnswer={item.answer}
                            scoreAnswer={scoreAnswer}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Feature 3: Roadmap Day with task checkboxes ──────────────────────────────
const RoadMapDay = ({ day, dayIndex, checkedTasks, onToggle }) => {
    const isChecked = (taskIndex) =>
        checkedTasks?.some(t => t.dayIndex === dayIndex && t.taskIndex === taskIndex)

    const totalTasks   = day.tasks.length
    const doneTasks    = day.tasks.filter((_, i) => isChecked(i)).length
    const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return (
        <div className={`roadmap-day ${doneTasks === totalTasks ? 'roadmap-day--complete' : ''}`}>
            <div className='roadmap-day__header'>
                <div className='roadmap-day__badge-row'>
                    <span className='roadmap-day__badge'>Day {day.day}</span>
                    <span className='roadmap-day__progress-text'>{doneTasks}/{totalTasks}</span>
                </div>
                <h3 className='roadmap-day__focus'>{day.focus}</h3>
                <div className='roadmap-day__progress-bar'>
                    <div className='roadmap-day__progress-fill' style={{ width: `${progress}%` }} />
                </div>
            </div>
            <ul className='roadmap-day__tasks'>
                {day.tasks.map((task, i) => (
                    <li
                        key={i}
                        className={`roadmap-task ${isChecked(i) ? 'roadmap-task--done' : ''}`}
                        onClick={() => onToggle(dayIndex, i)}
                    >
                        <span className='roadmap-task__check'>
                            {isChecked(i)
                                ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                            }
                        </span>
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    )
}

// ─── Skill Gap Badge ──────────────────────────────────────────────────────────
const SkillGapBadge = ({ gap }) => (
    <div className={`skill-gap skill-gap--${gap.severity}`}>
        <span className='skill-gap__name'>{gap.skill}</span>
        <span className='skill-gap__severity'>{gap.severity}</span>
    </div>
)

// ─── Main Interview Page ──────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav]     = useState('technical')
    const [isDownloading, setIsDownloading] = useState(false)
    const [shareMsg, setShareMsg]       = useState('')
    const [loadError, setLoadError]     = useState(false)
    const requestedReportRef = useRef(null)
    const { report, getReportById, getResumePdf, scoreAnswer, toggleTaskCompletion, toggleReportShare } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        let active = true
        if (interviewId && requestedReportRef.current !== interviewId) {
            requestedReportRef.current = interviewId
            getReportById(interviewId).catch(() => {
                if (active) setLoadError(true)
            })
        }
        return () => {
            active = false
        }
    }, [getReportById, interviewId])

    const handleDownloadClick = async (e) => {
        e.preventDefault()
        if (isDownloading) return
        setIsDownloading(true)
        try { await getResumePdf(interviewId) }
        catch { setShareMsg('Could not generate the resume PDF. Please try again.') }
        finally { setIsDownloading(false) }
    }

    // Feature 5: Share toggle
    const handleShare = async () => {
        try {
            const isNowPublic = await toggleReportShare(interviewId)
            if (isNowPublic) {
                const url = `${window.location.origin}/share/${interviewId}`
                await navigator.clipboard.writeText(url)
                setShareMsg('🔗 Link copied to clipboard!')
            } else {
                setShareMsg('🔒 Report is now private.')
            }
            setTimeout(() => setShareMsg(''), 3000)
        } catch { setShareMsg('Failed to update sharing.') }
    }

    // Feature 3: task toggle
    const handleTaskToggle = async (dayIndex, taskIndex) => {
        try {
            await toggleTaskCompletion({ interviewId, dayIndex, taskIndex })
        } catch {
            setShareMsg('Could not update this task. Please try again.')
        }
    }

    if (loadError) {
        return (
            <main className='loading-screen'>
                <h1>Interview plan not found.</h1>
                <button className='nav-mock-btn' onClick={() => navigate('/')}>← Back to dashboard</button>
            </main>
        )
    }

    if (!report || report._id !== interviewId) {
        return (
            <main className='loading-screen'>
                <div className='spinner'></div>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'

    // Roadmap progress
    const totalTasks  = report.preparationPlan?.reduce((s, d) => s + d.tasks.length, 0) || 0
    const doneTasks   = report.checkedTasks?.length || 0
    const overallPct  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return (
        <div className='interview-page'>
            <div className='interview-layout'>
                {/* Sidebar nav */}
                <nav className='interview-nav'>
                    <div className='nav-content'>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}

                        <div className='nav-divider' />

                        {/* Feature 1: Mock Interview */}
                        <button
                            className='nav-mock-btn'
                            onClick={() => navigate(`/mock/${interviewId}`)}
                        >
                            🎤 Mock Interview
                        </button>

                        {/* Feature 4: Flashcards */}
                        <button
                            className='nav-flash-btn'
                            onClick={() => navigate(`/flashcards/${interviewId}`)}
                        >
                            🃏 Flashcards
                        </button>
                    </div>
                </nav>

                {/* Main content */}
                <main className='interview-main'>
                    {/* Header */}
                    <div className='interview-header'>
                        <div>
                            <h1 className='interview-title'>{report.title}</h1>
                            <div className='interview-meta'>
                                <span className={`match-badge ${scoreColor}`}>
                                    Match Score: {report.matchScore}%
                                </span>
                                {totalTasks > 0 && (
                                    <span className='prep-badge'>
                                        Prep: {overallPct}% done
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className='interview-actions'>
                            {/* Feature 5: Share button */}
                            <button
                                className={`share-btn ${report.isPublic ? 'share-btn--active' : ''}`}
                                onClick={handleShare}
                                title={report.isPublic ? 'Click to make private' : 'Click to share'}
                            >
                                {report.isPublic ? '🔗 Shared' : '↗ Share'}
                            </button>
                            <a href='#' className='download-btn' onClick={handleDownloadClick}>
                                {isDownloading ? 'Generating...' : '↓ Download Resume'}
                            </a>
                        </div>
                    </div>

                    {shareMsg && <div className='share-toast'>{shareMsg}</div>}

                    {/* Content sections */}
                    {activeNav === 'technical' && (
                        <section className='q-section'>
                            <h2>Technical Questions <span className='q-count'>({report.technicalQuestions?.length || 0})</span></h2>
                            {report.technicalQuestions?.map((item, i) => (
                                <QuestionCard key={i} item={item} index={i} scoreAnswer={scoreAnswer} />
                            ))}
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section className='q-section'>
                            <h2>Behavioral Questions <span className='q-count'>({report.behavioralQuestions?.length || 0})</span></h2>
                            {report.behavioralQuestions?.map((item, i) => (
                                <QuestionCard key={i} item={item} index={i} scoreAnswer={scoreAnswer} />
                            ))}
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section className='roadmap-section'>
                            <h2>Preparation Road Map</h2>
                            <div className='roadmap-overall'>
                                <span>Overall progress</span>
                                <div className='roadmap-overall__bar'>
                                    <div className='roadmap-overall__fill' style={{ width: `${overallPct}%` }} />
                                </div>
                                <span className='roadmap-overall__pct'>{overallPct}%</span>
                            </div>
                            {report.preparationPlan?.map((day, i) => (
                                <RoadMapDay
                                    key={i}
                                    day={day}
                                    dayIndex={i}
                                    checkedTasks={report.checkedTasks}
                                    onToggle={handleTaskToggle}
                                />
                            ))}
                        </section>
                    )}

                    {activeNav === 'dsa' && (
                        <DSACoding problems={report.dsaQuestions} />
                    )}

                    {activeNav === 'skillgaps' && (
                        <section className='skillgaps-section'>
                            <h2>Skill Gaps Analysis</h2>
                            <p className='skillgaps-intro'>Focus on these areas to increase your match score.</p>
                            <div className='skillgaps-grid'>
                                {report.skillGaps?.map((gap, i) => (
                                    <SkillGapBadge key={i} gap={gap} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Interview
