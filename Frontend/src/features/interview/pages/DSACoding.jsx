import React, { useState } from 'react'
import '../style/dsa.scss'
import { evaluateDSASolution } from '../services/interview.api'

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'C++', 'C', 'Go', 'TypeScript', 'Rust']

const difficultyColor = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' }
const gradeColor = {
    Excellent: '#22c55e', Good: '#84cc16',
    Average: '#f59e0b', 'Needs Work': '#f97316', Poor: '#ef4444'
}

// ─── Hint System ──────────────────────────────────────────────────────────────
const HintSystem = ({ hints }) => {
    const [revealed, setRevealed] = useState(0)

    return (
        <div className='dsa-hints'>
            <p className='dsa-hints__label'>💡 Hints ({revealed}/{hints.length} revealed)</p>
            <div className='dsa-hints__list'>
                {hints.map((hint, i) => (
                    <div key={i} className={`dsa-hint ${i < revealed ? 'dsa-hint--revealed' : ''}`}>
                        {i < revealed
                            ? <><span className='dsa-hint__num'>Hint {i + 1}</span> {hint}</>
                            : <span className='dsa-hint__locked'>🔒 Hint {i + 1} — click to reveal</span>
                        }
                        {i === revealed && (
                            <button className='dsa-hint__reveal-btn' onClick={() => setRevealed(r => r + 1)}>
                                Reveal
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Result Panel ─────────────────────────────────────────────────────────────
const ResultPanel = ({ result }) => {
    return (
        <div className='dsa-result'>
            {/* Score header */}
            <div className='dsa-result__header'>
                <div className='dsa-result__score-block'>
                    <span className='dsa-result__score'>{result.score}</span>
                    <span className='dsa-result__denom'>/10</span>
                </div>
                <div className='dsa-result__meta'>
                    <span className='dsa-result__grade' style={{ color: gradeColor[result.grade] }}>
                        {result.grade}
                    </span>
                    <span className={`dsa-result__correct ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                        {result.isCorrect ? '✓ Correct' : '✗ Incorrect / Incomplete'}
                    </span>
                </div>
                <div className='dsa-result__complexity'>
                    <div className='dsa-complexity-item'>
                        <span className='dsa-complexity-item__label'>Your Time</span>
                        <span className='dsa-complexity-item__val'>{result.timeComplexity || '—'}</span>
                    </div>
                    <div className='dsa-complexity-item'>
                        <span className='dsa-complexity-item__label'>Your Space</span>
                        <span className='dsa-complexity-item__val'>{result.spaceComplexity || '—'}</span>
                    </div>
                    <div className='dsa-complexity-item dsa-complexity-item--optimal'>
                        <span className='dsa-complexity-item__label'>Optimal Time</span>
                        <span className='dsa-complexity-item__val'>{result.optimalTimeComplexity || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Approach feedback */}
            {result.approachFeedback && (
                <div className='dsa-result__section'>
                    <p className='dsa-result__section-title'>🧠 Approach Feedback</p>
                    <p>{result.approachFeedback}</p>
                </div>
            )}

            {/* Code feedback */}
            {result.codeFeedback && (
                <div className='dsa-result__section'>
                    <p className='dsa-result__section-title'>💻 Code Feedback</p>
                    <p>{result.codeFeedback}</p>
                </div>
            )}

            {/* Bugs + improvements */}
            <div className='dsa-result__two-col'>
                {result.bugs?.length > 0 && (
                    <div className='dsa-result__col dsa-result__col--bugs'>
                        <p className='dsa-result__section-title'>🐛 Issues Found</p>
                        <ul>{result.bugs.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                )}
                {result.improvements?.length > 0 && (
                    <div className='dsa-result__col'>
                        <p className='dsa-result__section-title'>↑ Improvements</p>
                        <ul>{result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}</ul>
                    </div>
                )}
            </div>

            {/* Optimized hint */}
            {result.optimizedHint && (
                <div className='dsa-result__optimized-hint'>
                    🚀 <strong>Towards Optimal:</strong> {result.optimizedHint}
                </div>
            )}

            {/* Tip */}
            {result.tip && (
                <div className='dsa-result__tip'>💡 {result.tip}</div>
            )}
        </div>
    )
}

// ─── Single DSA Problem Card ──────────────────────────────────────────────────
const DSAProblemCard = ({ problem, index }) => {
    const [expanded, setExpanded]     = useState(false)
    const [approach, setApproach]     = useState('')
    const [code, setCode]             = useState('')
    const [language, setLanguage]     = useState('Python')
    const [result, setResult]         = useState(null)
    const [evaluating, setEvaluating] = useState(false)
    const [activeTab, setActiveTab]   = useState('approach') // approach | code | solution
    const [showSolution, setShowSolution] = useState(false)

    const handleEvaluate = async () => {
        if (!approach.trim() && !code.trim()) return
        setEvaluating(true)
        setResult(null)
        try {
            const res = await evaluateDSASolution({
                title: problem.title,
                description: problem.description,
                approach, code, language
            })
            setResult(res.result)
            setActiveTab('approach')
        } catch {
            setResult({ error: true })
        } finally {
            setEvaluating(false)
        }
    }

    return (
        <div className={`dsa-card ${expanded ? 'dsa-card--expanded' : ''}`}>
            {/* Problem header */}
            <div className='dsa-card__header' onClick={() => setExpanded(e => !e)}>
                <div className='dsa-card__header-left'>
                    <span className='dsa-card__num'>#{index + 1}</span>
                    <div>
                        <p className='dsa-card__title'>{problem.title}</p>
                        <div className='dsa-card__meta'>
                            <span
                                className='dsa-difficulty'
                                style={{ color: difficultyColor[problem.difficulty], borderColor: difficultyColor[problem.difficulty] + '44', background: difficultyColor[problem.difficulty] + '11' }}
                            >
                                {problem.difficulty}
                            </span>
                            {problem.tags?.map((tag, i) => (
                                <span key={i} className='dsa-tag'>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <span className={`dsa-card__chevron ${expanded ? 'dsa-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
            </div>

            {expanded && (
                <div className='dsa-card__body'>
                    {/* Problem description */}
                    <div className='dsa-problem'>
                        <p className='dsa-problem__desc'>{problem.description}</p>

                        {/* Examples */}
                        {problem.examples?.length > 0 && (
                            <div className='dsa-examples'>
                                {problem.examples.map((ex, i) => (
                                    <div key={i} className='dsa-example'>
                                        <p className='dsa-example__label'>Example {i + 1}</p>
                                        <div className='dsa-example__io'>
                                            <div><span className='dsa-io-label'>Input:</span> <code>{ex.input}</code></div>
                                            <div><span className='dsa-io-label'>Output:</span> <code>{ex.output}</code></div>
                                            {ex.explanation && <div className='dsa-example__expl'>{ex.explanation}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Constraints */}
                        {problem.constraints?.length > 0 && (
                            <div className='dsa-constraints'>
                                <p className='dsa-constraints__label'>Constraints</p>
                                <ul>{problem.constraints.map((c, i) => <li key={i}><code>{c}</code></li>)}</ul>
                            </div>
                        )}

                        {/* Complexity badges */}
                        {(problem.timeComplexity || problem.spaceComplexity) && showSolution && (
                            <div className='dsa-complexity-row'>
                                <span className='dsa-complexity-badge'>⏱ Optimal Time: {problem.timeComplexity}</span>
                                <span className='dsa-complexity-badge'>💾 Optimal Space: {problem.spaceComplexity}</span>
                            </div>
                        )}
                    </div>

                    {/* Hints */}
                    {problem.hints?.length > 0 && <HintSystem hints={problem.hints} />}

                    {/* Editor tabs */}
                    <div className='dsa-editor-section'>
                        <div className='dsa-tabs'>
                            <button
                                className={`dsa-tab ${activeTab === 'approach' ? 'dsa-tab--active' : ''}`}
                                onClick={() => setActiveTab('approach')}
                            >
                                🧠 Approach
                            </button>
                            <button
                                className={`dsa-tab ${activeTab === 'code' ? 'dsa-tab--active' : ''}`}
                                onClick={() => setActiveTab('code')}
                            >
                                💻 Code
                            </button>
                            {showSolution && (
                                <button
                                    className={`dsa-tab ${activeTab === 'solution' ? 'dsa-tab--active' : ''}`}
                                    onClick={() => setActiveTab('solution')}
                                >
                                    ✅ Model Solution
                                </button>
                            )}
                        </div>

                        {activeTab === 'approach' && (
                            <div className='dsa-editor-pane'>
                                <p className='dsa-editor-hint'>Explain your thinking: data structures you'd use, steps to solve it, edge cases you'd handle.</p>
                                <textarea
                                    className='dsa-approach-textarea'
                                    placeholder='e.g. I would use a hashmap to store visited values. Iterate through the array once and for each element check if target - element exists in the map...'
                                    value={approach}
                                    onChange={e => setApproach(e.target.value)}
                                />
                            </div>
                        )}

                        {activeTab === 'code' && (
                            <div className='dsa-editor-pane'>
                                <div className='dsa-lang-row'>
                                    <p className='dsa-editor-hint'>Write your solution code:</p>
                                    <select
                                        className='dsa-lang-select'
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                    >
                                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <textarea
                                    className='dsa-code-textarea'
                                    placeholder={`# Write your ${language} solution here...\ndef solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i`}
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                        )}

                        {activeTab === 'solution' && showSolution && (
                            <div className='dsa-editor-pane'>
                                <div className='dsa-solution-section'>
                                    <div className='dsa-solution-approach'>
                                        <p className='dsa-result__section-title'>Optimal Approach</p>
                                        <p>{problem.approach}</p>
                                    </div>
                                    <pre className='dsa-solution-code'><code>{problem.solution}</code></pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className='dsa-actions'>
                        <button
                            className='dsa-evaluate-btn'
                            onClick={handleEvaluate}
                            disabled={evaluating || (!approach.trim() && !code.trim())}
                        >
                            {evaluating ? '⏳ Evaluating...' : '⚡ Evaluate My Solution'}
                        </button>
                        {!showSolution && (
                            <button
                                className='dsa-solution-btn'
                                onClick={() => { setShowSolution(true); setActiveTab('solution') }}
                            >
                                👁 View Model Solution
                            </button>
                        )}
                    </div>

                    {/* Result */}
                    {result && !result.error && <ResultPanel result={result} />}
                    {result?.error && (
                        <p className='dsa-error'>Could not evaluate. Please try again.</p>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main DSA Coding Component (used inside Interview.jsx) ────────────────────
const DSACoding = ({ problems }) => {
    if (!problems || problems.length === 0) {
        return (
            <div className='dsa-empty'>
                <p>No DSA problems in this report. Generate a new report to get coding problems.</p>
            </div>
        )
    }

    const easy   = problems.filter(p => p.difficulty === 'easy').length
    const medium = problems.filter(p => p.difficulty === 'medium').length
    const hard   = problems.filter(p => p.difficulty === 'hard').length

    return (
        <section className='dsa-section'>
            <div className='dsa-section__header'>
                <h2>DSA / Coding Problems <span className='q-count'>({problems.length})</span></h2>
                <div className='dsa-section__stats'>
                    {easy   > 0 && <span className='dsa-stat dsa-stat--easy'>{easy} Easy</span>}
                    {medium > 0 && <span className='dsa-stat dsa-stat--medium'>{medium} Medium</span>}
                    {hard   > 0 && <span className='dsa-stat dsa-stat--hard'>{hard} Hard</span>}
                </div>
            </div>
            <p className='dsa-section__intro'>
                Write your approach and/or code below. Use hints if you're stuck. AI will evaluate your time complexity, correctness, and code quality.
            </p>
            <div className='dsa-problems'>
                {problems.map((problem, i) => (
                    <DSAProblemCard key={i} problem={problem} index={i} />
                ))}
            </div>
        </section>
    )
}

export default DSACoding
