import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wishlistAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wishlistAPI.getAll()
      .then((res) => setItems(res.data.results || res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = (id) => {
    wishlistAPI.remove(id)
      .then(() => setItems(items.filter((item) => item.id !== id)))
  }

  return (
    <div className="container" style={styles.page}>
      <motion.h2
        style={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Wishlist
      </motion.h2>
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : items.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-state-icon">&#128150;</div>
          <p className="empty-state-text">Your wishlist is empty.</p>
        </motion.div>
      ) : (
        <div style={styles.grid}>
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                style={styles.cardWrapper}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <ProductCard product={item.product} index={index} />
                <motion.button
                  onClick={() => handleRemove(item.id)}
                  style={styles.removeBtn}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Remove
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
  page: { paddingTop: '28px', paddingBottom: '48px' },
  title: { fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  cardWrapper: { position: 'relative' },
  removeBtn: { position: 'absolute', top: '8px', right: '8px', backgroundColor: '#e94560', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, zIndex: 10 },
}
