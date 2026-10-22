import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiCheck, FiSave, FiTag } from 'react-icons/fi'
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api'

export default function EditListing() {
  const { slug } = useParams()
  const navigate = useNavigate()

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
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsAPI.getById(slug),
      categoriesAPI.getAll(),
      brandsAPI.getAll(),
    ])
      .then(([pRes, cRes, bRes]) => {
        const p = pRes.data
        setForm({
          name: p.name || '',
          description: p.description || '',
          condition: p.condition || 'Used',
          category: p.category?.id || '',
          brand: p.brand?.id || '',
          price: p.price || '',
          quantity: p.quantity || '1',
          location: p.location || '',
        })
        setCategories(cRes.data.results || cRes.data)
        setBrands(bRes.data.results || bRes.data)
      })
      .catch((err) => {
        console.error(err)
        navigate('/my-listings')
      })
      .finally(() => setInitialLoading(false))
  }, [slug, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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

      const matched = categories.find(c => c.category_name.toLowerCase() === trimmedCat.toLowerCase())
      if (matched) {
        resolvedCategory = matched.id
      } else {
        try {
          const res = await categoriesAPI.create({ category_name: trimmedCat })
          resolvedCategory = res.data.id
          setCategories(prev => [...prev, res.data])
        } catch (catErr) {
          console.warn('Category creation fallback:', catErr)
        }
      }
    }

    const payload = {
      name: form.name,
      description: form.description,
      condition: form.condition,
      price: form.price,
      quantity: form.quantity || 1,
      category: (resolvedCategory && resolvedCategory !== 'other') ? resolvedCategory : null,
      brand: form.brand || null,
      location: form.location,
    }
    if (customCategory.trim()) {
      payload.other_category = customCategory.trim()
    }

    try {
      await productsAPI.update(slug, payload)
      navigate(`/products/${slug}`)
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data)
      } else {
        alert('Failed to update listing.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading ad data...</p>
      </div>
    )
  }

  return (
    <div className="container" style={styles.page}>
      <div style={styles.header}>
        <Link to={`/products/${slug}`} style={styles.backBtn}>
          <FiArrowLeft /> Back to Listing
        </Link>
        <h1 style={styles.title}>Edit Your Listing</h1>
        <p style={styles.subtitle}>Update the details below and save your changes</p>
      </div>

      <motion.div
        style={styles.card}
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
              className="form-control"
              required
            />
            {errors.name && <p className="error-message">{errors.name[0]}</p>}
          </div>

          {/* Category & Brand */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Category *</label>
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
              <label>Brand (Optional)</label>
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

          {/* Price & Condition */}
          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="form-control"
                required
              />
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
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="form-control"
              required
            />
            {errors.location && <p className="error-message">{errors.location[0]}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="form-control"
              required
            />
            {errors.description && <p className="error-message">{errors.description[0]}</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 800 }}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiSave style={{ fontSize: '17px' }} />
            <span>{loading ? 'Saving Changes...' : 'Save and Update Listing'}</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

const styles = {
  page: {
    paddingTop: '28px',
    paddingBottom: '80px',
    maxWidth: '720px',
  },
  header: {
    marginBottom: '24px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#00a49f',
    marginBottom: '8px',
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
  card: {
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
}
