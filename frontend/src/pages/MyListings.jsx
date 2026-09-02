import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function MyListings() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const navigate = useNavigate()

  const fetchListings = () => {
    setLoading(true)
    productsAPI.myListings()
      .then((res) => setProducts(res.data.results || res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchListings() }, [])

  const handleDelete = async (slug) => {
    await productsAPI.delete(slug)
    setDeleteConfirm(null)
    fetchListings()
  }

  const handleMarkSold = async (slug) => {
    await productsAPI.markSold(slug)
    fetchListings()
  }

  return (
    <div className="container" style={styles.page}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={styles.title}>My Listings</h2>
        <motion.button
          onClick={() => navigate('/sell')}
          className="btn btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + New Listing
        </motion.button>
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
          <div className="empty-state-icon">&#128230;</div>
          <p className="empty-state-text">You haven't posted any ads yet.</p>
        </motion.div>
      ) : (
        <div style={styles.grid}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              style={styles.cardWrapper}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <ProductCard product={product} index={index} />
              <div style={styles.actions}>
                {product.status !== 'Sold' && (
                  <motion.button
                    onClick={() => handleMarkSold(product.slug)}
                    style={styles.soldBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mark Sold
                  </motion.button>
                )}
                <motion.button
                  onClick={() => navigate(`/products/${product.slug}/edit`)}
                  style={styles.editBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => setDeleteConfirm(product.slug)}
                  style={styles.deleteBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
              {product.status === 'Sold' && (
                <motion.span
                  style={styles.soldBadge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  SOLD
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <h3>Delete Listing?</h3>
              <p>Are you sure you want to delete this listing? This action cannot be undone.</p>
              <div style={styles.modalActions}>
                <motion.button
                  onClick={() => setDeleteConfirm(null)}
                  style={styles.cancelBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={styles.confirmBtn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  page: { paddingTop: '28px', paddingBottom: '48px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  cardWrapper: { position: 'relative' },
  actions: { display: 'flex', gap: '8px', marginTop: '10px' },
  soldBtn: { flex: 1, backgroundColor: '#4caf50', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 },
  editBtn: { flex: 1, backgroundColor: '#2196f3', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 },
  deleteBtn: { flex: 1, backgroundColor: '#e94560', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 },
  soldBadge: { position: 'absolute', top: '8px', left: '8px', backgroundColor: '#4caf50', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, zIndex: 10 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '32px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center' },
  modalActions: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#e0e0e0', color: '#333', padding: '10px 24px', borderRadius: '6px', fontWeight: 600 },
  confirmBtn: { backgroundColor: '#e94560', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: 600 },
}
