import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productsAPI, conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import MessagesPanel from '../components/MessagesPanel'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showMessages, setShowMessages] = useState(false)

  const fetchProduct = () => {
    productsAPI.getById(slug)
      .then((res) => setProduct(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProduct() }, [slug, navigate])

  const handleAddReview = async (e) => {
    e.preventDefault()
    await productsAPI.addReview(slug, { rating: reviewRating, comment: reviewComment })
    setShowReviewForm(false)
    setReviewComment('')
    setReviewRating(5)
    fetchProduct()
  }

  const handleToggleWishlist = async () => {
    await productsAPI.toggleWishlist(slug)
    fetchProduct()
  }

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await productsAPI.contactSeller(slug)
      setShowMessages(true)
    } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error)
      }
    }
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>
  if (!product) return null

  const isOwner = user && user.id === product.owner.id

  return (
    <>
      <motion.div
        className="container"
        style={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={styles.layout}>
          <motion.div
            style={styles.imageSection}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              style={styles.mainImage}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img src={product.image_url || 'https://via.placeholder.com/500x400?text=No+Image'} alt={product.name} style={styles.image} />
            </motion.div>
            {product.images?.length > 0 && (
              <div style={styles.thumbnails}>
                {product.images.map((img, index) => (
                  <motion.div
                    key={img.id}
                    style={styles.thumb}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, borderColor: '#e94560' }}
                  >
                    <img src={img.image_url} alt="" style={styles.thumbImage} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div
            style={styles.details}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h1
              style={styles.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {product.name}
            </motion.h1>
            <motion.p
              style={styles.price}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Rs {product.price}
            </motion.p>
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

            <div style={styles.rating}>
              <span style={styles.stars}>{'★'.repeat(Math.round(product.average_rating))}{'☆'.repeat(5 - Math.round(product.average_rating))}</span>
              <span style={styles.ratingText}>({product.review_count} reviews)</span>
            </div>

            <div style={styles.meta}>
              <div style={styles.metaRow}><span style={styles.metaLabel}>Condition:</span><span>{product.condition}</span></div>
              <div style={styles.metaRow}><span style={styles.metaLabel}>Category:</span><span>{product.category?.category_name}</span></div>
              {product.brand && <div style={styles.metaRow}><span style={styles.metaLabel}>Brand:</span><span>{product.brand.brand_name}</span></div>}
              <div style={styles.metaRow}><span style={styles.metaLabel}>Quantity:</span><span>{product.quantity}</span></div>
              {product.location && <div style={styles.metaRow}><span style={styles.metaLabel}>Location:</span><span>{product.location}</span></div>}
              <div style={styles.metaRow}><span style={styles.metaLabel}>Posted:</span><span>{new Date(product.created).toLocaleDateString()}</span></div>
            </div>

            <div style={styles.description}>
              <h3 style={styles.descTitle}>Description</h3>
              <p style={styles.descText}>{product.description}</p>
            </div>

            {user && !isOwner && (
              <motion.div
                style={styles.actions}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handleContactSeller}
                  style={styles.contactBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Message Seller
                </motion.button>
                <motion.button
                  onClick={handleToggleWishlist}
                  style={styles.wishlistBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {product.is_wishlisted ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                </motion.button>
              </motion.div>
            )}

            {isOwner && (
              <motion.div
                style={styles.ownerBadge}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p style={styles.ownerText}>Your Product</p>
                <div style={styles.ownerActions}>
                  <motion.button
                    onClick={() => navigate(`/products/${product.slug}/edit`)}
                    style={styles.editBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </motion.button>
                </div>
              </motion.div>
            )}

            <motion.div
              style={styles.seller}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 style={styles.sellerTitle}>Seller Information</h3>
              <div style={styles.sellerInfo}>
                <div style={styles.sellerAvatar}>
                  {(product.owner?.first_name?.[0] || product.owner?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <p style={styles.sellerName}>{product.owner?.first_name || product.owner?.username}</p>
                  <p style={styles.sellerUsername}>@{product.owner?.username}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          style={styles.reviewsSection}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div style={styles.reviewsHeader}>
            <h3 style={styles.reviewsTitle}>Reviews ({product.review_count})</h3>
            {user && !isOwner && (
              <motion.button
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={styles.addReviewBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showReviewForm ? 'Cancel' : '+ Add Review'}
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.form
                onSubmit={handleAddReview}
                style={styles.reviewForm}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={styles.ratingInput}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ ...styles.starBtn, color: star <= reviewRating ? '#ffc107' : '#e0e0e0' }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ★
                    </motion.button>
                  ))}
                </div>
                <textarea className="form-control" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Write your review..." rows="3" />
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  style={styles.submitReviewBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Submit Review
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {product.reviews?.length > 0 ? (
            <div style={styles.reviewsList}>
              {product.reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  style={styles.reviewItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                >
                  <div style={styles.reviewHeader}>
                    <strong>{review.reviewer_name}</strong>
                    <span style={styles.reviewStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p style={styles.reviewComment}>{review.comment}</p>
                  <span style={styles.reviewDate}>{new Date(review.created).toLocaleDateString()}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p style={styles.noReviews}>No reviews yet. Be the first to review!</p>
          )}
        </motion.div>
      </motion.div>
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  )
}

const styles = {
  page: { paddingTop: '28px', paddingBottom: '48px' },
  layout: { display: 'flex', gap: '32px' },
  imageSection: { flex: 1, maxWidth: '500px' },
  mainImage: { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  image: { width: '100%', height: '400px', objectFit: 'cover' },
  thumbnails: { display: 'flex', gap: '8px', marginTop: '12px' },
  thumb: { width: '70px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #e0e0e0' },
  thumbImage: { width: '100%', height: '100%', objectFit: 'cover' },
  details: { flex: 1 },
  name: { fontSize: '28px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' },
  price: { fontSize: '30px', fontWeight: 700, color: '#e94560', marginBottom: '12px' },
  soldBadge: { backgroundColor: '#4caf50', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700, marginLeft: '12px' },
  rating: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  stars: { color: '#ffc107', fontSize: '18px' },
  ratingText: { color: '#666', fontSize: '14px' },
  meta: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  metaRow: { display: 'flex', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
  metaLabel: { fontWeight: 600, width: '120px', color: '#1a1a2e' },
  description: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  descTitle: { fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#1a1a2e' },
  descText: { fontSize: '14px', lineHeight: 1.7, color: '#444' },
  actions: { display: 'flex', gap: '12px', marginBottom: '20px' },
  contactBtn: { flex: 1, backgroundColor: '#1a1a2e', color: '#fff', padding: '14px', borderRadius: '6px', fontWeight: 700, fontSize: '14px' },
  wishlistBtn: { flex: 1, backgroundColor: '#fff', color: '#1a1a2e', padding: '14px', borderRadius: '6px', fontWeight: 700, fontSize: '14px', border: '2px solid #1a1a2e' },
  ownerBadge: { backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '20px' },
  ownerText: { color: '#2e7d32', fontWeight: 600, marginBottom: '8px' },
  ownerActions: { display: 'flex', gap: '8px' },
  editBtn: { backgroundColor: '#2196f3', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 600, fontSize: '13px' },
  seller: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sellerTitle: { fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#1a1a2e' },
  sellerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  sellerAvatar: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' },
  sellerName: { fontSize: '15px', fontWeight: 600 },
  sellerUsername: { fontSize: '13px', color: '#666' },
  reviewsSection: { marginTop: '40px' },
  reviewsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  reviewsTitle: { fontSize: '20px', fontWeight: 700, color: '#1a1a2e' },
  addReviewBtn: { backgroundColor: '#e94560', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 700, fontSize: '13px' },
  reviewForm: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
  ratingInput: { display: 'flex', gap: '4px', marginBottom: '12px' },
  starBtn: { fontSize: '28px', background: 'none', cursor: 'pointer' },
  submitReviewBtn: { marginTop: '12px' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reviewItem: { backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  reviewStars: { color: '#ffc107' },
  reviewComment: { color: '#444', fontSize: '14px', marginBottom: '6px' },
  reviewDate: { fontSize: '12px', color: '#999' },
  noReviews: { textAlign: 'center', color: '#666', padding: '20px' },
}
