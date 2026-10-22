import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiUploadCloud, FiX, FiPlus, FiCheck, FiMapPin, 
  FiTag, FiArrowLeft, FiAlertCircle, FiEye 
} from 'react-icons/fi'
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api'

const QUICK_LOCATIONS = ['Mumbai, Maharashtra', 'Bangalore, Karnataka', 'Delhi, NCR', 'Hyderabad, Telangana', 'Pune, Maharashtra']

export default function CreateListing() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [customCategory, setCustomCategory] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    condition: 'Used',
    category: '',
    brand: '',
    price: '',
    quantity: '1',
    location: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Modals for new category/brand
  const [showCatModal, setShowCatModal] = useState(false)
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.results || res.data))
    brandsAPI.getAll().then((res) => setBrands(res.data.results || res.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    try {
      const res = await categoriesAPI.create({ category_name: newCatName.trim() })
      setCategories(prev => [...prev, res.data])
      setForm(prev => ({ ...prev, category: res.data.id }))
      setNewCatName('')
      setShowCatModal(false)
    } catch (err) {
      alert('Failed to add category')
    }
  }

  const handleCreateBrand = async (e) => {
    e.preventDefault()
    if (!newBrandName.trim()) return
    try {
      const res = await brandsAPI.create({ brand_name: newBrandName.trim() })
      setBrands(prev => [...prev, res.data])
      setForm(prev => ({ ...prev, brand: res.data.id }))
      setNewBrandName('')
      setShowBrandModal(false)
    } catch (err) {
      alert('Failed to add brand')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    let resolvedCategory = form.category
    if (form.category === 'other') {
      const trimmedCat = customCategory.trim()
      if (!trimmedCat) {
        setErrors({ category: ['Please enter your custom category name'] })
        setLoading(false)
        return
      }

      // Check if this category exists in current list
      const matched = categories.find(c => c.category_name.toLowerCase() === trimmedCat.toLowerCase())
      if (matched) {
        resolvedCategory = matched.id
      } else {
        try {
          const res = await categoriesAPI.create({ category_name: trimmedCat })
          resolvedCategory = res.data.id
          setCategories(prev => [...prev, res.data])
        } catch (catErr) {
          console.warn('Category creation API fallback:', catErr)
        }
      }
    }

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description)
    formData.append('condition', form.condition)
    formData.append('price', form.price)
    formData.append('quantity', form.quantity || '1')
    if (resolvedCategory && resolvedCategory !== 'other') {
      formData.append('category', resolvedCategory)
    }
    if (customCategory.trim()) {
      formData.append('other_category', customCategory.trim())
    }
    if (form.brand) formData.append('brand', form.brand)
    if (form.location) formData.append('location', form.location)
    if (selectedFile) formData.append('image', selectedFile)

    try {
      const res = await productsAPI.create(formData)
      if (res.data?.slug) {
        navigate(`/products/${res.data.slug}`)
      } else {
        navigate('/my-listings')
      }
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data)
      } else {
        alert('An unexpected error occurred while posting your ad.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getCategoryName = (id) => {
    if (id === 'other') return customCategory.trim() || 'Other'
    const cat = categories.find(c => String(c.id) === String(id))
    return cat ? cat.category_name : ''
  }

  return (
    <div className="container" style={styles.page}>
      {/* Top title bar */}
      <div style={styles.header}>
        <Link to="/products" style={styles.backBtn}>
          <FiArrowLeft /> Back to Ads
        </Link>
        <h1 style={styles.title}>Post a Free Classified Ad</h1>
        <p style={styles.subtitle}>
          Fill in the details below to reach thousands of potential buyers in your area
        </p>
      </div>

      <div style={styles.layout}>
        {/* Form Column */}
        <motion.div
          style={styles.formCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label>Ad Title *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Apple iPhone 14 Pro 128GB Space Black"
                maxLength={100}
                className="form-control"
                required
              />
              <div style={styles.charCount}>{form.name.length} / 100 characters</div>
              {errors.name && <p className="error-message">{errors.name[0]}</p>}
            </div>

            {/* Category and Brand Row */}
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <div style={styles.labelWithAdd}>
                  <label>Category *</label>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    style={styles.inlineAddBtn}
                  >
                    + New
                  </button>
                </div>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                  <option value="other">Other (Specify below)</option>
                </select>
                {errors.category && <p className="error-message">{errors.category[0]}</p>}

                <AnimatePresence>
                  {form.category === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#002f34', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiTag style={{ color: '#00a49f' }} /> Specify Category Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Musical Instruments, Pet Supplies, Antiques..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="form-control"
                        maxLength={50}
                        required
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <div style={styles.labelWithAdd}>
                  <label>Brand (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setShowBrandModal(true)}
                    style={styles.inlineAddBtn}
                  >
                    + New
                  </button>
                </div>
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.brand_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price and Condition Row */}
            <div style={styles.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Set Price (₹) *</label>
                <div style={styles.rupeeInputWrap}>
                  <span style={styles.rupeePrefix}>₹</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 24999"
                    className="form-control"
                    style={{ paddingLeft: '32px' }}
                    min="0"
                    required
                  />
                </div>
                {errors.price && <p className="error-message">{errors.price[0]}</p>}
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>Condition *</label>
                <div style={styles.conditionBtnGroup}>
                  <button
                    type="button"
                    style={{
                      ...styles.conditionToggle,
                      backgroundColor: form.condition === 'Used' ? '#002f34' : '#fff',
                      color: form.condition === 'Used' ? '#fff' : '#475569',
                      borderColor: form.condition === 'Used' ? '#002f34' : '#e2e8f0',
                    }}
                    onClick={() => setForm({ ...form, condition: 'Used' })}
                  >
                    <FiTag style={{ marginRight: '6px' }} /> Pre-owned / Used
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.conditionToggle,
                      backgroundColor: form.condition === 'New' ? '#002f34' : '#fff',
                      color: form.condition === 'New' ? '#fff' : '#475569',
                      borderColor: form.condition === 'New' ? '#002f34' : '#e2e8f0',
                    }}
                    onClick={() => setForm({ ...form, condition: 'New' })}
                  >
                    <FiCheck style={{ marginRight: '6px' }} /> Brand New
                  </button>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location (City, Area) *</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bandra West, Mumbai"
                className="form-control"
                required
              />
              <div style={styles.quickPills}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quick pick:</span>
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    style={styles.quickPill}
                    onClick={() => setForm({ ...form, location: loc })}
                  >
                    {loc.split(',')[0]}
                  </button>
                ))}
              </div>
              {errors.location && <p className="error-message">{errors.location[0]}</p>}
            </div>

            {/* Photo Upload Zone */}
            <div className="form-group">
              <label>Product Photos</label>
              {!previewUrl ? (
                <div
                  style={styles.uploadDropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUploadCloud style={{ fontSize: '38px', color: '#00a49f' }} />
                  <p style={styles.uploadPrimaryText}>Click to upload image</p>
                  <p style={styles.uploadSubtext}>Supports JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              ) : (
                <div style={styles.previewImageContainer}>
                  <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={styles.removeImgBtn}
                    title="Remove Photo"
                  >
                    <FiX />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Mention condition, accessories included, reason for selling, warranty, etc."
                rows={5}
                className="form-control"
                maxLength={500}
                required
              />
              <div style={styles.charCount}>{form.description.length} / 500 characters</div>
              {errors.description && <p className="error-message">{errors.description[0]}</p>}
            </div>

            {/* Submit CTA */}
            <motion.button
              type="submit"
              className="btn btn-primary"
              style={styles.submitBtn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiCheck style={{ marginRight: '8px', fontSize: '18px' }} />
              {loading ? 'Publishing Your Ad...' : 'Post My Ad Now'}
            </motion.button>
          </form>
        </motion.div>

        {/* Live Preview Column */}
        <div style={styles.previewCol}>
          <div style={styles.liveCardWrap}>
            <div style={styles.liveBadge}>
              <FiEye /> LIVE CARD PREVIEW
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={styles.mockImgWrap}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={styles.mockImgPlaceholder}>
                    <FiUploadCloud style={{ fontSize: '38px', color: '#94a3b8', marginBottom: '6px' }} />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Your photo here</span>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span className={`badge-chip ${form.condition === 'New' ? 'badge-new' : 'badge-used'}`}>
                    {form.condition === 'New' ? 'Brand New' : 'Pre-owned'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#002f34' }}>
                    <span style={{ color: '#ff5630', marginRight: '2px' }}>₹</span>
                    {form.price ? Number(form.price).toLocaleString('en-IN') : '0'}
                  </div>
                  {form.category && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#00a49f', backgroundColor: '#f0fdfa', padding: '3px 8px', borderRadius: '6px' }}>
                      {getCategoryName(form.category)}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', minHeight: '40px', lineHeight: 1.35 }}>
                  {form.name || 'Your Ad Title will appear here...'}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiMapPin style={{ color: '#00a49f' }} />
                    {form.location || 'Your Location'}
                  </span>
                  <span>Just now</span>
                </div>
              </div>
            </div>

            <div style={styles.sellerTipBox}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#002f34', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertCircle style={{ color: '#00a49f' }} /> Pro Selling Tip
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                Ads with real photos taken in good natural lighting sell <strong>4x faster</strong> than ads with stock photos!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Category */}
      <AnimatePresence>
        {showCatModal && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.modalBox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#002f34', marginBottom: '14px' }}>
                Create New Category
              </h3>
              <form onSubmit={handleCreateCategory}>
                <input
                  type="text"
                  placeholder="e.g. Musical Instruments"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '14px' }}
                  required
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Brand */}
      <AnimatePresence>
        {showBrandModal && (
          <div style={styles.modalOverlay}>
            <motion.div
              style={styles.modalBox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#002f34', marginBottom: '14px' }}>
                Create New Brand
              </h3>
              <form onSubmit={handleCreateBrand}>
                <input
                  type="text"
                  placeholder="e.g. Yamaha"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: '14px' }}
                  required
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowBrandModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  page: {
    paddingTop: '28px',
    paddingBottom: '80px',
    maxWidth: '1100px',
  },
  header: {
    marginBottom: '28px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#00a49f',
    marginBottom: '10px',
  },
  title: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14.5px',
    color: '#64748b',
    marginTop: '4px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1.1fr)',
    gap: '32px',
    alignItems: 'flex-start',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  labelWithAdd: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  inlineAddBtn: {
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#00a49f',
  },
  charCount: {
    fontSize: '11px',
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: '4px',
  },
  rupeeInputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  rupeePrefix: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    fontWeight: '800',
    color: '#ff5630',
  },
  conditionBtnGroup: {
    display: 'flex',
    gap: '8px',
  },
  conditionToggle: {
    flex: 1,
    padding: '11px 8px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1.5px solid',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
  quickPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  quickPill: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '3px 9px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    border: '1px solid #e2e8f0',
  },
  uploadDropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #00a49f',
    backgroundColor: '#f0fdfa',
    borderRadius: '16px',
    padding: '36px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadPrimaryText: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#002f34',
    marginTop: '8px',
  },
  uploadSubtext: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  previewImageContainer: {
    position: 'relative',
    width: '100%',
    height: '240px',
    borderRadius: '14px',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  removeImgBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    fontWeight: '800',
    marginTop: '10px',
  },
  previewCol: {
    position: 'sticky',
    top: '100px',
  },
  liveCardWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#00a49f',
    letterSpacing: '0.8px',
  },
  mockImgWrap: {
    position: 'relative',
    width: '100%',
    height: '190px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  mockImgPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  sellerTipBox: {
    backgroundColor: '#fffbeb',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #fef3c7',
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
    borderRadius: '18px',
    padding: '24px',
    maxWidth: '380px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
}
