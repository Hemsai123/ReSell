import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, FiMapPin, FiFilter, FiX, FiGrid, FiList, 
  FiRotateCcw, FiCheck, FiSliders, FiDollarSign 
} from 'react-icons/fi'
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import CategoryList from '../components/CategoryList'

export default function ProductList() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created')
  const [isGridView, setIsGridView] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Initial categories and brands
  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.results || res.data))
    brandsAPI.getAll().then((res) => setBrands(res.data.results || res.data))
  }, [])

  // Sync URL search params
  useEffect(() => {
    const qSearch = searchParams.get('search') || searchParams.get('q') || ''
    const qLoc = searchParams.get('location') || ''
    const qCond = searchParams.get('condition') || 'all'
    const qMin = searchParams.get('min_price') || ''
    const qMax = searchParams.get('max_price') || ''
    const qOrder = searchParams.get('ordering') || '-created'

    setSearch(qSearch)
    setLocation(qLoc)
    setCondition(qCond)
    setMinPrice(qMin)
    setMaxPrice(qMax)
    setOrdering(qOrder)
  }, [searchParams])

  // Fetch products
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (slug) params.category = slug
    if (search.trim()) params.search = search.trim()
    if (location.trim()) params.location = location.trim()
    if (condition && condition !== 'all') params.condition = condition
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (ordering) params.ordering = ordering

    productsAPI.getAll(params)
      .then((res) => {
        setProducts(res.data.results || res.data)
        setCount(res.data.count !== undefined ? res.data.count : (res.data.results || res.data).length)
      })
      .catch((err) => console.error('Failed to load listings:', err))
      .finally(() => setLoading(false))
  }, [slug, search, location, condition, minPrice, maxPrice, ordering])

  const applyFilters = () => {
    const newParams = new URLSearchParams()
    if (search.trim()) newParams.set('search', search.trim())
    if (location.trim()) newParams.set('location', location.trim())
    if (condition !== 'all') newParams.set('condition', condition)
    if (minPrice) newParams.set('min_price', minPrice)
    if (maxPrice) newParams.set('max_price', maxPrice)
    if (ordering) newParams.set('ordering', ordering)

    setSearchParams(newParams)
    setShowMobileFilters(false)
  }

  const handleResetFilters = () => {
    setSearch('')
    setLocation('')
    setCondition('all')
    setMinPrice('')
    setMaxPrice('')
    setOrdering('-created')
    setSearchParams(new URLSearchParams())
    if (slug) {
      navigate('/products')
    }
  }

  const handleRemoveFilter = (filterKey) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(filterKey)
    if (filterKey === 'search') setSearch('')
    if (filterKey === 'location') setLocation('')
    if (filterKey === 'condition') setCondition('all')
    if (filterKey === 'min_price') setMinPrice('')
    if (filterKey === 'max_price') setMaxPrice('')
    setSearchParams(newParams)
  }

  const activeCategory = categories.find(c => c.slug === slug)

  return (
    <div className="container" style={styles.page}>
      {/* Header bar */}
      <motion.div
        style={styles.headerBar}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 style={styles.pageTitle}>
            {activeCategory ? activeCategory.category_name : 'Explore All Ads'}
          </h1>
          <p style={styles.resultCountText}>
            Showing <strong style={{ color: '#00a49f' }}>{count}</strong> verified listings across India
          </p>
        </div>

        {/* View toggle and Mobile Filter Button */}
        <div style={styles.headerRight}>
          <button
            style={styles.mobileFilterToggle}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            type="button"
          >
            <FiSliders /> Filters
          </button>

          <div style={styles.sortWrap}>
            <label style={styles.sortLabel}>Sort By:</label>
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value)
                const newP = new URLSearchParams(searchParams)
                newP.set('ordering', e.target.value)
                setSearchParams(newP)
              }}
              style={styles.sortSelect}
            >
              <option value="-created">Newest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Title (A-Z)</option>
            </select>
          </div>

          <div style={styles.viewToggleGroup}>
            <button
              style={{
                ...styles.viewBtn,
                backgroundColor: isGridView ? '#002f34' : '#fff',
                color: isGridView ? '#fff' : '#64748b',
              }}
              onClick={() => setIsGridView(true)}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              style={{
                ...styles.viewBtn,
                backgroundColor: !isGridView ? '#002f34' : '#fff',
                color: !isGridView ? '#fff' : '#64748b',
              }}
              onClick={() => setIsGridView(false)}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Active filters pill bar */}
      {(search || location || (condition && condition !== 'all') || minPrice || maxPrice || slug) && (
        <motion.div
          style={styles.activePillsBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span style={styles.activeFiltersLabel}>Active Filters:</span>
          {slug && (
            <span style={styles.filterPill}>
              Category: {activeCategory?.category_name || slug}
              <FiX style={{ cursor: 'pointer' }} onClick={() => navigate('/products')} />
            </span>
          )}
          {search && (
            <span style={styles.filterPill}>
              Keyword: &quot;{search}&quot;
              <FiX style={{ cursor: 'pointer' }} onClick={() => handleRemoveFilter('search')} />
            </span>
          )}
          {location && (
            <span style={styles.filterPill}>
              <FiMapPin style={{ marginRight: '4px', color: '#00a49f' }} /> {location}
              <FiX style={{ cursor: 'pointer' }} onClick={() => handleRemoveFilter('location')} />
            </span>
          )}
          {condition !== 'all' && (
            <span style={styles.filterPill}>
              Condition: {condition}
              <FiX style={{ cursor: 'pointer' }} onClick={() => handleRemoveFilter('condition')} />
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span style={styles.filterPill}>
              Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
              <FiX style={{ cursor: 'pointer' }} onClick={() => { handleRemoveFilter('min_price'); handleRemoveFilter('max_price') }} />
            </span>
          )}
          <button onClick={handleResetFilters} style={styles.clearAllBtn} type="button">
            <FiRotateCcw style={{ fontSize: '11px' }} /> Clear All
          </button>
        </motion.div>
      )}

      {/* Main Layout Grid */}
      <div style={styles.layout}>
        {/* SIDEBAR FILTERS */}
        <aside style={styles.sidebar}>
          {/* Quick Category List */}
          <CategoryList categories={categories} selected={slug} />

          {/* Filter Card */}
          <div style={styles.filterCard}>
            <div style={styles.filterHeader}>
              <FiSliders style={{ color: '#00a49f' }} />
              <h3 style={styles.filterCardTitle}>Filter Results</h3>
            </div>

            {/* Keyword Search */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search Keyword</label>
              <div style={styles.sidebarInputWrap}>
                <FiSearch style={styles.sidebarInputIcon} />
                <input
                  type="text"
                  placeholder="e.g. iPhone, Dell, Honda..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  style={styles.sidebarInput}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Location</label>
              <div style={styles.sidebarInputWrap}>
                <FiMapPin style={styles.sidebarInputIcon} />
                <input
                  type="text"
                  placeholder="City or state..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  style={styles.sidebarInput}
                />
              </div>
            </div>

            {/* Condition Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Condition</label>
              <div style={styles.conditionRadioGroup}>
                {['all', 'New', 'Used'].map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    style={{
                      ...styles.conditionBtn,
                      backgroundColor: condition === cond ? '#002f34' : '#f8fafc',
                      color: condition === cond ? '#fff' : '#475569',
                      borderColor: condition === cond ? '#002f34' : '#e2e8f0',
                    }}
                    onClick={() => setCondition(cond)}
                  >
                    {cond === 'all' ? 'All' : cond === 'New' ? 'Brand New' : 'Used'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Price Range (₹)</label>
              <div style={styles.priceRow}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={styles.priceInput}
                />
                <span style={{ color: '#94a3b8' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={styles.priceInput}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={styles.filterActions}>
              <motion.button
                onClick={applyFilters}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 14px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
              >
                Apply Filters
              </motion.button>
              <button
                onClick={handleResetFilters}
                style={styles.resetSidebarBtn}
                title="Reset"
                type="button"
              >
                <FiRotateCcw />
              </button>
            </div>
          </div>
        </aside>

        {/* LISTINGS CONTENT */}
        <main style={styles.mainContent}>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                Loading ads...
              </p>
            </div>
          ) : products.length === 0 ? (
            <motion.div
              style={styles.emptyWrap}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FiSearch style={{ fontSize: '48px', color: '#94a3b8', marginBottom: '16px' }} />
              <h3 style={styles.emptyTitle}>No matching listings found</h3>
              <p style={styles.emptyDesc}>
                Try adjusting your search terms, changing the location, or widening your price filters.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={handleResetFilters} className="btn btn-secondary">
                  Reset All Filters
                </button>
                <button onClick={() => navigate('/sell')} className="btn btn-primary">
                  + Post This Ad Yourself
                </button>
              </div>
            </motion.div>
          ) : isGridView ? (
            <div style={styles.grid}>
              <AnimatePresence>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div style={styles.listView}>
              <AnimatePresence>
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const styles = {
  page: {
    paddingTop: '32px',
    paddingBottom: '80px',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '-0.5px',
  },
  resultCountText: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  mobileFilterToggle: {
    display: 'none',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    border: '1.5px solid #e2e8f0',
    fontWeight: '700',
    fontSize: '13px',
    color: '#002f34',
  },
  sortWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  sortSelect: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
  },
  viewToggleGroup: {
    display: 'flex',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1.5px solid #e2e8f0',
  },
  viewBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  activePillsBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  activeFiltersLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    marginRight: '4px',
  },
  filterPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f0fdfa',
    color: '#00a49f',
    border: '1px solid rgba(0, 164, 159, 0.3)',
    borderRadius: '999px',
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: '700',
  },
  clearAllBtn: {
    marginLeft: 'auto',
    fontSize: '11.5px',
    fontWeight: '700',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  layout: {
    display: 'flex',
    gap: '28px',
    alignItems: 'flex-start',
  },
  sidebar: {
    width: '280px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px',
    paddingBottom: '10px',
    borderBottom: '1.5px solid #f1f5f9',
  },
  filterCardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#002f34',
  },
  filterGroup: {
    marginBottom: '18px',
  },
  filterLabel: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '8px',
  },
  sidebarInputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    padding: '0 10px',
    height: '40px',
  },
  sidebarInputIcon: {
    fontSize: '14px',
    color: '#94a3b8',
    marginRight: '8px',
  },
  sidebarInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: '#0f172a',
  },
  conditionRadioGroup: {
    display: 'flex',
    gap: '6px',
  },
  conditionBtn: {
    flex: 1,
    padding: '7px 4px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1.5px solid',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  priceInput: {
    flex: 1,
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '13px',
    backgroundColor: '#f8fafc',
    width: '100%',
  },
  filterActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
  },
  resetSidebarBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  listView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '70px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px dashed #cbd5e1',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#002f34',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '460px',
    lineHeight: '1.5',
  },
}
