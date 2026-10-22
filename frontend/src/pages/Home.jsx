import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, FiMapPin, FiTrendingUp, FiShield, 
  FiZap, FiMessageSquare, FiArrowRight, FiCheckCircle, FiPlus,
  FiCpu, FiSmartphone, FiTruck, FiHome, FiShoppingBag, 
  FiActivity, FiBookOpen, FiCompass, FiGrid, FiAward, FiDollarSign,
  FiLayers, FiCheck
} from 'react-icons/fi'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

// Clean, executive category metadata with professional Feather SVG icons
const CATEGORY_META = {
  'electronics': { 
    icon: FiCpu, 
    badge: 'Hardware & Tech', 
    color: '#e0f2fe', 
    border: '#bae6fd', 
    text: '#0284c7' 
  },
  'mobile-phones': { 
    icon: FiSmartphone, 
    badge: 'Mobiles & Tablets', 
    color: '#dcfce7', 
    border: '#bbf7d0', 
    text: '#16a34a' 
  },
  'cars-vehicles': { 
    icon: FiTruck, 
    badge: 'Automotive & Bikes', 
    color: '#fef3c7', 
    border: '#fde68a', 
    text: '#d97706' 
  },
  'furniture-decor': { 
    icon: FiHome, 
    badge: 'Home & Living', 
    color: '#fce7f3', 
    border: '#fbcfe8', 
    text: '#db2777' 
  },
  'fashion-beauty': { 
    icon: FiShoppingBag, 
    badge: 'Fashion & Apparel', 
    color: '#ede9fe', 
    border: '#ddd6fe', 
    text: '#7c3aed' 
  },
  'sports-hobbies': { 
    icon: FiActivity, 
    badge: 'Fitness & Hobbies', 
    color: '#ffedd5', 
    border: '#fed7aa', 
    text: '#ea580c' 
  },
  'books-learning': { 
    icon: FiBookOpen, 
    badge: 'Books & Learning', 
    color: '#ccfbf1', 
    border: '#99f6e4', 
    text: '#0d9488' 
  },
  'bicycles': { 
    icon: FiCompass, 
    badge: 'Bicycles & Sports', 
    color: '#e2e8f0', 
    border: '#cbd5e1', 
    text: '#475569' 
  },
}

