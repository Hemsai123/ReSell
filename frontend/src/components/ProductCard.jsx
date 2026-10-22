import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiMapPin, FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi'
import { productsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProductCard({ product, index = 0, onWishlistToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted || false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const handleWishlistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    setWishlistLoading(true)
    const prev = isWishlisted
    setIsWishlisted(!prev)

    try {
      const res = await productsAPI.toggleWishlist(product.slug)
      if (res.data?.is_wishlisted !== undefined) {
        setIsWishlisted(res.data.is_wishlisted)
      }
      if (onWishlistToggle) {
        onWishlistToggle(product.id, !prev)
      }
    } catch (err) {
      setIsWishlisted(prev)
    } finally {
      setWishlistLoading(false)
    }
  }

  // Format price with Indian numbering (e.g. 1,42,000)
  const formatPrice = (val) => {
    const num = Number(val)
    if (isNaN(num)) return val
    return num.toLocaleString('en-IN')
  }

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently'
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }

  const isSold = product.status === 'Sold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{ height: '100%' }}
    >
      <Link to={`/products/${product.slug}`} className="card" style={styles.card}>
        {/* Image wrapper */}
        <div style={styles.imageWrap}>
          {product.image_url ? (
            <motion.img
              src={product.image_url}
              alt={product.name}
              style={styles.image}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.4 }}
              loading="lazy"
            />
          ) : (
            <div style={styles.placeholderWrap}>
              <FiPackage style={{ fontSize: '32px', color: '#94a3b8', strokeWidth: 1.5, marginBottom: '6px' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Verified Listing</span>
            </div>
          )}

          {/* Sold Overlay */}
          {isSold && (
            <div style={styles.soldBadgeOverlay}>
              <span>SOLD</span>
            </div>
          )}

          {/* Condition Chip */}
          <div style={styles.conditionChip}>
            <span
              className={`badge-chip ${product.condition === 'New' ? 'badge-new' : 'badge-used'}`}
            >
              {product.condition === 'New' ? 'Brand New' : 'Pre-owned'}
            </span>
          </div>

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlistClick}
            style={{
              ...styles.wishlistBtn,
              backgroundColor: isWishlisted ? '#ff5630' : 'rgba(255, 255, 255, 0.9)',
              color: isWishlisted ? '#fff' : '#64748b',
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={wishlistLoading}
          >
            <FiHeart style={{ fontSize: '16px', fill: isWishlisted ? 'currentColor' : 'none' }} />
          </motion.button>
        </div>

        {/* Info Content */}
        <div style={styles.info}>
          {/* Price */}
          <div style={styles.priceRow}>
            <div style={styles.price}>
              <span style={styles.rupeeSign}>₹</span>
              <span>{formatPrice(product.price)}</span>
            </div>
            {product.category?.category_name && (
              <span style={styles.categoryTag}>
                {product.category.category_name}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={styles.title} title={product.name}>
            {product.name}
          </h3>

          {/* Location & Time Footer */}
          <div style={styles.footerRow}>
            <div style={styles.location} title={product.location || 'India'}>
              <FiMapPin style={{ fontSize: '12px', color: '#00a49f', flexShrink: 0 }} />
              <span style={styles.locationText}>{product.location || 'India'}</span>
            </div>
            <div style={styles.date}>
              <FiClock style={{ fontSize: '11px', flexShrink: 0 }} />
              <span>{formatDate(product.created)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    textDecoration: 'none',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    position: 'relative',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: '190px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholderWrap: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: '6px',
  },
  soldBadgeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '900',
    letterSpacing: '3px',
    zIndex: 2,
  },
  conditionChip: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 3,
  },
  wishlistBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
    zIndex: 3,
    transition: 'background-color 0.2s',
  },
  info: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: '6px',
    gap: '8px',
  },
  price: {
    fontSize: '21px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'baseline',
  },
  rupeeSign: {
    fontSize: '18px',
    fontWeight: '700',
    marginRight: '2px',
    color: '#ff5630',
  },
  categoryTag: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#00a49f',
    backgroundColor: '#f0fdfa',
    padding: '3px 8px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px',
  },
  title: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.4',
    marginBottom: '14px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '40px',
  },
  footerRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11.5px',
    color: '#64748b',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
    gap: '8px',
  },
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'hidden',
  },
  locationText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#94a3b8',
    flexShrink: 0,
  },
}
