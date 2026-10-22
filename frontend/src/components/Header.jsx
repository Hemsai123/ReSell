import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, FiHeart, FiMessageSquare, FiPlus, FiUser, 
  FiMapPin, FiLogOut, FiMenu, FiX, FiPackage, FiCompass, FiChevronDown,
  FiZap, FiLogIn, FiUserPlus, FiLayers
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { conversationsAPI, wishlistAPI } from '../services/api'
import MessagesPanel from './MessagesPanel'

const POPULAR_LOCATIONS = [
  'All India',
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bangalore, Karnataka',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal'
]

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [unreadCount, setUnreadCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [showMessages, setShowMessages] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('All India')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userDropdownRef = useRef(null)
  const locationRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      fetchWishlistCount()
      const interval = setInterval(fetchUnreadCount, 15000)
      return () => clearInterval(interval)
    } else {
      setUnreadCount(0)
      setWishlistCount(0)
    }
  }, [user])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false)
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setShowUserDropdown(false)
  }, [location.pathname])

  const fetchUnreadCount = async () => {
    try {
      const res = await conversationsAPI.getAll()
      const conversations = res.data.results || res.data
      const total = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
      setUnreadCount(total)
    } catch (err) {
      // ignore
    }
  }

  const fetchWishlistCount = async () => {
    try {
      const res = await wishlistAPI.getAll()
      const items = res.data.results || res.data
      setWishlistCount(items.length || 0)
    } catch (err) {
      // ignore
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (selectedLocation && selectedLocation !== 'All India') params.set('location', selectedLocation)
    navigate(`/products?${params.toString()}`)
  }

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc)
    setShowLocationMenu(false)
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (loc !== 'All India') params.set('location', loc)
    navigate(`/products?${params.toString()}`)
  }

  const handleLogout = () => {
    logout()
    setShowUserDropdown(false)
    navigate('/')
  }

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header style={styles.header}>
        {/* Top utility notification bar */}
        <div style={styles.topBar}>
          <div className="container" style={styles.topBarInner}>
            <span style={styles.topBarText}>
              Verified Peer-to-Peer Marketplace &bull; Buy &amp; Sell Faster with 0% Brokerage
            </span>
            <div style={styles.topBarLinks}>
              <span style={styles.badgeLive}>
                <span style={styles.livePulseDot} /> LIVE LISTINGS
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div style={styles.mainNav}>
          <div className="container" style={styles.navContainer}>
            {/* Logo */}
            <Link to="/" style={styles.logo}>
              <motion.div
                style={styles.logoBadge}
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FiZap style={{ fontSize: '15px' }} />
              </motion.div>
              <div style={styles.logoTextGroup}>
                <span style={styles.logoBrand}>ReSell</span>
                <span style={styles.logoTagline}>MARKETPLACE</span>
              </div>
            </Link>

            {/* Location selector */}
            <div style={styles.locationContainer} ref={locationRef}>
              <button
                style={styles.locationBtn}
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                type="button"
              >
                <FiMapPin style={styles.locationIcon} />
                <span style={styles.locationText}>{selectedLocation}</span>
                <FiChevronDown style={{ fontSize: 13, color: '#94a3b8' }} />
              </button>

              <AnimatePresence>
                {showLocationMenu && (
                  <motion.div
                    style={styles.locationDropdown}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={styles.dropdownHeader}>Select City / Region</div>
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        style={{
                          ...styles.dropdownItem,
                          fontWeight: selectedLocation === loc ? '700' : '500',
                          color: selectedLocation === loc ? '#00a49f' : '#1e293b',
                          backgroundColor: selectedLocation === loc ? '#f0fdfa' : 'transparent',
                        }}
                        onClick={() => handleSelectLocation(loc)}
                      >
                        <FiMapPin style={{ fontSize: 13, opacity: 0.7 }} />
                        {loc}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Find Cars, Mobile Phones, Laptops, Furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <motion.button
                type="submit"
                style={styles.searchSubmitBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Search
              </motion.button>
            </form>

            {/* Navigation links & Actions */}
            <div style={styles.navActions}>
              <Link
                to="/products"
                style={{
                  ...styles.navLink,
                  color: isCurrent('/products') ? '#00a49f' : '#334155',
                }}
              >
                <FiCompass style={{ fontSize: 17 }} />
                <span>Explore</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/wishlist"
                    style={{
                      ...styles.navIconBtn,
                      color: isCurrent('/wishlist') ? '#ff5630' : '#334155',
                    }}
                    title="Wishlist"
                  >
                    <FiHeart style={{ fontSize: 19 }} />
                    {wishlistCount > 0 && (
                      <span style={styles.counterBadge}>{wishlistCount}</span>
                    )}
                  </Link>

                  <button
                    onClick={() => setShowMessages(true)}
                    style={styles.navIconBtn}
                    title="Messages"
                    type="button"
                  >
                    <FiMessageSquare style={{ fontSize: 19 }} />
                    {unreadCount > 0 && (
                      <span style={{ ...styles.counterBadge, backgroundColor: '#00a49f' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User Profile Dropdown */}
                  <div style={{ position: 'relative' }} ref={userDropdownRef}>
                    <motion.button
                      style={styles.userAvatarBtn}
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                    >
                      <div style={styles.avatarCircle}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span style={styles.usernameDisplay}>{user.username}</span>
                      <FiChevronDown style={{ fontSize: 13, color: '#64748b' }} />
                    </motion.button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          style={styles.userMenuDropdown}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div style={styles.userMenuHeader}>
                            <p style={styles.menuUserName}>
                              {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                            </p>
                            <p style={styles.menuUserEmail}>{user.email || `@${user.username}`}</p>
                          </div>
                          <div style={styles.menuDivider} />

                          <Link to="/my-listings" style={styles.menuItem}>
                            <FiPackage style={{ fontSize: 16, color: '#00a49f' }} />
                            <span>My Listings</span>
                          </Link>

                          <Link to="/wishlist" style={styles.menuItem}>
                            <FiHeart style={{ fontSize: 16, color: '#ff5630' }} />
                            <span>Saved Items ({wishlistCount})</span>
                          </Link>

                          <Link to="/messages" style={styles.menuItem}>
                            <FiMessageSquare style={{ fontSize: 16, color: '#3b82f6' }} />
                            <span>Inbox Chat</span>
                          </Link>

                          <div style={styles.menuDivider} />

                          <button onClick={handleLogout} style={styles.logoutBtn} type="button">
                            <FiLogOut style={{ fontSize: 16 }} />
                            <span>Log Out</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div style={styles.authGroup}>
                  <Link to="/login" style={styles.loginBtn}>
                    Login
                  </Link>
                  <Link to="/register" style={styles.registerBtn}>
                    Join
                  </Link>
                </div>
              )}

              {/* POST AN AD BUTTON */}
              <Link to="/sell" style={styles.sellBtnWrap}>
                <motion.div
                  style={styles.sellBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiPlus style={{ fontSize: 17, strokeWidth: 3 }} />
                  <span>SELL</span>
                </motion.div>
              </Link>

              {/* Mobile menu toggle */}
              <button
                style={styles.mobileToggle}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                type="button"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              style={styles.mobileDrawer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="container" style={styles.mobileInner}>
                <form onSubmit={handleSearchSubmit} style={styles.mobileSearchForm}>
                  <FiSearch style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                  />
                  <button type="submit" style={styles.searchSubmitBtn}>
                    Go
                  </button>
                </form>

                <div style={styles.mobileLinks}>
                  <Link to="/" style={styles.mobileLink}>
                    Home
                  </Link>
                  <Link to="/products" style={styles.mobileLink}>
                    Browse Ads
                  </Link>
                  {user ? (
                    <>
                      <Link to="/my-listings" style={styles.mobileLink}>
                        <FiPackage style={{ marginRight: '8px', color: '#00a49f' }} /> My Listings
                      </Link>
                      <Link to="/wishlist" style={styles.mobileLink}>
                        <FiHeart style={{ marginRight: '8px', color: '#ff5630' }} /> My Wishlist ({wishlistCount})
                      </Link>
                      <button
                        onClick={() => {
                          setShowMessages(true)
                          setMobileMenuOpen(false)
                        }}
                        style={{ ...styles.mobileLink, textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center' }}
                        type="button"
                      >
                        <FiMessageSquare style={{ marginRight: '8px', color: '#00a49f' }} /> Messages ({unreadCount})
                      </button>
                      <button
                        onClick={handleLogout}
                        style={{ ...styles.mobileLink, color: '#ef4444', display: 'flex', alignItems: 'center' }}
                        type="button"
                      >
                        <FiLogOut style={{ marginRight: '8px' }} /> Logout ({user.username})
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" style={{ ...styles.mobileLink, display: 'flex', alignItems: 'center' }}>
                        <FiLogIn style={{ marginRight: '8px' }} /> Login
                      </Link>
                      <Link to="/register" style={{ ...styles.mobileLink, display: 'flex', alignItems: 'center' }}>
                        <FiUserPlus style={{ marginRight: '8px' }} /> Create Free Account
                      </Link>
                    </>
                  )}
                  <Link to="/sell" style={styles.mobileSellBtn}>
                    + POST A FREE AD
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Messenger slide-over */}
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  )
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0, 47, 52, 0.08)',
  },
  topBar: {
    backgroundColor: '#002f34',
    color: '#94a3b8',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  topBarInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarText: {
    letterSpacing: '0.2px',
    color: '#e2e8f0',
    fontWeight: '500',
  },
  topBarLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badgeLive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(0, 164, 159, 0.2)',
    color: '#5eead4',
    padding: '3px 9px',
    borderRadius: '999px',
    fontSize: '10.5px',
    fontWeight: '700',
    letterSpacing: '0.4px',
  },
  livePulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  mainNav: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 0',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 10px rgba(0, 164, 159, 0.3)',
  },
  logoTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1,
  },
  logoBrand: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.5px',
  },
  logoTagline: {
    fontSize: '8.5px',
    fontWeight: '800',
    color: '#ff5630',
    letterSpacing: '1.5px',
    marginTop: '2px',
  },
  locationContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  locationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 13px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    transition: 'all 0.2s',
  },
  locationIcon: {
    fontSize: '15px',
    color: '#00a49f',
  },
  locationText: {
    maxWidth: '130px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  locationDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    width: '230px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 100,
  },
  dropdownHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '6px 10px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    width: '100%',
    padding: '9px 10px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  searchForm: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    border: '2px solid #002f34',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    height: '44px',
  },
  searchIcon: {
    marginLeft: '14px',
    fontSize: '17px',
    color: '#64748b',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    padding: '0 12px',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  searchSubmitBtn: {
    backgroundColor: '#002f34',
    color: '#fff',
    padding: '0 20px',
    height: '100%',
    fontWeight: '700',
    fontSize: '13.5px',
    letterSpacing: '0.2px',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginLeft: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '600',
    padding: '6px 8px',
    borderRadius: '8px',
  },
  navIconBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    transition: 'background 0.2s',
  },
  counterBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    backgroundColor: '#ff5630',
    color: '#fff',
    fontSize: '10.5px',
    fontWeight: '800',
    minWidth: '18px',
    height: '18px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #fff',
  },
  userAvatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 5px',
    borderRadius: '999px',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #e2e8f0',
  },
  avatarCircle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#00a49f',
    color: '#fff',
    fontWeight: '800',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameDisplay: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#1e293b',
    maxWidth: '90px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userMenuDropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    width: '230px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    boxShadow: '0 14px 35px rgba(0, 47, 52, 0.12)',
    border: '1px solid #e2e8f0',
    padding: '10px',
    zIndex: 100,
  },
  userMenuHeader: {
    padding: '8px 10px',
  },
  menuUserName: {
    fontWeight: '700',
    fontSize: '14px',
    color: '#0f172a',
  },
  menuUserEmail: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '6px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '8px',
    fontSize: '13.5px',
    color: '#334155',
    fontWeight: '600',
    transition: 'background 0.15s',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '8px',
    fontSize: '13.5px',
    color: '#ef4444',
    fontWeight: '600',
    width: '100%',
    textAlign: 'left',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loginBtn: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#002f34',
    padding: '8px 14px',
    borderRadius: '8px',
  },
  registerBtn: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#00a49f',
    border: '1.5px solid #00a49f',
    padding: '7px 14px',
    borderRadius: '8px',
  },
  sellBtnWrap: {
    textDecoration: 'none',
  },
  sellBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'linear-gradient(135deg, #ff5630 0%, #ff7a45 100%)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '14px',
    padding: '9px 18px',
    borderRadius: '999px',
    boxShadow: '0 4px 15px rgba(255, 86, 48, 0.35)',
    letterSpacing: '0.4px',
    border: '2px solid rgba(255, 255, 255, 0.4)',
  },
  mobileToggle: {
    display: 'none',
    fontSize: '22px',
    color: '#002f34',
    padding: '6px',
  },
  mobileDrawer: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  mobileInner: {
    padding: '16px 24px',
  },
  mobileSearchForm: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    marginBottom: '16px',
    height: '42px',
  },
  mobileLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mobileLink: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    padding: '6px 0',
  },
  mobileSellBtn: {
    marginTop: '8px',
    background: 'linear-gradient(135deg, #ff5630 0%, #ff7a45 100%)',
    color: '#fff',
    textAlign: 'center',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },
}
