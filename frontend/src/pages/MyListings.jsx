import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiEye, 
  FiPackage, FiDollarSign, FiClock, FiAlertCircle, FiTag
} from 'react-icons/fi'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function MyListings() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('all')
  const [deleteModalSlug, setDeleteModalSlug] = useState(null)
  const navigate = useNavigate()

  const fetchListings = () => {
    setLoading(true)
    productsAPI.myListings()
      .then((res) => setProducts(res.data.results || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const handleDelete = async (slug) => {
    try {
      await productsAPI.delete(slug)
      setDeleteModalSlug(null)
      fetchListings()
    } catch (err) {
      alert('Failed to delete listing')
    }
  }

  const handleMarkSold = async (slug) => {
    try {
      await productsAPI.markSold(slug)
      fetchListings()
    } catch (err) {
      console.error(err)
    }
  }

  const activeCount = products.filter(p => p.status !== 'Sold').length
  const soldCount = products.filter(p => p.status === 'Sold').length
  const totalValue = products
    .filter(p => p.status !== 'Sold')
    .reduce((sum, p) => sum + (Number(p.price) || 0), 0)

  const displayedProducts = products.filter(p => {
    if (filterTab === 'active') return p.status !== 'Sold'
    if (filterTab === 'sold') return p.status === 'Sold'
    return true
  })

  return (
    <div className="container" style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Classified Ads</h1>
          <p style={styles.subtitle}>Manage your active listings, edit details, or mark items as sold</p>
        </div>
        <motion.button
          onClick={() => navigate('/sell')}
          className="btn btn-primary"
          style={styles.newListingBtn}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiPlus style={{ strokeWidth: 2.5 }} />
          <span>Post New Ad</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: '#f0f9ff' }}>
            <FiPackage style={{ fontSize: '20px', color: '#0284c7' }} />
          </div>
          <div>
            <div style={styles.statVal}>{products.length}</div>
            <div style={styles.statLabel}>Total Listings</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: '#f0fdf4' }}>
            <FiCheckCircle style={{ fontSize: '20px', color: '#16a34a' }} />
          </div>
          <div>
            <div style={{ ...styles.statVal, color: '#15803d' }}>{activeCount}</div>
            <div style={styles.statLabel}>Active Ads</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: '#fef2f2' }}>
            <FiTag style={{ fontSize: '20px', color: '#dc2626' }} />
          </div>
          <div>
            <div style={{ ...styles.statVal, color: '#b91c1c' }}>{soldCount}</div>
            <div style={styles.statLabel}>Sold Out</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconWrap, background: '#f0fdfa' }}>
            <FiDollarSign style={{ fontSize: '20px', color: '#0d9488' }} />
          </div>
          <div>
            <div style={{ ...styles.statVal, color: '#00a49f' }}>₹{totalValue.toLocaleString('en-IN')}</div>
            <div style={styles.statLabel}>Active Portfolio Value</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.tabsRow}>
        <button
          style={{
            ...styles.tab,
            ...(filterTab === 'all' ? styles.tabActive : {}),
          }}
          onClick={() => setFilterTab('all')}
        >
          All Listings ({products.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(filterTab === 'active' ? styles.tabActive : {}),
          }}
          onClick={() => setFilterTab('active')}
        >
          Active ({activeCount})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(filterTab === 'sold' ? styles.tabActive : {}),
          }}
          onClick={() => setFilterTab('sold')}
        >
          Sold Out ({soldCount})
        </button>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading your ads...</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <motion.div
          style={styles.emptyState}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiPackage style={{ fontSize: '50px', color: '#94a3b8', strokeWidth: 1.5, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#002f34', marginBottom: '6px' }}>
            No listings found
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            {filterTab === 'all'
              ? "You haven't posted any ads yet. Post your first ad today!"
              : `You don't have any ${filterTab} ads right now.`}
          </p>
          <Link to="/sell" className="btn btn-primary">
            <FiPlus /> Post an Ad Now
          </Link>
        </motion.div>
      ) : (
        <div style={styles.grid}>
          {displayedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              style={styles.cardContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} index={index} />

              {/* Management Actions Footer */}
              <div style={styles.managementBar}>
                {product.status !== 'Sold' && (
                  <motion.button
                    onClick={() => handleMarkSold(product.slug)}
                    style={styles.actionBtnSold}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Mark as Sold"
                  >
                    <FiCheckCircle /> Sold
                  </motion.button>
                )}
                <motion.button
                  onClick={() => navigate(`/products/${product.slug}/edit`)}
                  style={styles.actionBtnEdit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Edit Ad"
                >
                  <FiEdit /> Edit
                </motion.button>
                <motion.button
                  onClick={() => setDeleteModalSlug(product.slug)}
                  style={styles.actionBtnDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Delete Ad"
                >
                  <FiTrash2 /> Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalSlug && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.modalBox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <FiAlertCircle style={{ fontSize: '42px', color: '#ef4444', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#002f34', marginBottom: '8px' }}>
                Delete this listing?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                This listing will be permanently removed from ReSell.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteModalSlug(null)}
                  className="btn btn-secondary"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModalSlug)}
                  className="btn"
                  style={{ backgroundColor: '#ef4444', color: '#fff' }}
                  type="button"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
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
  newListingBtn: {
    padding: '11px 22px',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '18px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
  },
  statIconWrap: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#002f34',
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
    marginTop: '3px',
  },
  tabsRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px',
    borderBottom: '1.5px solid #e2e8f0',
    paddingBottom: '12px',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'transparent',
    transition: 'all 0.15s',
  },
  tabActive: {
    backgroundColor: '#002f34',
    color: '#ffffff',
    fontWeight: '700',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  managementBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  actionBtnSold: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    backgroundColor: '#f0fdfa',
    color: '#00a49f',
    border: '1px solid #99f6e4',
    padding: '8px 6px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  actionBtnEdit: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    backgroundColor: '#f1f5f9',
    color: '#002f34',
    border: '1px solid #cbd5e1',
    padding: '8px 6px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  actionBtnDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '70px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '28px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
}
