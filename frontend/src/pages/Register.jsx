import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiUser, FiMail, FiLock, FiCheck, FiUserPlus, FiPhone 
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    phone_number: '',
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
    const { name, value } = e.target
    if (name === 'phone_number') {
      const digits = value.replace(/\D/g, '').slice(0, 10)
      setForm(prev => ({ ...prev, phone_number: digits }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
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
        setErrors({ general: err.message || 'Registration failed. Please check your inputs.' })
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
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={styles.header}>
          <div style={styles.badgeWrap}>
            <FiUserPlus style={{ fontSize: '20px', color: '#00a49f' }} />
          </div>
          <h2 style={styles.title}>Create Your Account</h2>
          <p style={styles.subtitle}>Join thousands of buyers and sellers across India</p>
        </div>

        {errors.general && (
          <div style={styles.errorGeneral}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} method="POST">
          {/* Username */}
          <div className="form-group">
            <label htmlFor="reg-username">Username *</label>
            <div style={styles.inputWrap}>
              <FiUser style={styles.inputIcon} />
              <input
                id="reg-username"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
            {getError('username') && <p className="error-message">{getError('username')}</p>}
          </div>

          {/* Mobile Number (Optional) */}
          <div className="form-group">
            <label htmlFor="reg-phone">Mobile Number (Optional)</label>
            <div style={styles.phoneInputRow}>
              <div style={styles.countryCode}>
                <span>+91</span>
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiPhone style={styles.inputIcon} />
                <input
                  id="reg-phone"
                  className="form-control"
                  style={{ paddingLeft: '38px', borderRadius: '0 10px 10px 0' }}
                  type="tel"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
            </div>
            {getError('phone_number') && <p className="error-message">{getError('phone_number')}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <div style={styles.inputWrap}>
              <FiMail style={styles.inputIcon} />
              <input
                id="reg-email"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
            {getError('email') && <p className="error-message">{getError('email')}</p>}
          </div>

          {/* Name Row */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="reg-first-name">First Name</label>
              <input
                id="reg-first-name"
                className="form-control"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First name"
                autoComplete="given-name"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="reg-last-name">Last Name</label>
              <input
                id="reg-last-name"
                className="form-control"
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last name"
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Password (at least 8 characters) *</label>
            <div style={styles.inputWrap}>
              <FiLock style={styles.inputIcon} />
              <input
                id="reg-password"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create secure password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            {getError('password') && <p className="error-message">{getError('password')}</p>}
          </div>

          {/* Password Confirm */}
          <div className="form-group">
            <label htmlFor="reg-password-confirm">Confirm Password *</label>
            <div style={styles.inputWrap}>
              <FiLock style={styles.inputIcon} />
              <input
                id="reg-password-confirm"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            {getError('password_confirm') && <p className="error-message">{getError('password_confirm')}</p>}
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            style={styles.btn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating Account...' : 'Create Free Account'}
          </motion.button>
        </form>

        <div style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>
            Sign In here
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '80vh',
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
    maxWidth: '500px',
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
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  phoneInputRow: {
    display: 'flex',
    alignItems: 'center',
  },
  countryCode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRight: 'none',
    borderRadius: '10px 0 0 10px',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#334155',
    height: '42px',
  },
  errorGeneral: {
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
  btn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '800',
    marginTop: '12px',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '13.5px',
    color: '#64748b',
    marginTop: '24px',
  },
  loginLink: {
    color: '#00a49f',
    fontWeight: '700',
    textDecoration: 'none',
  },
}
