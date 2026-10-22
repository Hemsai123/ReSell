import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiArrowRight, FiTrash2 } from 'react-icons/fi'
import { wishlistAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = () => {
    setLoading(true)
    wishlistAPI.getAll()
      .then((res) => setItems(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  const handleRemove = async (id) => {
    try {
      await wishlistAPI.remove(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="container" style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Saved Items</h1>
          <p style={styles.subtitle}>
            {items.length} {items.length === 1 ? 'item' : 'items'} saved in your wishlist
          </p>
        </div>
        {items.length > 0 && (
          <Link to="/products" style={styles.continueLink}>
            Continue Browsing <FiArrowRight />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading your wishlist...</p>
        </div>
      ) : items.length === 0 ? (
        <motion.div
          style={styles.emptyState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={styles.emptyHeartIcon}>
            <FiHeart style={{ fontSize: '48px', color: '#ff5630', strokeWidth: 1.5 }} />
          </div>
          <h3 style={styles.emptyTitle}>Your wishlist is empty</h3>
          <p style={styles.emptySubtitle}>
            Browse our catalog, find items you love, and tap the heart icon to save them for later!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Start Browsing Deals
          </Link>
        </motion.div>
      ) : (
        <div style={styles.grid}>
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                style={styles.cardWrapper}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={item.product} index={index} />
                <motion.button
                  onClick={() => handleRemove(item.id)}
                  style={styles.removeBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Remove from saved items"
                  type="button"
                >
                  <FiTrash2 /> Remove
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    paddingTop: '32px',
    paddingBottom: '80px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px',
    borderBottom: '1.5px solid #e2e8f0',
    paddingBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '3px',
  },
  continueLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#00a49f',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  removeBtn: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1.5px solid #e2e8f0',
    color: '#64748b',
    borderRadius: '10px',
    fontSize: '12.5px',
    fontWeight: '700',
    transition: 'all 0.15s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
    maxWidth: '560px',
    margin: '0 auto',
  },
  emptyHeartIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#002f34',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '14.5px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
}
