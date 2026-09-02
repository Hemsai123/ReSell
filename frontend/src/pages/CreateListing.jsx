import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api'

export default function CreateListing() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    condition: 'New',
    category: '',
    brand: '',
    price: '',
    quantity: '1',
    location: '',
    image: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showNewBrand, setShowNewBrand] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')

  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.results || res.data))
    brandsAPI.getAll().then((res) => setBrands(res.data.results || res.data))
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setForm({ ...form, [name]: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      const res = await categoriesAPI.create({ category_name: newCategoryName.trim() })
      const newCat = res.data
      setCategories([...categories, newCat])
      setForm({ ...form, category: newCat.id })
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (err) {
      alert('Failed to create category')
    }
  }

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return
    try {
      const res = await brandsAPI.create({ brand_name: newBrandName.trim() })
      const newBrand = res.data
      setBrands([...brands, newBrand])
      setForm({ ...form, brand: newBrand.id })
      setNewBrandName('')
      setShowNewBrand(false)
    } catch (err) {
      alert('Failed to create brand')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })

    try {
      const res = await productsAPI.create(formData)
      navigate(`/products/${res.data.slug}`)
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={styles.page}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          style={styles.title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Post Your Ad
        </motion.h2>
        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label>Title</label>
            <input className="form-control" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter product title" required />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </motion.div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label>Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe your product" required />
            {errors.description && <p className="error-message">{errors.description}</p>}
          </motion.div>
          <div style={styles.row}>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label>Condition</label>
              <select className="form-control" name="condition" value={form.condition} onChange={handleChange}>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </motion.div>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <label>Category</label>
              {!showNewCategory ? (
                <div style={styles.selectRow}>
                  <select className="form-control" name="category" value={form.category} onChange={handleChange} required style={{ flex: 1 }}>
                    <option value="">Select category</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.category_name}</option>))}
                  </select>
                  <button type="button" onClick={() => setShowNewCategory(true)} style={styles.addBtn}>+ New</button>
                </div>
              ) : (
                <div style={styles.selectRow}>
                  <input className="form-control" type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" style={{ flex: 1 }} />
                  <button type="button" onClick={handleAddCategory} style={styles.addBtnConfirm}>Add</button>
                  <button type="button" onClick={() => setShowNewCategory(false)} style={styles.addBtnCancel}>✕</button>
                </div>
              )}
              {errors.category && <p className="error-message">{errors.category}</p>}
            </motion.div>
          </div>
          <div style={styles.row}>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label>Brand</label>
              {!showNewBrand ? (
                <div style={styles.selectRow}>
                  <select className="form-control" name="brand" value={form.brand} onChange={handleChange} style={{ flex: 1 }}>
                    <option value="">Select brand</option>
                    {brands.map((b) => (<option key={b.id} value={b.id}>{b.brand_name}</option>))}
                  </select>
                  <button type="button" onClick={() => setShowNewBrand(true)} style={styles.addBtn}>+ New</button>
                </div>
              ) : (
                <div style={styles.selectRow}>
                  <input className="form-control" type="text" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="New brand name" style={{ flex: 1 }} />
                  <button type="button" onClick={handleAddBrand} style={styles.addBtnConfirm}>Add</button>
                  <button type="button" onClick={() => setShowNewBrand(false)} style={styles.addBtnCancel}>✕</button>
                </div>
              )}
            </motion.div>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label>Price (Rs)</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} placeholder="0" min="0" step="1" required />
              {errors.price && <p className="error-message">{errors.price}</p>}
            </motion.div>
          </div>
          <div style={styles.row}>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label>Quantity</label>
              <input className="form-control" type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" step="1" required />
            </motion.div>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <label>Location</label>
              <input className="form-control" type="text" name="location" value={form.location} onChange={handleChange} placeholder="Enter your city" />
            </motion.div>
          </div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label>Image</label>
            <input className="form-control" type="file" name="image" accept="image/*" onChange={handleChange} />
            {errors.image && <p className="error-message">{errors.image}</p>}
          </motion.div>
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={styles.btn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            {loading ? 'Posting...' : 'Post Ad'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

const styles = {
  page: { paddingTop: '32px', paddingBottom: '48px', maxWidth: '640px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { fontSize: '26px', fontWeight: 700, marginBottom: '28px', color: '#1a1a2e' },
  row: { display: 'flex', gap: '16px' },
  selectRow: { display: 'flex', gap: '8px' },
  addBtn: { backgroundColor: '#e94560', color: '#fff', padding: '0 14px', borderRadius: '4px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' },
  addBtnConfirm: { backgroundColor: '#4caf50', color: '#fff', padding: '0 14px', borderRadius: '4px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' },
  addBtnCancel: { backgroundColor: '#f44336', color: '#fff', padding: '0 14px', borderRadius: '4px', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' },
  btn: { width: '100%', padding: '14px', fontSize: '15px', marginTop: '12px' },
}
