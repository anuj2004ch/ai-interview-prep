import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useParams, Link } from 'react-router'
import { getPublicReport } from '../services/interview.api'

const PublicReport = () => {
    const { interviewId } = useParams()
    const [report, setReport]   = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState(false)
    const [activeNav, setActiveNav] = useState('technical')

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getPublicReport(interviewId)
                setReport(res.interviewReport)
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [interviewId])

    if (loading) return (
        <main className='loading-screen'>
            <div className='spinner'></div>
            <h1>Loading shared report...</h1>
        </main>
    )

    if (error || !report) return (
        <main className='loading-screen'>
            <h1 style={{ color: '#ef4444' }}>Report not found or is not public.</h1>
            <Link to='/login' style={{ color: '#d20d3b', textDecoration: 'none', marginTop: '1rem', display: 'inline-block' }}>
                ← Sign in to create your own
            </Link>
        </main>
    )

    const NAV_ITEMS = [
        { id: 'technical',  label: 'Technical Questions'  },
        { id: 'behavioral', label: 'Behavioral Questions' },
        { id: 'roadmap',    label: 'Road Map'             },
        { id: 'skillgaps',  label: 'Skill Gaps'           },
    ]

    const scoreColor = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            {/* Public banner */}
            <div style={{
                background: 'rgba(167,139,250,.1)',
                border: '1px solid rgba(167,139,250,.25)',
                borderRadius: 8,
                padding: '10px 18px',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                maxWidth: 1200,
                margin: '0 auto 1rem'
            }}>
                <span style={{ fontSize: 13, color: '#a78bfa' }}>
                    🔗 This is a shared read-only interview plan
                </span>
                <Link to='/register' style={{
                    background: '#d20d3b', color: '#fff', padding: '6px 16px',
                    borderRadius: 7, textDecoration: 'none', fontSize: 13, fontWeight: 600
                }}>
                    Create Your Own Free →
                </Link>
            </div>

            <div className='interview-layout'>
                <nav className='interview-nav'>
                    <div className='nav-content'>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                <main className='interview-main'>
                    <div className='interview-header'>
                        <div>
                            <h1 className='interview-title'>{report.title}</h1>
                            <span className={`match-badge ${scoreColor}`}>
                                Match Score: {report.matchScore}%
                            </span>
                        </div>
                    </div>

                    {activeNav === 'technical' && (
                        <section className='q-section'>
                            <h2>Technical Questions <span className='q-count'>({report.technicalQuestions?.length || 0})</span></h2>
                            {report.technicalQuestions?.map((item, i) => (
                                <PublicQuestionCard key={i} item={item} index={i} />
                            ))}
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section className='q-section'>
                            <h2>Behavioral Questions <span className='q-count'>({report.behavioralQuestions?.length || 0})</span></h2>
                            {report.behavioralQuestions?.map((item, i) => (
                                <PublicQuestionCard key={i} item={item} index={i} />
                            ))}
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section className='roadmap-section'>
                            <h2>Preparation Road Map</h2>
                            {report.preparationPlan?.map((day, i) => (
                                <div key={i} className='roadmap-day'>
                                    <div className='roadmap-day__header'>
                                        <div className='roadmap-day__badge-row'>
                                            <span className='roadmap-day__badge'>Day {day.day}</span>
                                        </div>
                                        <h3 className='roadmap-day__focus'>{day.focus}</h3>
                                    </div>
                                    <ul className='roadmap-day__tasks'>
                                        {day.tasks.map((task, j) => (
                                            <li key={j} className='roadmap-task' style={{ cursor: 'default' }}>
                                                <span className='roadmap-task__check'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                                                </span>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    )}

                    {activeNav === 'skillgaps' && (
                        <section className='skillgaps-section'>
                            <h2>Skill Gaps Analysis</h2>
                            <p className='skillgaps-intro'>Key areas to focus on for this role.</p>
                            <div className='skillgaps-grid'>
                                {report.skillGaps?.map((gap, i) => (
                                    <div key={i} className={`skill-gap skill-gap--${gap.severity}`}>
                                        <span className='skill-gap__name'>{gap.skill}</span>
                                        <span className='skill-gap__severity'>{gap.severity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    )
}

const PublicQuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
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
                </div>
            )}
        </div>
    )
}

export default PublicReport