const DEFAULT_META = {
  icon: FiGrid,
  badge: 'General',
  color: '#f1f5f9',
  border: '#e2e8f0',
  text: '#334155',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all')

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ page_size: 16 }),
      categoriesAPI.getAll(),
    ])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.results || pRes.data)
        setCategories(cRes.data.results || cRes.data)
      })
      .catch((err) => {
        console.error('Failed to load home data:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (searchLocation.trim()) params.set('location', searchLocation.trim())
    navigate(`/products?${params.toString()}`)
  }

  const handleTrendingClick = (term) => {
    navigate(`/products?search=${encodeURIComponent(term)}`)
  }

  const filteredProducts = selectedCategoryTab === 'all'
    ? products
    : products.filter(p => p.category?.slug === selectedCategoryTab)

  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <section style={styles.hero}>
        {/* Ambient background glows */}
        <motion.div
          style={{
            ...styles.glowOrb,
            top: '-120px',
            left: '12%',
            background: 'radial-gradient(circle, rgba(0, 164, 159, 0.28) 0%, rgba(0, 47, 52, 0) 70%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          style={{
            ...styles.glowOrb,
            bottom: '-120px',
            right: '10%',
            background: 'radial-gradient(circle, rgba(255, 86, 48, 0.22) 0%, rgba(0, 47, 52, 0) 70%)',
          }}
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container" style={styles.heroContainer}>
          {/* Top pill badge */}
          <motion.div
            style={styles.heroBadge}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <FiShield style={styles.heroBadgeIcon} />
            <span>VERIFIED PEER-TO-PEER CLASSIFIEDS IN INDIA</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Buy &amp; Sell Quality Pre-Owned Goods <br />
            <span style={styles.gradientTitleText}>Directly, Safely &amp; Commission-Free</span>
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Discover verified deals on electronics, vehicles, furniture, and more from authentic individuals across India with direct in-app negotiation.
          </motion.p>

          {/* Hero Search Box */}
          <motion.form
            onSubmit={handleHeroSearch}
            style={styles.heroSearchBox}
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Location input */}
            <div style={styles.heroInputGroup}>
              <FiMapPin style={styles.heroInputIcon} />
              <input
                type="text"
                placeholder="City or location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                style={styles.heroInput}
              />
            </div>

            <div style={styles.searchDivider} />

            {/* Keyword input */}
            <div style={{ ...styles.heroInputGroup, flex: 2 }}>
              <FiSearch style={styles.heroInputIcon} />
              <input
                type="text"
                placeholder="Find iPhone 14, Nikon DSLR, Dell PC, Volvo, Bicycles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.heroInput}
              />
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              style={styles.heroSearchBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSearch style={{ strokeWidth: 2.5 }} />
              <span>Explore Deals</span>
            </motion.button>
          </motion.form>

          {/* Trending keywords */}
          <motion.div
            style={styles.trendingRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
          >
            <span style={styles.trendingLabel}>
              <FiTrendingUp style={{ color: '#5eead4' }} /> Popular Searches:
            </span>
            {['iPhone 14', 'Nikon DSLR', 'Sony XM5', 'Royal Enfield', 'Volvo SUV', 'Air Jordan', 'IKEA Chair'].map((term) => (
              <motion.button
                key={term}
                onClick={() => handleTrendingClick(term)}
                style={styles.trendingTag}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
                whileTap={{ scale: 0.96 }}
                type="button"
              >
                {term}
              </motion.button>
            ))}
          </motion.div>

          {/* Trust Feature Badges */}
          <motion.div
            style={styles.heroFeatures}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.46 }}
          >
            <div style={styles.featurePill}>
              <FiCheckCircle style={{ color: '#5eead4', strokeWidth: 2.2 }} />
              <span>100% Free Ad Posting</span>
            </div>
            <div style={styles.featurePill}>
              <FiShield style={{ color: '#5eead4', strokeWidth: 2.2 }} />
              <span>Verified Community</span>
            </div>
            <div style={styles.featurePill}>
              <FiMessageSquare style={{ color: '#5eead4', strokeWidth: 2.2 }} />
              <span>Real-Time In-App Chat</span>
            </div>
            <div style={styles.featurePill}>
              <FiDollarSign style={{ color: '#5eead4', strokeWidth: 2.2 }} />
              <span>Zero Brokerage Fees</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={styles.categorySection}>
        <div className="container">
          <div style={styles.sectionHeadingRow}>
            <div>
              <div style={styles.subHeadingTag}>
                <FiLayers style={{ marginRight: '6px' }} /> EXPLORE BY CATEGORY
              </div>
              <h2 style={styles.sectionHeading}>Browse Market Categories</h2>
              <p style={styles.sectionSubheading}>Explore thousands of verified listings organized for fast discovery</p>
            </div>
            <Link to="/products" style={styles.viewAllLink}>
              View All Listings <FiArrowRight />
            </Link>
          </div>

          <motion.div 
            style={styles.categoriesGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat.slug] || DEFAULT_META
              const IconComp = meta.icon

              return (
                <motion.div
                  key={cat.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <Link to={`/categories/${cat.slug}`} style={styles.categoryCard}>
                    <div style={{ ...styles.categoryIconWrap, backgroundColor: meta.color, border: `1px solid ${meta.border}`, color: meta.text }}>
                      <IconComp style={{ fontSize: '22px' }} />
                    </div>
                    <span style={styles.categoryName}>{cat.category_name}</span>
                    <span style={styles.categoryCount}>
                      {cat.total_products || 0} {cat.total_products === 1 ? 'listing' : 'listings'}
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* FRESH RECOMMENDATIONS SECTION */}
      <section style={styles.freshSection}>
        <div className="container">
          <div style={styles.sectionHeadingRow}>
            <div>
              <div style={styles.recommendationBadge}>
                <FiZap style={{ marginRight: '6px' }} /> VERIFIED RECOMMENDATIONS
              </div>
              <h2 style={styles.sectionHeading}>Fresh Local Listings</h2>
            </div>
            <Link to="/products" style={styles.viewAllLink}>
              Browse Full Catalog <FiArrowRight />
            </Link>
          </div>

          {/* Category Filter Tabs */}
          <div style={styles.filterTabsRow}>
            <button
              style={{
                ...styles.filterTab,
                ...(selectedCategoryTab === 'all' ? styles.filterTabActive : {}),
              }}
              onClick={() => setSelectedCategoryTab('all')}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                style={{
                  ...styles.filterTab,
                  ...(selectedCategoryTab === cat.slug ? styles.filterTabActive : {}),
                }}
                onClick={() => setSelectedCategoryTab(cat.slug)}
              >
                {cat.category_name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                Loading verified listings...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <FiSearch style={{ fontSize: '42px', color: '#94a3b8', marginBottom: '14px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#002f34', marginBottom: '6px' }}>
                No active listings found in this category
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '18px' }}>
                Be the first to list an item in this category and get noticed immediately!
              </p>
              <Link to="/sell" className="btn btn-primary">
                <FiPlus style={{ marginRight: '6px' }} /> Post an Ad Now
              </Link>
            </div>
          ) : (
            <div style={styles.productGrid}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* SELLING CTA BANNER */}
      <section style={styles.ctaSection}>
        <div className="container">
          <motion.div
            style={styles.ctaCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={styles.ctaLeft}>
              <div style={styles.ctaSubbadge}>
                <FiAward style={{ marginRight: '6px' }} /> ZERO BROKERAGE &bull; 100% FREE
              </div>
              <h2 style={styles.ctaTitle}>Got Items to Sell? Turn Them into Cash</h2>
              <p style={styles.ctaDesc}>
                Post your pre-owned electronics, vehicles, furniture, or collectibles in under 60 seconds. Connect directly with serious buyers without paying middlemen commissions.
              </p>
              <div style={styles.ctaPoints}>
                <div style={styles.ctaPointItem}>
                  <FiCheck style={styles.ctaCheckIcon} />
                  <span>List in under 60 seconds</span>
                </div>
                <div style={styles.ctaPointItem}>
                  <FiCheck style={styles.ctaCheckIcon} />
                  <span>Direct phone calls &amp; secure in-app chat</span>
                </div>
                <div style={styles.ctaPointItem}>
                  <FiCheck style={styles.ctaCheckIcon} />
                  <span>Verified local buyers in your city</span>
                </div>
              </div>
            </div>

            <div style={styles.ctaRight}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link to="/sell" style={styles.ctaButton}>
                  <FiPlus style={{ fontSize: '18px', strokeWidth: 3 }} />
                  <span>Start Selling For Free</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST & WHY US SECTION */}
      <section style={styles.whySection}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <div style={{ ...styles.recommendationBadge, justifyContent: 'center' }}>
              <FiShield style={{ marginRight: '6px' }} /> TRUST &amp; TRANSPARENCY
            </div>
            <h2 style={styles.sectionHeading}>Why Thousands Trade on ReSell</h2>
            <p style={styles.sectionSubheading}>Engineered for a safer, faster, and friction-free marketplace experience</p>
          </div>

          <div style={styles.whyGrid}>
            <motion.div 
              style={styles.whyCard}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div style={{ ...styles.whyIconWrap, backgroundColor: '#f0fdfa', color: '#0d9488' }}>
                <FiShield style={{ fontSize: '24px' }} />
              </div>
              <h3 style={styles.whyTitle}>Verified Community</h3>
              <p style={styles.whyDesc}>
                We prioritize user safety with phone-verified accounts, authentic seller reviews, and proactive listing validation.
              </p>
            </motion.div>

            <motion.div 
              style={styles.whyCard}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div style={{ ...styles.whyIconWrap, backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <FiMessageSquare style={{ fontSize: '24px' }} />
              </div>
              <h3 style={styles.whyTitle}>Direct In-App Messaging</h3>
              <p style={styles.whyDesc}>
                Negotiate prices, exchange pictures, and discuss pickup details securely without having to disclose your personal phone number.
              </p>
            </motion.div>

            <motion.div 
              style={styles.whyCard}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div style={{ ...styles.whyIconWrap, backgroundColor: '#fef2f2', color: '#dc2626' }}>
                <FiDollarSign style={{ fontSize: '24px' }} />
              </div>
              <h3 style={styles.whyTitle}>Zero Brokerage Fees</h3>
              <p style={styles.whyDesc}>
                Keep 100% of your earnings. No hidden transaction cuts, success fees, or listing charges for general sellers.
              </p>
            </motion.div>

            <motion.div 
              style={styles.whyCard}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div style={{ ...styles.whyIconWrap, backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <FiMapPin style={{ fontSize: '24px' }} />
              </div>
              <h3 style={styles.whyTitle}>Hyper-Local Discovery</h3>
              <p style={styles.whyDesc}>
                Filter deals right in your neighbourhood or city so you can inspect products in person before closing the handshake deal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  hero: {
    position: 'relative',
    backgroundColor: '#002f34',
    padding: '80px 0 95px',
    color: '#fff',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  heroContainer: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: '960px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(0, 164, 159, 0.16)',
    border: '1px solid rgba(0, 164, 159, 0.35)',
    color: '#5eead4',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: '700',
    letterSpacing: '0.8px',
    marginBottom: '22px',
  },
  heroBadgeIcon: {
    fontSize: '13px',
  },
  heroTitle: {
    fontSize: '44px',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-1px',
    marginBottom: '16px',
    color: '#ffffff',
  },
  gradientTitleText: {
    background: 'linear-gradient(135deg, #00a49f 0%, #5eead4 50%, #ff8c42 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '16.5px',
    color: '#cbd5e1',
    lineHeight: '1.65',
    maxWidth: '720px',
    margin: '0 auto 36px',
    fontWeight: '400',
  },
  heroSearchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '6px 8px',
    boxShadow: '0 20px 45px rgba(0, 20, 25, 0.4)',
    maxWidth: '840px',
    margin: '0 auto 24px',
    gap: '4px',
  },
  heroInputGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '0 12px',
  },
  heroInputIcon: {
    fontSize: '18px',
    color: '#00a49f',
    marginRight: '10px',
    flexShrink: 0,
  },
  heroInput: {
    width: '100%',
    border: 'none',
    padding: '12px 0',
    fontSize: '14.5px',
    color: '#0f172a',
    backgroundColor: 'transparent',
    outline: 'none',
  },
  searchDivider: {
    width: '1.5px',
    height: '32px',
    backgroundColor: '#e2e8f0',
  },
  heroSearchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #ff5630 0%, #ff7a45 100%)',
    color: '#fff',
    padding: '13px 26px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14.5px',
    boxShadow: '0 4px 14px rgba(255, 86, 48, 0.35)',
    letterSpacing: '0.2px',
    border: 'none',
    cursor: 'pointer',
  },
  trendingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '32px',
  },
  trendingLabel: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  trendingTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#f1f5f9',
    padding: '5px 13px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  heroFeatures: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '26px',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#e2e8f0',
    fontWeight: '600',
  },
  categorySection: {
    padding: '64px 0 40px',
  },
  sectionHeadingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '28px',
  },
  subHeadingTag: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: '#00a49f',
    letterSpacing: '0.9px',
    marginBottom: '5px',
  },
  recommendationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: '#ff5630',
    letterSpacing: '0.9px',
    marginBottom: '5px',
  },
  sectionHeading: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.4px',
  },
  sectionSubheading: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  viewAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#00a49f',
    textDecoration: 'none',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '16px',
  },
  categoryCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '22px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    textDecoration: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  categoryIconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
  categoryName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: '1.3',
    marginBottom: '4px',
  },
  categoryCount: {
    fontSize: '11.5px',
    color: '#94a3b8',
    fontWeight: '600',
  },
  freshSection: {
    padding: '40px 0 60px',
  },
  filterTabsRow: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '16px',
    marginBottom: '24px',
    scrollbarWidth: 'none',
  },
  filterTab: {
    padding: '8px 18px',
    borderRadius: '999px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterTabActive: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    borderColor: '#002f34',
    fontWeight: '700',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  ctaSection: {
    padding: '20px 0 60px',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, #002f34 0%, #004d55 100%)',
    borderRadius: '24px',
    padding: '44px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
    boxShadow: '0 16px 36px rgba(0, 47, 52, 0.16)',
    flexWrap: 'wrap',
    gap: '28px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  ctaLeft: {
    maxWidth: '580px',
  },
  ctaSubbadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '800',
    color: '#ff8c42',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  ctaTitle: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    marginBottom: '10px',
    lineHeight: '1.25',
  },
  ctaDesc: {
    fontSize: '15px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  ctaPoints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  ctaPointItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13.5px',
    color: '#5eead4',
    fontWeight: '600',
  },
  ctaCheckIcon: {
    fontSize: '16px',
    color: '#5eead4',
    strokeWidth: 2.8,
  },
  ctaRight: {
    flexShrink: 0,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #ff5630 0%, #ff7a45 100%)',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '15.5px',
    boxShadow: '0 8px 24px rgba(255, 86, 48, 0.35)',
    letterSpacing: '0.2px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textDecoration: 'none',
  },
  whySection: {
    padding: '40px 0 84px',
  },
  whyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  },
  whyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '30px 24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
  },
  whyIconWrap: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  whyTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#002f34',
    marginBottom: '8px',
  },
  whyDesc: {
    fontSize: '13.5px',
    color: '#64748b',
    lineHeight: '1.6',
  },
}
