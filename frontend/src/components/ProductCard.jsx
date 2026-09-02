import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Link to={`/products/${product.slug}`} className="card" style={styles.card}>
        <div style={styles.imageWrap}>
          <motion.img
            src={product.image_url || 'https://via.placeholder.com/220x180?text=No+Image'}
            alt={product.name}
            style={styles.image}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div style={styles.info}>
          <h3 style={styles.name}>{product.name}</h3>
          <p style={styles.price}>Rs {product.price}</p>
          <p style={styles.meta}>
            {product.category?.category_name} &middot; {product.condition}
          </p>
          <p style={styles.date}>{new Date(product.created).toLocaleDateString()}</p>
        </div>
      </Link>
    </motion.div>
  )
}

const styles = {
  card: {
    overflow: 'hidden',
    display: 'block',
    border: 'none',
  },
  imageWrap: {
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    padding: '16px',
  },
  name: {
    fontSize: '15px',
    fontWeight: 500,
    marginBottom: '6px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#1a1a2e',
  },
  price: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#e94560',
    marginBottom: '4px',
  },
  meta: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '4px',
  },
  date: {
    fontSize: '11px',
    color: '#adb5bd',
  },
}
