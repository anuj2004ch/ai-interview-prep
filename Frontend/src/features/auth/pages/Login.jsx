import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail]       = useState("")
    const [password, setPassword] = useState("")
    const [error, setError]       = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        const result = await handleLogin({ email, password })
        setSubmitting(false)
        if (result.success) {
            navigate('/')
        } else {
            setError(result.message)
        }
    }

    return (
        <main className="auth-main">
            <div className="form-container">
                <div className="form-header">
                    <h1>Welcome <span>Back</span></h1>
                    <p>Log in to access your customized interview plans.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email"
                            autoComplete="email"
                            placeholder="e.g. user@example.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="button primary-button" type="submit" disabled={submitting}>
                        {submitting ? 'Logging in...' : 'Login to Account'}
                    </button>
                </form>

                <div className="form-footer">
                    <p>Don't have an account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login
