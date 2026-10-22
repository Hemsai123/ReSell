import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMapPin, FiClock, FiHeart, FiShare2, FiMessageSquare, 
  FiEdit, FiTrash2, FiCheckCircle, FiShield, FiStar, 
  FiChevronRight, FiAlertCircle, FiTag, FiBox, FiPackage
} from 'react-icons/fi'
import { productsAPI, conversationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import MessagesPanel from '../components/MessagesPanel'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(null)
  const [showMessages, setShowMessages] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [soldLoading, setSoldLoading] = useState(false)

  // Review state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const fetchProduct = () => {
    productsAPI.getById(slug)
      .then((res) => {
        setProduct(res.data)
        setActiveImage(res.data.image_url)
      })
      .catch((err) => {
        console.error('Failed to load product:', err)
        navigate('/products')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    fetchProduct()
  }, [slug])

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setWishlistLoading(true)
    try {
      const res = await productsAPI.toggleWishlist(slug)
      setProduct({ ...product, is_wishlisted: res.data.is_wishlisted })
      showToast(res.data.is_wishlisted ? 'Saved to Wishlist!' : 'Removed from Wishlist')
    } catch (err) {
      console.error(err)
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.id === product.owner?.id) {
      showToast("You are the seller of this listing!")
      return
    }
    try {
      await productsAPI.contactSeller(slug)
      setShowMessages(true)
    } catch (err) {
      if (err.response?.data?.error) {
        showToast(err.response.data.error)
      } else {
        setShowMessages(true)
      }
    }
  }

  const handleMarkSold = async () => {
    setSoldLoading(true)
    try {
      await productsAPI.markSold(slug)
      setProduct({ ...product, status: 'Sold' })
      showToast('Item marked as SOLD!')
    } catch (err) {
      console.error(err)
    } finally {
      setSoldLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await productsAPI.delete(slug)
      navigate('/my-listings')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete listing')
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Listing link copied to clipboard!')
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setReviewSubmitting(true)
    setReviewError(null)
    try {
      await productsAPI.addReview(slug, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      setReviewComment('')
      showToast('Review submitted successfully!')
      fetchProduct()
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'You may have already reviewed this product.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
          Loading product details...
        </p>
      </div>
    )
  }

  if (!product) return null

  const isOwner = user && user.id === product.owner?.id
  const isSold = product.status === 'Sold'
  const allImages = [
    ...(product.image_url ? [{ id: 'main', image_url: product.image_url }] : []),
    ...(product.images || [])
  ]

  const formatPrice = (val) => {
    const num = Number(val)
    if (isNaN(num)) return val
    return num.toLocaleString('en-IN')
  }

  return (
    <>
      <div className="container" style={styles.page}>
        {/* Breadcrumb */}
        <div style={styles.breadcrumb}>
          <Link to="/" style={styles.breadLink}>Home</Link>
          <FiChevronRight style={styles.breadSep} />
          <Link to="/products" style={styles.breadLink}>Ads</Link>
          {product.category && (
            <>
              <FiChevronRight style={styles.breadSep} />
              <Link to={`/categories/${product.category.slug}`} style={styles.breadLink}>
                {product.category.category_name}
              </Link>
            </>
          )}
          <FiChevronRight style={styles.breadSep} />
          <span style={styles.breadCurrent}>{product.name}</span>
        </div>

        {/* Main 2-column layout */}
        <div style={styles.layout}>
          {/* Left Column: Gallery & Details */}
          <div style={styles.leftCol}>
            {/* Gallery Card */}
            <div style={styles.galleryCard}>
              <div style={styles.mainImageWrap}>
                {activeImage ? (
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={product.name}
                    style={styles.mainImage}
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div style={styles.placeholderWrap}>
                    <FiPackage style={{ fontSize: '56px', color: '#94a3b8', strokeWidth: 1.5, marginBottom: '8px' }} />
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>No Image Uploaded</span>
                  </div>
                )}

                {isSold && (
                  <div style={styles.soldBadgeOverlay}>
                    <span>SOLD</span>
                  </div>
                )}

                {/* Floating condition tag */}
                <div style={styles.conditionTagWrap}>
                  <span className={`badge-chip ${product.condition === 'New' ? 'badge-new' : 'badge-used'}`}>
                    {product.condition === 'New' ? 'Brand New' : 'Pre-owned'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div style={styles.thumbnailRow}>
                  {allImages.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImage(img.image_url)}
                      style={{
                        ...styles.thumbnailBtn,
                        borderColor: activeImage === img.image_url ? '#00a49f' : 'transparent',
                      }}
                      type="button"
                    >
                      <img src={img.image_url} alt="" style={styles.thumbImg} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Description */}
            <div style={styles.contentCard}>
              <h3 style={styles.sectionTitle}>Product Description</h3>
              <p style={styles.descriptionText}>
                {product.description || 'No detailed description provided by the seller.'}
              </p>

              <div style={styles.specGrid}>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>Condition</span>
                  <span style={styles.specValue}>{product.condition}</span>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>Category</span>
                  <span style={styles.specValue}>{product.category?.category_name || 'General'}</span>
                </div>
                {product.brand && (
                  <div style={styles.specItem}>
                    <span style={styles.specLabel}>Brand</span>
                    <span style={styles.specValue}>{product.brand.brand_name}</span>
                  </div>
                )}
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>Location</span>
                  <span style={styles.specValue}>{product.location || 'India'}</span>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>Available Units</span>
                  <span style={styles.specValue}>{product.quantity || 1}</span>
                </div>
                <div style={styles.specItem}>
                  <span style={styles.specLabel}>Status</span>
                  <span style={{ ...styles.specValue, color: isSold ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Buyer Reviews & Ratings */}
            <div style={styles.contentCard}>
              <div style={styles.reviewHeaderRow}>
                <div>
                  <h3 style={styles.sectionTitle}>Community Reviews ({product.review_count || 0})</h3>
                  <div style={styles.ratingStarsRow}>
                    <span style={styles.ratingNumber}>{product.average_rating || 0}</span>
                    <div style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar
                          key={s}
                          style={{
                            color: s <= Math.round(product.average_rating || 0) ? '#f59e0b' : '#cbd5e1',
                            fill: s <= Math.round(product.average_rating || 0) ? '#f59e0b' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review submission form */}
              {user && !isOwner && (
                <form onSubmit={handleReviewSubmit} style={styles.reviewForm}>
                  <h4 style={styles.reviewFormTitle}>Leave a Rating &amp; Review</h4>
                  {reviewError && <p className="error-message">{reviewError}</p>}

                  <div style={styles.starPickerRow}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Your Rating:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{ fontSize: '20px', color: star <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                        >
                          <FiStar style={{ fill: star <= reviewRating ? '#f59e0b' : 'none' }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <textarea
                      placeholder="Share your experience dealing with this item or seller..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="form-control"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="btn btn-teal"
                    style={{ marginTop: '12px' }}
                    disabled={reviewSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                  </motion.button>
                </form>
              )}

              {/* List of reviews */}
              {product.reviews && product.reviews.length > 0 ? (
                <div style={styles.reviewList}>
                  {product.reviews.map((rev) => (
                    <div key={rev.id} style={styles.reviewItem}>
                      <div style={styles.reviewUserRow}>
                        <div style={styles.reviewAvatar}>
                          {rev.reviewer_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={styles.reviewUserName}>{rev.reviewer_name}</p>
                          <p style={styles.reviewDate}>
                            {new Date(rev.created).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div style={{ ...styles.stars, marginLeft: 'auto' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              style={{
                                color: s <= rev.rating ? '#f59e0b' : '#cbd5e1',
                                fill: s <= rev.rating ? '#f59e0b' : 'none',
                                fontSize: '14px',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={styles.reviewComment}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noReviewsText}>No reviews yet. Be the first to review this product!</p>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Actions & Seller Box */}
          <div style={styles.rightCol}>
            {/* Price & Primary CTA Card */}
            <div style={styles.actionCard}>
              <div style={styles.priceHeader}>
                <div style={styles.priceBlock}>
                  <span style={styles.rupeeSign}>₹</span>
                  <span style={styles.priceValue}>{formatPrice(product.price)}</span>
                </div>
                <div style={styles.utilityBtns}>
                  <motion.button
                    onClick={handleToggleWishlist}
                    style={{
                      ...styles.roundIconBtn,
                      color: product.is_wishlisted ? '#ff5630' : '#64748b',
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={wishlistLoading}
                    title="Save to Wishlist"
                  >
                    <FiHeart style={{ fill: product.is_wishlisted ? 'currentColor' : 'none' }} />
                  </motion.button>
                  <motion.button
                    onClick={handleShare}
                    style={styles.roundIconBtn}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    title="Share Listing"
                  >
                    <FiShare2 />
                  </motion.button>
                </div>
              </div>

              <h1 style={styles.listingTitle}>{product.name}</h1>

              <div style={styles.metaRow}>
                <span style={styles.metaItem}>
                  <FiMapPin style={{ color: '#00a49f' }} />
                  {product.location || 'India'}
                </span>
                <span style={styles.metaItem}>
                  <FiClock style={{ color: '#94a3b8' }} />
                  {new Date(product.created).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Main Action Buttons */}
              <div style={styles.btnStack}>
                {!isOwner ? (
                  <motion.button
                    onClick={handleContactSeller}
                    className="btn btn-primary"
                    style={styles.chatPrimaryBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSold}
                  >
                    <FiMessageSquare style={{ fontSize: '18px' }} />
                    <span>{isSold ? 'Item Sold Out' : 'Chat with Seller'}</span>
                  </motion.button>
                ) : (
                  <div style={styles.ownerActions}>
                    <div style={styles.ownerNotice}>
                      <span>You are the author of this listing.</span>
                    </div>

                    {!isSold && (
                      <motion.button
                        onClick={handleMarkSold}
                        style={styles.markSoldBtn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={soldLoading}
                      >
                        <FiCheckCircle /> Mark as Sold
                      </motion.button>
                    )}

                    <motion.button
                      onClick={() => navigate(`/products/${product.slug}/edit`)}
                      style={styles.editListingBtn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiEdit /> Edit Details
                    </motion.button>

                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      style={styles.deleteListingBtn}
                    >
                      <FiTrash2 /> Delete Listing
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seller Info Card */}
            <div style={styles.sellerCard}>
              <h4 style={styles.sellerCardHeading}>Seller Information</h4>
              <div style={styles.sellerHeader}>
                <div style={styles.sellerAvatar}>
                  {product.owner?.username?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 style={styles.sellerName}>{product.owner?.username}</h3>
                  <div style={styles.verifiedTag}>
                    <FiCheckCircle style={{ color: '#00a49f' }} />
                    <span>Verified Seller</span>
                  </div>
                </div>
              </div>

              <div style={styles.sellerStats}>
                <div style={styles.sellerStatItem}>
                  <span style={styles.statLabel}>Response Rate</span>
                  <span style={styles.statVal}>99% (Fast)</span>
                </div>
                <div style={styles.sellerStatItem}>
                  <span style={styles.statLabel}>Community Standing</span>
                  <span style={styles.statVal}>⭐ Highly Rated</span>
                </div>
              </div>
            </div>

            {/* Safety Guidelines Card */}
            <div style={styles.safetyCard}>
              <div style={styles.safetyHeader}>
                <FiShield style={{ fontSize: '20px', color: '#ff5630' }} />
                <h4 style={styles.safetyTitle}>Safety Tips for Buyers</h4>
              </div>
              <ul style={styles.safetyList}>
                <li>Meet the seller in a safe, public place.</li>
                <li>Inspect and test the item thoroughly before paying.</li>
                <li>Never share banking OTPs or sensitive passwords.</li>
                <li>Use ReSell in-app chat for all communication records.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <FiAlertCircle style={{ fontSize: '42px', color: '#ef4444', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Delete this listing?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="btn btn-secondary"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn"
                  style={{ backgroundColor: '#ef4444', color: '#fff' }}
                  type="button"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast-notice"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <FiCheckCircle style={{ color: '#5eead4' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over chat */}
      <MessagesPanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  )
}

const styles = {
  page: {
    paddingTop: '24px',
    paddingBottom: '80px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  breadLink: {
    color: '#64748b',
    transition: 'color 0.15s',
  },
  breadSep: {
    fontSize: '12px',
    color: '#cbd5e1',
  },
  breadCurrent: {
    color: '#002f34',
    fontWeight: '700',
    maxWidth: '300px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)',
    gap: '28px',
    alignItems: 'flex-start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  galleryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
  },
  mainImageWrap: {
    position: 'relative',
    width: '100%',
    height: '440px',
    backgroundColor: '#0f172a',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  placeholderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  soldBadgeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '28px',
    fontWeight: '900',
    letterSpacing: '4px',
    zIndex: 2,
  },
  conditionTagWrap: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    zIndex: 3,
  },
  thumbnailRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  thumbnailBtn: {
    width: '68px',
    height: '68px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '2px solid transparent',
    padding: '2px',
    backgroundColor: '#f1f5f9',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '6px',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#002f34',
    marginBottom: '14px',
    letterSpacing: '-0.3px',
  },
  descriptionText: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: '#334155',
    whiteSpace: 'pre-line',
    marginBottom: '24px',
  },
  specGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  specLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  specValue: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  ratingStarsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  ratingNumber: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#002f34',
  },
  stars: {
    display: 'flex',
    gap: '3px',
    color: '#f59e0b',
  },
  reviewForm: {
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    padding: '18px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  reviewFormTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#002f34',
    marginBottom: '8px',
  },
  starPickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  reviewItem: {
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  reviewUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  reviewAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#00a49f',
    color: '#fff',
    fontWeight: '800',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewUserName: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0f172a',
  },
  reviewDate: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  reviewComment: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
  },
  noReviewsText: {
    color: '#94a3b8',
    fontSize: '13.5px',
    fontStyle: 'italic',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
  },
  priceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  priceBlock: {
    display: 'flex',
    alignItems: 'baseline',
  },
  rupeeSign: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#ff5630',
    marginRight: '2px',
  },
  priceValue: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.5px',
  },
  utilityBtns: {
    display: 'flex',
    gap: '8px',
  },
  roundIconBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px',
    transition: 'all 0.2s',
  },
  listingTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.35',
    marginBottom: '12px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '13px',
    color: '#64748b',
    paddingBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '20px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  btnStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chatPrimaryBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '0.3px',
  },
  ownerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  ownerNotice: {
    padding: '8px 12px',
    backgroundColor: '#f0fdfa',
    color: '#00a49f',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'center',
  },
  markSoldBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#00a49f',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
  },
  editListingBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#002f34',
    color: '#fff',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '14px',
  },
  deleteListingBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '11px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13.5px',
  },
  sellerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
  },
  sellerCardHeading: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '14px',
  },
  sellerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  sellerAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #002f34 0%, #00a49f 100%)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#002f34',
  },
  verifiedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#00a49f',
    fontWeight: '700',
    marginTop: '2px',
  },
  sellerStats: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sellerStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  statLabel: {
    color: '#64748b',
  },
  statVal: {
    color: '#1e293b',
    fontWeight: '700',
  },
  safetyCard: {
    backgroundColor: '#fffbeb',
    borderRadius: '20px',
    padding: '22px',
    border: '1px solid #fef3c7',
  },
  safetyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  safetyTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#92400e',
  },
  safetyList: {
    fontSize: '12.5px',
    color: '#78350f',
    lineHeight: '1.6',
    paddingLeft: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '28px',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
}
