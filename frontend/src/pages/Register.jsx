import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data)
      } else {
        setErrors({ general: err.message || 'An error occurred. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const getError = (field) => {
    if (errors[field]) return Array.isArray(errors[field]) ? errors[field][0] : errors[field]
    return null
  }

  return (
    <div style={styles.wrapper}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join OLX today</p>
        </motion.div>
        {errors.general && (
          <motion.p
            style={styles.errorGeneral}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {errors.general}
          </motion.p>
        )}
        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label>Username</label>
            <input
              className="form-control"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {getError('username') && <p className="error-message">{getError('username')}</p>}
          </motion.div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {getError('email') && <p className="error-message">{getError('email')}</p>}
          </motion.div>
          <div style={styles.row}>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label>First Name</label>
              <input
                className="form-control"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label>Last Name</label>
              <input
                className="form-control"
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </motion.div>
          </div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {getError('password') && <p className="error-message">{getError('password')}</p>}
          </motion.div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <label>Confirm Password</label>
            <input
              className="form-control"
              type="password"
              name="password_confirm"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
            {getError('password_confirm') && <p className="error-message">{getError('password_confirm')}</p>}
          </motion.div>
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={styles.btn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </motion.button>
        </form>
        <motion.p
          style={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '40px 20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    marginTop: '8px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#e94560',
    fontWeight: 700,
  },
  errorGeneral: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '12px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
  },
}
