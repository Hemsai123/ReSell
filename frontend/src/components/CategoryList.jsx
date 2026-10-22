import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FiGrid, FiChevronRight, FiCpu, FiSmartphone, FiTruck, 
  FiHome, FiShoppingBag, FiActivity, FiBookOpen, FiCompass, FiLayers
} from 'react-icons/fi'

const CATEGORY_ICONS = {
  'electronics': FiCpu,
  'mobile-phones': FiSmartphone,
  'cars-vehicles': FiTruck,
  'furniture-decor': FiHome,
  'fashion-beauty': FiShoppingBag,
  'sports-hobbies': FiActivity,
  'books-learning': FiBookOpen,
  'bicycles': FiCompass,
}

export default function CategoryList({ categories, selected }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <FiGrid style={{ fontSize: '18px', color: '#00a49f' }} />
        <h3 style={styles.title}>All Categories</h3>
      </div>

      <ul style={styles.list}>
        <motion.li
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            to="/products"
            style={{
              ...styles.link,
              ...(selected === null || selected === undefined ? styles.active : {}),
            }}
          >
            <div style={styles.left}>
              <span style={styles.icon}>
                <FiLayers style={{ fontSize: '15px' }} />
              </span>
              <span style={styles.catName}>All Categories</span>
            </div>
            <FiChevronRight style={styles.arrow} />
          </Link>
        </motion.li>

        {categories?.map((cat, index) => {
          const isActive = selected === cat.slug
          const IconComp = CATEGORY_ICONS[cat.slug] || FiGrid

          return (
            <motion.li
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 + index * 0.025 }}
            >
              <Link
                to={`/categories/${cat.slug}`}
                style={{
                  ...styles.link,
                  ...(isActive ? styles.active : {}),
                }}
              >
                <div style={styles.left}>
                  <span style={{ ...styles.icon, color: isActive ? '#00a49f' : '#64748b' }}>
                    <IconComp style={{ fontSize: '15px' }} />
                  </span>
                  <span style={styles.catName}>{cat.category_name}</span>
                </div>
                <div style={styles.right}>
                  {cat.total_products !== undefined && (
                    <span
                      style={{
                        ...styles.count,
                        backgroundColor: isActive ? 'rgba(0, 164, 159, 0.15)' : '#f1f5f9',
                        color: isActive ? '#00a49f' : '#64748b',
                      }}
                    >
                      {cat.total_products}
                    </span>
                  )}
                  <FiChevronRight style={styles.arrow} />
                </div>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

const styles = {
  wrap: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1.5px solid #f1f5f9',
  },
  title: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#002f34',
    letterSpacing: '0.2px',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: 0,
    margin: 0,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    fontSize: '13.5px',
    color: '#334155',
    fontWeight: '600',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  active: {
    backgroundColor: '#f0fdfa',
    color: '#00a49f',
    fontWeight: '700',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
  catName: {
    letterSpacing: '0.1px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  count: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '999px',
  },
  arrow: {
    fontSize: '14px',
    color: '#94a3b8',
  },
}
