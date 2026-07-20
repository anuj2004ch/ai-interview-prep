import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const { handleRegister } = useAuth()

    const [username, setUsername] = useState("")
    const [email, setEmail]       = useState("")
    const [password, setPassword] = useState("")
    const [error, setError]       = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)
        const result = await handleRegister({ username, email, password })
        setSubmitting(false)
        if (result.success) {
            navigate("/")
        } else {
            setError(result.message)
        }
    }

    return (
        <main className="auth-main">
            <div className="form-container">
                <div className="form-header">
                    <h1>Create <span>Account</span></h1>
                    <p>Join us to build your winning interview strategy.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" id="username" name="username"
                            minLength={3} maxLength={30} autoComplete="username"
                            placeholder="Choose a username" required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email"
                            autoComplete="email"
                            placeholder="e.g. user@example.com" required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password"
                            minLength={8} maxLength={72} autoComplete="new-password"
                            placeholder="Create a secure password" required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button className="button primary-button" type="submit" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Register Account'}
                    </button>
                </form>

                <div className="form-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Register
