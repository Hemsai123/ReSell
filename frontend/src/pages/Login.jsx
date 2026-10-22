import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiEyeOff, FiLock, FiUser, FiZap, FiPhone } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Invalid username/mobile or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badgeWrap}>
            <FiZap style={{ fontSize: '20px', color: '#00a49f' }} />
          </div>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in with your username or registered mobile number</p>
        </div>

        {error && (
          <motion.div
            style={styles.error}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} method="POST">
          {/* Username or Mobile */}
          <div className="form-group">
            <label htmlFor="username">Username or Mobile Number</label>
            <div style={styles.inputWrap}>
              <FiUser style={styles.inputIcon} />
              <input
                id="username"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username or 10-digit mobile"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={styles.inputWrap}>
              <FiLock style={styles.inputIcon} />
              <input
                id="password"
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your account password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={styles.btn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </motion.button>
        </form>

        <div style={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={styles.signupLink}>
            Create one free
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 40px rgba(0, 47, 52, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '26px',
  },
  badgeWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    margin: '0 auto 14px',
    boxShadow: '0 8px 20px rgba(0, 164, 159, 0.3)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#64748b',
    marginTop: '4px',
    lineHeight: 1.5,
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '18px',
    border: '1px solid #fecaca',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    fontSize: '16px',
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '800',
    marginTop: '10px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '13.5px',
    color: '#64748b',
    marginTop: '24px',
  },
  signupLink: {
    color: '#00a49f',
    fontWeight: '700',
    textDecoration: 'none',
  },
}
