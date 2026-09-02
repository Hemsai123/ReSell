import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api'

export default function EditListing() {
  const { slug } = useParams()
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
    quantity: '',
    location: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    productsAPI.getById(slug).then((res) => {
      const p = res.data
      setForm({
        name: p.name || '',
        description: p.description || '',
        condition: p.condition || 'New',
        category: p.category?.id || '',
        brand: p.brand?.id || '',
        price: p.price || '',
        quantity: p.quantity || '',
        location: p.location || '',
      })
    })
    categoriesAPI.getAll().then((res) => setCategories(res.data.results || res.data))
    brandsAPI.getAll().then((res) => setBrands(res.data.results || res.data))
  }, [slug])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await productsAPI.update(slug, form)
      navigate(`/products/${slug}`)
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
          Edit Listing
        </motion.h2>
        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label>Title</label>
            <input className="form-control" type="text" name="name" value={form.name} onChange={handleChange} required />
          </motion.div>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <label>Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows="4" required />
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
              <select className="form-control" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.category_name}</option>))}
              </select>
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
              <select className="form-control" name="brand" value={form.brand} onChange={handleChange}>
                <option value="">Select brand</option>
                {brands.map((b) => (<option key={b.id} value={b.id}>{b.brand_name}</option>))}
              </select>
            </motion.div>
            <motion.div
              className="form-group"
              style={{ flex: 1 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <label>Price (Rs)</label>
              <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} min="0" step="1" required />
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
              <input className="form-control" type="text" name="location" value={form.location} onChange={handleChange} placeholder="City" />
            </motion.div>
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={styles.btn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {loading ? 'Updating...' : 'Update Listing'}
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
  btn: { width: '100%', padding: '14px', fontSize: '15px', marginTop: '12px' },
}
