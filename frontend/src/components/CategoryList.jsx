import { motion } from 'framer-motion'

export default function CategoryList({ categories, selected }) {
  return (
    <div style={styles.wrap}>
      <h3 style={styles.title}>Categories</h3>
      <ul style={styles.list}>
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <a
            href="/products"
            style={{ ...styles.link, ...(selected === null ? styles.active : {}) }}
          >
            All Categories
          </a>
        </motion.li>
        {categories?.map((cat, index) => (
          <motion.li
            key={cat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <a
              href={`/categories/${cat.slug}`}
              style={{ ...styles.link, ...(selected === cat.slug ? styles.active : {}) }}
            >
              {cat.category_name}
              <span style={styles.count}>({cat.total_products})</span>
            </a>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

const styles = {
  wrap: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#1a1a2e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  list: {
    listStyle: 'none',
  },
  link: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#1a1a2e',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  active: {
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    color: '#e94560',
  },
  count: {
    color: '#666',
    fontSize: '12px',
  },
}
