import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { conversationsAPI } from '../services/api'
import MessagesPanel from './MessagesPanel'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showMessages, setShowMessages] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 10000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await conversationsAPI.getAll()
      const conversations = res.data.results || res.data
      const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setUnreadCount(total)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navItems = user
    ? [
        { path: '/sell', label: '+ SELL' },
        { path: '/wishlist', label: 'Wishlist' },
        { path: '/my-listings', label: 'My Listings' },
      ]
    : [
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' },
      ]

  return (
    <>
      <motion.header
        style={styles.header}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container" style={styles.inner}>
          <Link to="/" style={styles.logo}>
            <motion.span
              style={styles.logoIcon}
              whileHover={{ scale: 1.2, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              &#9632;
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              ReSell
            </motion.span>
          </Link>
          <nav style={styles.nav}>
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/products" active={isActive('/products') || isActive('/categories')}>Browse</NavLink>
            {user && navItems.map((item) => (
              <NavLink key={item.path} to={item.path} active={isActive(item.path)}>
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <motion.button
                  onClick={() => setShowMessages(true)}
                  style={styles.messagesBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Messages
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        style={styles.badge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <span style={styles.username}>Hi, {user.first_name || user.username}</span>
                <motion.button
                  onClick={handleLogout}
                  style={styles.logoutBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              navItems.map((item) => (
                <NavLink key={item.path} to={item.path} active={isActive(item.path)}>
                  {item.label}
                </NavLink>
              ))
            )}
          </nav>
        </div>
      </motion.header>
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  )
}

function NavLink({ to, active, children }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link
        to={to}
        style={{
          ...styles.navLink,
          ...(active ? styles.active : {}),
        }}
      >
        {children}
        {active && (
          <motion.div
            layoutId="activeNav"
            style={styles.activeIndicator}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    </motion.div>
  )
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '68px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '-0.5px',
  },
  logoIcon: {
    color: '#e94560',
    fontSize: '22px',
    display: 'inline-block',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navLink: {
    color: '#6c757d',
    fontWeight: 500,
    fontSize: '14px',
    padding: '8px 14px',
    borderRadius: '8px',
    position: 'relative',
  },
  active: {
    color: '#e94560',
    fontWeight: 600,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '2px',
    left: '14px',
    right: '14px',
    height: '2px',
    backgroundColor: '#e94560',
    borderRadius: '1px',
  },
  messagesBtn: {
    color: '#6c757d',
    fontWeight: 600,
    fontSize: '14px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
  },
  badge: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '2px 7px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    minWidth: '20px',
    textAlign: 'center',
  },
  username: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginLeft: '8px',
  },
  logoutBtn: {
    background: 'none',
    color: '#e94560',
    fontSize: '14px',
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: '8px',
  },
}
