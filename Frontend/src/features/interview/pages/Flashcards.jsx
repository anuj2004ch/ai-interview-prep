import React, { useState, useEffect, useMemo, useRef } from 'react'
import '../style/flashcards.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams, useNavigate } from 'react-router'

const Flashcard = ({ item, index, total, onRate, showAnswer, setShowAnswer }) => {
    return (
        <div className='flash-scene'>
            <div className={`flash-card ${showAnswer ? 'flash-card--flipped' : ''}`}>
                {/* Front */}
                <div className='flash-card__face flash-card__face--front'>
                    <div className='flash-card__type'>
                        <span className={`flash-type-badge flash-type-badge--${item.type}`}>{item.type}</span>
                        <span className='flash-card__num'>{index + 1} / {total}</span>
                    </div>
                    <p className='flash-card__q'>{item.question}</p>
                    <button className='flash-flip-btn' onClick={() => setShowAnswer(true)}>
                        Reveal Answer →
                    </button>
                </div>

                {/* Back */}
                <div className='flash-card__face flash-card__face--back'>
                    <div className='flash-card__type'>
                        <span className={`flash-type-badge flash-type-badge--${item.type}`}>{item.type}</span>
                        <span className='flash-back-label'>Model Answer</span>
                    </div>
                    <p className='flash-card__intention'><em>Why asked:</em> {item.intention}</p>
                    <p className='flash-card__answer'>{item.answer}</p>
                    <div className='flash-rate'>
                        <p className='flash-rate__label'>How did you do?</p>
                        <div className='flash-rate__btns'>
                            <button className='flash-rate-btn flash-rate-btn--hard' onClick={() => onRate('hard')}>😓 Hard</button>
                            <button className='flash-rate-btn flash-rate-btn--ok'   onClick={() => onRate('ok')  }>🙂 OK</button>
                            <button className='flash-rate-btn flash-rate-btn--easy' onClick={() => onRate('easy')}>😎 Easy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const readRatings = interviewId => {
    try {
        const saved = localStorage.getItem(`flashcards-${interviewId}`)
        return saved ? JSON.parse(saved) : {}
    } catch {
        return {}
    }
}

const applyDeckFilter = (deck, filter, ratings) => {
    if (filter === 'hard') return deck.filter(card => ratings[card.uid] === 'hard' || !ratings[card.uid])
    if (filter === 'all') return deck
    return deck.filter(card => card.type === filter)
}

const Flashcards = () => {
    const { interviewId } = useParams()
    const navigate        = useNavigate()
    const { report, getReportById } = useInterview()

    const [currentIdx, setCurrentIdx] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [ratings, setRatings]     = useState(() => readRatings(interviewId))
    const [filter, setFilter]       = useState('all')
    const [done, setDone]           = useState(false)
    const [loadError, setLoadError] = useState(false)
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

    const deck = useMemo(() => {
        if (!report || report._id !== interviewId) return []
        const tech = (report.technicalQuestions  || []).map((q, i) => ({ ...q, type: 'technical',  uid: `t${i}` }))
        const beh  = (report.behavioralQuestions || []).map((q, i) => ({ ...q, type: 'behavioral', uid: `b${i}` }))
        return [...tech, ...beh]
    }, [interviewId, report])

    const filteredDeck = applyDeckFilter(deck, filter, ratings)

    const current = filteredDeck[currentIdx]

    const handleRate = (rating) => {
        const newRatings = { ...ratings, [current.uid]: rating }
        setRatings(newRatings)
        localStorage.setItem(`flashcards-${interviewId}`, JSON.stringify(newRatings))

        const nextDeck = applyDeckFilter(deck, filter, newRatings)
        const nextIndex = filter === 'hard' && rating !== 'hard' ? currentIdx : currentIdx + 1

        if (nextIndex >= nextDeck.length) {
            setDone(true)
        } else {
            setCurrentIdx(nextIndex)
            setShowAnswer(false)
        }
    }

    const handleRestart = () => {
        setCurrentIdx(0)
        setShowAnswer(false)
        setDone(false)
    }

    const easyCount = deck.filter(c => ratings[c.uid] === 'easy').length
    const okCount   = deck.filter(c => ratings[c.uid] === 'ok').length
    const hardCount = deck.filter(c => ratings[c.uid] === 'hard').length

    if (loadError) {
        return (
            <main className='loading-screen'>
                <h1>Could not load these flashcards.</h1>
                <button className='flash-action-btn flash-action-btn--ghost' onClick={() => navigate('/')}>← Back to dashboard</button>
            </main>
        )
    }

    if (!report || report._id !== interviewId || deck.length === 0) {
        return (
            <main className='loading-screen'>
                <div className='spinner'></div>
                <h1>Loading flashcards...</h1>
            </main>
        )
    }

    if (done) {
        return (
            <div className='flash-page'>
                <div className='flash-container'>
                    <div className='flash-done'>
                        <div className='flash-done__icon'>🃏</div>
                        <h1>Deck Complete!</h1>
                        <div className='flash-done__stats'>
                            <div className='flash-stat flash-stat--easy'>
                                <span className='flash-stat__val'>{easyCount}</span>
                                <span className='flash-stat__label'>Easy</span>
                            </div>
                            <div className='flash-stat flash-stat--ok'>
                                <span className='flash-stat__val'>{okCount}</span>
                                <span className='flash-stat__label'>OK</span>
                            </div>
                            <div className='flash-stat flash-stat--hard'>
                                <span className='flash-stat__val'>{hardCount}</span>
                                <span className='flash-stat__label'>Hard</span>
                            </div>
                        </div>
                        {hardCount > 0 && (
                            <p className='flash-done__hint'>
                                You have {hardCount} hard card{hardCount > 1 ? 's' : ''}.
                                Use the "Hard only" filter to drill them again.
                            </p>
                        )}
                        <div className='flash-done__actions'>
                            <button className='flash-action-btn flash-action-btn--primary' onClick={handleRestart}>
                                🔄 Restart Deck
                            </button>
                            {hardCount > 0 && (
                                <button className='flash-action-btn flash-action-btn--warn' onClick={() => { setFilter('hard'); handleRestart(); }}>
                                    😓 Drill Hard Cards
                                </button>
                            )}
                            <button className='flash-action-btn flash-action-btn--ghost' onClick={() => navigate(`/interview/${interviewId}`)}>
                                ← Back to Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!current) {
        return (
            <div className='flash-page'>
                <div className='flash-container'>
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '4rem' }}>
                        No cards for this filter.
                        <button onClick={() => { setFilter('all'); setCurrentIdx(0); }} style={{ color: '#d20d3b', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6 }}>
                            Show all
                        </button>
                    </p>
                </div>
            </div>
        )
    }

    const progress = filteredDeck.length > 0 ? ((currentIdx) / filteredDeck.length) * 100 : 0

    return (
        <div className='flash-page'>
            <div className='flash-container'>
                {/* Header */}
                <div className='flash-header'>
                    <button className='flash-back-btn' onClick={() => navigate(`/interview/${interviewId}`)}>← Back</button>
                    <h1 className='flash-title'>🃏 Flashcards</h1>
                    <div className='flash-filter'>
                        {['all', 'technical', 'behavioral', 'hard'].map(f => (
                            <button
                                key={f}
                                className={`flash-filter-btn ${filter === f ? 'flash-filter-btn--active' : ''}`}
                                onClick={() => { setFilter(f); setCurrentIdx(0); setShowAnswer(false); setDone(false); }}
                            >
                                {f === 'hard' ? '😓 Hard' : f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rating summary */}
                {Object.keys(ratings).length > 0 && (
                    <div className='flash-summary'>
                        <span className='flash-summary__item flash-summary__item--easy'>😎 {easyCount} easy</span>
                        <span className='flash-summary__item flash-summary__item--ok'>🙂 {okCount} ok</span>
                        <span className='flash-summary__item flash-summary__item--hard'>😓 {hardCount} hard</span>
                    </div>
                )}

                {/* Progress */}
                <div className='flash-progress'>
                    <div className='flash-progress__bar'>
                        <div className='flash-progress__fill' style={{ width: `${progress}%` }} />
                    </div>
                    <span className='flash-progress__label'>{currentIdx + 1} / {filteredDeck.length}</span>
                </div>

                <Flashcard
                    item={current}
                    index={currentIdx}
                    total={filteredDeck.length}
                    onRate={handleRate}
                    showAnswer={showAnswer}
                    setShowAnswer={setShowAnswer}
                />
            </div>
        </div>
    )
}

export default Flashcards
