import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productsAPI, categoriesAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import CategoryList from '../components/CategoryList'

export default function ProductList() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')

  useEffect(() => {
    categoriesAPI.getAll().then((res) => {
      setCategories(res.data.results || res.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (slug) params.category = slug
    if (search) params.search = search
    if (location) params.location = location

    productsAPI.getAll(params).then((res) => {
      setProducts(res.data.results || res.data)
      setCount(res.data.count || res.data.length)
    }).finally(() => setLoading(false))
  }, [slug, search, location])

  return (
    <div className="container" style={styles.page}>
      <div style={styles.layout}>
        <motion.aside
          style={styles.sidebar}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CategoryList categories={categories} selected={slug} />
        </motion.aside>
        <div style={styles.main}>
          <motion.div
            style={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 style={styles.title}>
              {slug ? `Category: ${slug}` : 'All Ads'}
              {location && <span style={styles.locationTag}>📍 {location}</span>}
            </h2>
            <div style={styles.searchRow}>
              <input
                className="form-control"
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <input
                className="form-control"
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </motion.div>
          <p style={styles.count}>{count} ads found</p>
          {loading ? (
            <div className="loading-spinner"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">&#128269;</div>
              <p className="empty-state-text">No ads found.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { paddingTop: '28px', paddingBottom: '48px' },
  layout: { display: 'flex', gap: '28px' },
  sidebar: { width: '260px', flexShrink: 0 },
  main: { flex: 1 },
  header: { marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' },
  locationTag: { fontSize: '14px', fontWeight: 400, color: '#666', marginLeft: '12px' },
  searchRow: { display: 'flex', gap: '12px' },
  searchInput: { padding: '12px 16px' },
  count: { fontSize: '14px', color: '#666', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
}
