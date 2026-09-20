import { useState } from 'react'
import axios from 'axios'
import './App.css'

import BuyerDashboard from './components/BuyerDashboard'
import SupplierDashboard from './components/SupplierDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('merzadoUser')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      localStorage.removeItem('merzadoUser')
      return null
    }
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  })

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'

      const payload = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
          }

      const response = await axios.post(`${API_URL}${endpoint}`, payload)

      const { token, user: loggedInUser } = response.data

      if (!token || !loggedInUser) {
        throw new Error('The server response is missing login information.')
      }

      localStorage.setItem('merzadoToken', token)
      localStorage.setItem('merzadoUser', JSON.stringify(loggedInUser))

      setUser(loggedInUser)
      setForm({
        name: '',
        email: '',
        password: '',
        role: 'buyer',
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('merzadoToken')
    localStorage.removeItem('merzadoUser')

    setUser(null)
    setIsLogin(true)
    setError('')
    setSuccess('')
  }

  const switchAuthMode = () => {
    setIsLogin((previousMode) => !previousMode)
    setError('')
    setSuccess('')
  }

  if (user) {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">M</span>
            <span>MERZADO</span>
          </div>

          <div className="topbar-actions">
            <span className="user-role">
              {user.role === 'buyer' ? 'Buyer account' : 'Supplier account'}
            </span>

            <button
              type="button"
              className="secondary-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="dashboard-container">
          <section className="welcome-banner">
            <div className="welcome-content">
              <p className="eyebrow">YOUR MARKETPLACE</p>

              <h1>Welcome, {user.name}!</h1>

              <p>
                You're signed in as a {user.role}. Your marketplace
                workspace is ready.
              </p>
            </div>

            <span className="welcome-icon" aria-hidden="true">
              ✦
            </span>
          </section>

          {user.role === 'buyer' ? (
            <BuyerDashboard />
          ) : (
            <SupplierDashboard />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <div className="brand auth-brand">
            <span className="brand-mark">M</span>
            <span>MERZADO</span>
          </div>

          <div className="auth-intro-content">
            <p className="eyebrow">THE B2B SOURCING MARKETPLACE</p>

            <h1>
              Source smarter.
              <br />
              Grow together.
            </h1>

            <p>
              Connect buyers and suppliers, publish sourcing requests,
              and manage quotations in one simple workspace.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Create and manage sourcing requests</span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Discover opportunities and submit quotations</span>
            </div>

            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Keep your marketplace activity organized</span>
            </div>
          </div>

          <p className="auth-footer">
            A simple workspace for better business connections.
          </p>
        </section>

        <main className="auth-panel">
          <div className="auth-card">
            <p className="eyebrow">
              {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
            </p>

            <h2>{isLogin ? 'Sign in to Merzado' : 'Create your account'}</h2>

            <p className="auth-subtitle">
              {isLogin
                ? 'Enter your details to access your marketplace workspace.'
                : 'Join the marketplace as a buyer or supplier.'}
            </p>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" role="status">
                {success}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </label>

              {!isLogin && (
                <label>
                  I want to join as
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="buyer">Buyer</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </label>
              )}

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : isLogin
                    ? 'Sign in'
                    : 'Create account'}
              </button>
            </form>

            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={switchAuthMode}>
                {isLogin ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App