import React, { useState, useEffect, useMemo, useRef } from 'react'
import '../style/mock.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, useNavigate } from 'react-router'

const MockInterview = () => {
    const { interviewId } = useParams()
    const navigate        = useNavigate()
    const { report, getReportById, scoreAnswer } = useInterview()

    const [currentIdx, setCurrentIdx]       = useState(0)
    const [userAnswer, setUserAnswer]       = useState('')
    const [result, setResult]               = useState(null)
    const [scoring, setScoring]             = useState(false)
    const [phase, setPhase]                 = useState('question') // question | result | finished
    const [sessionResults, setSessionResults] = useState([])
    const [filter, setFilter]               = useState('all') // all | technical | behavioral
    const [loadError, setLoadError]         = useState(false)

    const textareaRef = useRef()
    const requestedReportRef = useRef(null)

    useEffect(() => {
        let active = true
        if (requestedReportRef.current !== interviewId) {
            requestedReportRef.current = interviewId
            getReportById(interviewId).catch(() => {
                if (active) setLoadError(true)
            })
        }
        return () => {
            active = false
        }
    }, [getReportById, interviewId])

    const allQuestions = useMemo(() => {
        if (!report || report._id !== interviewId) return []
        const tech = (report.technicalQuestions  || []).map(q => ({ ...q, type: 'technical' }))
        const beh  = (report.behavioralQuestions || []).map(q => ({ ...q, type: 'behavioral' }))
        return [...tech, ...beh]
    }, [interviewId, report])

    const questions = filter === 'all'
        ? allQuestions
        : allQuestions.filter(q => q.type === filter)

    const currentQ = questions[currentIdx]

    const handleSubmit = async () => {
        if (!userAnswer.trim() || scoring) return
        setScoring(true)
        try {
            const ev = await scoreAnswer({
                question:    currentQ.question,
                modelAnswer: currentQ.answer,
                userAnswer
            })
            setResult(ev)
            setSessionResults(prev => [...prev, { question: currentQ.question, type: currentQ.type, score: ev.score, grade: ev.grade }])
            setPhase('result')
        } catch {
            setResult({ error: true })
            setPhase('result')
        } finally {
            setScoring(false)
        }
    }

    const handleNext = () => {
        if (currentIdx + 1 >= questions.length) {
            setPhase('finished')
        } else {
            setCurrentIdx(i => i + 1)
            setUserAnswer('')
            setResult(null)
            setPhase('question')
            setTimeout(() => textareaRef.current?.focus(), 100)
        }
    }

    const handleRestart = () => {
        setCurrentIdx(0)
        setUserAnswer('')
        setResult(null)
        setSessionResults([])
        setPhase('question')
    }

    const gradeColor = {
        Excellent: '#22c55e', Good: '#84cc16',
        Average: '#f59e0b', 'Needs Work': '#f97316', Poor: '#ef4444'
    }

    if (loadError) {
        return (
            <main className='loading-screen'>
                <h1>Could not load this mock interview.</h1>
                <button className='mock-btn mock-btn--ghost' onClick={() => navigate('/')}>← Back to dashboard</button>
            </main>
        )
    }

    if (!report || report._id !== interviewId || allQuestions.length === 0) {
        return (
            <main className='loading-screen'>
                <div className='spinner'></div>
                <h1>Loading mock interview...</h1>
            </main>
        )
    }

    // Finished screen
    if (phase === 'finished') {
        const avgScore = sessionResults.length
            ? (sessionResults.reduce((s, r) => s + r.score, 0) / sessionResults.length).toFixed(1)
            : 0

        return (
            <div className='mock-page'>
                <div className='mock-container'>
                    <div className='mock-finished'>
                        <div className='mock-finished__icon'>🎉</div>
                        <h1>Mock Interview Complete!</h1>
                        <div className='mock-finished__score'>
                            <span className='mock-finished__avg'>{avgScore}</span>
                            <span className='mock-finished__label'>/ 10 avg score</span>
                        </div>
                        <div className='mock-finished__results'>
                            {sessionResults.map((r, i) => (
                                <div key={i} className='mock-result-row'>
                                    <span className='mock-result-row__type'>{r.type}</span>
                                    <span className='mock-result-row__q'>{r.question.slice(0, 60)}...</span>
                                    <span className='mock-result-row__score' style={{ color: gradeColor[r.grade] }}>
                                        {r.score}/10
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className='mock-finished__actions'>
                            <button className='mock-btn mock-btn--primary' onClick={handleRestart}>
                                🔄 Try Again
                            </button>
                            <button className='mock-btn mock-btn--ghost' onClick={() => navigate(`/interview/${interviewId}`)}>
                                ← Back to Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentQ) {
        return (
            <div className='mock-page'>
                <div className='mock-container'>
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '4rem' }}>
                        No questions for this filter. <button onClick={() => setFilter('all')} style={{ color: '#d20d3b', background: 'none', border: 'none', cursor: 'pointer' }}>Show all</button>
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='mock-page'>
            <div className='mock-container'>
                {/* Header */}
                <div className='mock-header'>
                    <button className='mock-back-btn' onClick={() => navigate(`/interview/${interviewId}`)}>
                        ← Back
                    </button>
                    <h1 className='mock-title'>🎤 Mock Interview</h1>
                    <div className='mock-filter'>
                        {['all', 'technical', 'behavioral'].map(f => (
                            <button
                                key={f}
                                className={`mock-filter-btn ${filter === f ? 'mock-filter-btn--active' : ''}`}
                                onClick={() => { setFilter(f); setCurrentIdx(0); setUserAnswer(''); setResult(null); setSessionResults([]); setPhase('question'); }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress */}
                <div className='mock-progress'>
                    <div className='mock-progress__bar'>
                        <div
                            className='mock-progress__fill'
                            style={{ width: `${((currentIdx + (phase === 'result' ? 1 : 0)) / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className='mock-progress__label'>{currentIdx + 1} / {questions.length}</span>
                </div>

                {/* Question card */}
                <div className='mock-card'>
                    <div className='mock-card__type'>
                        <span className={`mock-type-badge mock-type-badge--${currentQ.type}`}>
                            {currentQ.type}
                        </span>
                        <span className='mock-card__num'>Question {currentIdx + 1}</span>
                    </div>
                    <p className='mock-card__question'>{currentQ.question}</p>

                    {phase === 'question' && (
                        <>
                            <textarea
                                ref={textareaRef}
                                className='mock-textarea'
                                placeholder='Type your answer here. Take your time — think before you write...'
                                value={userAnswer}
                                onChange={e => setUserAnswer(e.target.value)}
                                autoFocus
                            />
                            <div className='mock-card__footer'>
                                <span className='mock-char'>{userAnswer.length} chars</span>
                                <button
                                    className='mock-btn mock-btn--primary'
                                    onClick={handleSubmit}
                                    disabled={scoring || !userAnswer.trim()}
                                >
                                    {scoring ? '⏳ Scoring...' : '⚡ Submit Answer'}
                                </button>
                            </div>
                        </>
                    )}

                    {phase === 'result' && result && !result.error && (
                        <div className='mock-result'>
                            <div className='mock-result__header'>
                                <div>
                                    <span className='mock-result__score'>{result.score}</span>
                                    <span className='mock-result__denom'>/10</span>
                                </div>
                                <span className='mock-result__grade' style={{ color: gradeColor[result.grade] }}>
                                    {result.grade}
                                </span>
                            </div>

                            <div className='mock-result__your-answer'>
                                <p className='mock-result__section-title'>Your answer</p>
                                <p className='mock-result__your-text'>{userAnswer}</p>
                            </div>

                            <div className='mock-result__model'>
                                <p className='mock-result__section-title'>Model answer</p>
                                <p>{currentQ.answer}</p>
                            </div>

                            <div className='mock-result__feedback'>
                                <div className='mock-result__col'>
                                    <p className='mock-result__section-title'>✓ Strengths</p>
                                    <ul>{result.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                </div>
                                <div className='mock-result__col'>
                                    <p className='mock-result__section-title'>↑ Improve</p>
                                    <ul>{result.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                </div>
                            </div>

                            {result.tip && (
                                <div className='mock-result__tip'>💡 {result.tip}</div>
                            )}

                            <button className='mock-btn mock-btn--primary' onClick={handleNext}>
                                {currentIdx + 1 >= questions.length ? '🎉 Finish' : 'Next Question →'}
                            </button>
                        </div>
                    )}

                    {phase === 'result' && result?.error && (
                        <div className='mock-error'>
                            <p>Could not score answer. Please try again.</p>
                            <button className='mock-btn mock-btn--ghost' onClick={() => setPhase('question')}>Retry</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MockInterview
