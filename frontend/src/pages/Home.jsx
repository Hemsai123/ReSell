import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const titleText = 'Find Great Deals Near You'
  const subtitleText = 'Buy and sell everything from cars, electronics, mobile phones and much more'

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ page_size: 8 }),
      categoriesAPI.getAll(),
    ]).then(([pRes, cRes]) => {
      setProducts(pRes.data.results || pRes.data)
      setCategories(cRes.data.results || cRes.data)
    }).catch((err) => {
      setError(err.response?.data?.detail || err.message || 'Failed to load data')
    }).finally(() => setLoading(false))
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div>
      {error && <div className="error-message" style={{ textAlign: 'center', padding: '20px', margin: '20px auto', maxWidth: '600px' }}>Error: {error}</div>}
      <motion.section
        style={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {titleText}
          </motion.h1>
          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {subtitleText}
          </motion.p>
          <motion.div
            style={styles.searchBox}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <input
              type="text"
              placeholder="Search for cars, phones, laptops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={styles.searchInput}
            />
            <motion.button
              onClick={handleSearch}
              style={styles.searchBtn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
          </motion.div>
          <motion.div
            style={styles.heroActions}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/products" style={styles.heroBtnPrimary}>Browse All Ads</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/sell" style={styles.heroBtnSecondary}>+ Post Free Ad</Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="container"
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <motion.h2 style={styles.sectionTitle} variants={itemVariants}>Browse Categories</motion.h2>
        <div style={styles.categories}>
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            >
              <Link to={`/categories/${cat.slug}`} style={styles.categoryCard}>
                <div style={styles.catIcon}>
                  <span style={styles.catPlaceholder}>{getCategoryEmoji(cat.category_name)}</span>
                </div>
                <span style={styles.catName}>{cat.category_name}</span>
                <span style={styles.catCount}>{cat.total_products} ads</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="container"
        style={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <motion.div style={styles.sectionHeader} variants={itemVariants}>
          <h2 style={styles.sectionTitle}>Fresh Recommendations</h2>
          <Link to="/products" style={styles.viewAll}>View All →</Link>
        </motion.div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-state-icon">&#128269;</div>
            <p className="empty-state-text">No ads yet. Be the first to post!</p>
            <Link to="/sell" className="btn btn-primary">Post an Ad</Link>
          </motion.div>
        ) : (
          <div style={styles.grid}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}

function getCategoryEmoji(name) {
  const emojis = {
    'Electronics': '💻',
    'Mobile Phones': '📱',
    'Cars': '🚗',
    'Furniture': '🪑',
    'Fashion': '👕',
    'Real Estate': '🏠',
    'Sports': '⚽',
    'Books': '📚',
    'Bicycles': '🚲',
  }
  return emojis[name] || '📦'
}

const styles = {
  hero: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: '100px 0',
    textAlign: 'center',
    minHeight: '400px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    marginBottom: '16px',
    letterSpacing: '-1px',
    background: 'linear-gradient(135deg, #fff 0%, #a8edea 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    opacity: 0.9,
    marginBottom: '32px',
    maxWidth: '600px',
    margin: '0 auto 32px',
    color: '#e0e0e0',
  },
  searchBox: {
    display: 'flex',
    maxWidth: '550px',
    margin: '0 auto 24px',
    gap: '0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  searchInput: {
    flex: 1,
    padding: '16px 20px',
    borderRadius: '0',
    border: 'none',
    fontSize: '15px',
  },
  searchBtn: {
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '16px 28px',
    borderRadius: '0',
    fontWeight: 700,
    fontSize: '15px',
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  heroBtnPrimary: {
    display: 'inline-block',
    backgroundColor: '#e94560',
    color: '#fff',
    padding: '14px 36px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '15px',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
  },
  heroBtnSecondary: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: '#fff',
    padding: '14px 36px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '15px',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  section: {
    paddingTop: '48px',
    paddingBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a2e',
  },
  viewAll: {
    color: '#e94560',
    fontWeight: 600,
    fontSize: '14px',
  },
  categories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  catIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  catPlaceholder: {
    fontSize: '28px',
  },
  catName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#1a1a2e',
  },
  catCount: {
    fontSize: '12px',
    color: '#636e72',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
}
