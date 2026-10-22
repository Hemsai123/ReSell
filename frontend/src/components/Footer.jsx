import { Link } from 'react-router-dom'
import { FiShield, FiHeart, FiPhone, FiMail, FiZap, FiMessageSquare } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer style={styles.footer}>
      {/* Safety assurance banner */}
      <div style={styles.trustBanner}>
        <div className="container" style={styles.trustInner}>
          <div style={styles.trustItem}>
            <div style={styles.trustIcon}>
              <FiShield style={{ fontSize: '20px', color: '#00a49f' }} />
            </div>
            <div>
              <h4 style={styles.trustTitle}>100% Safe &amp; Verified</h4>
              <p style={styles.trustDesc}>Trusted community of direct buyers and verified local sellers</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <div style={styles.trustIcon}>
              <FiZap style={{ fontSize: '20px', color: '#ff5630' }} />
            </div>
            <div>
              <h4 style={styles.trustTitle}>Sell in 60 Seconds</h4>
              <p style={styles.trustDesc}>Free ad posting with instant visibility to thousands of buyers</p>
            </div>
          </div>
          <div style={styles.trustItem}>
            <div style={styles.trustIcon}>
              <FiMessageSquare style={{ fontSize: '20px', color: '#00a49f' }} />
            </div>
            <div>
              <h4 style={styles.trustTitle}>Direct Chat &amp; Deals</h4>
              <p style={styles.trustDesc}>Negotiate safely through in-app instant messaging</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container" style={styles.mainFooter}>
        <div style={styles.columnsGrid}>
          {/* Brand info */}
          <div style={styles.col}>
            <div style={styles.logoRow}>
              <span style={styles.logoBadge}>
                <FiZap style={{ fontSize: '15px' }} />
              </span>
              <span style={styles.brandTitle}>ReSell</span>
            </div>
            <p style={styles.brandDesc}>
              India&apos;s most loved classifieds platform. Connecting local buyers and sellers for seamless, zero-brokerage deals on electronics, vehicles, furniture, phones, and much more.
            </p>
            <div style={styles.contactRow}>
              <FiMail style={{ color: '#00a49f' }} />
              <span>support@resell-india.com</span>
            </div>
          </div>

          {/* Popular Locations */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Popular Locations</h4>
            <ul style={styles.linkList}>
              <li><Link to="/products?location=Mumbai" style={styles.link}>Mumbai Ads</Link></li>
              <li><Link to="/products?location=Delhi" style={styles.link}>Delhi / NCR Ads</Link></li>
              <li><Link to="/products?location=Bangalore" style={styles.link}>Bangalore Tech Hub</Link></li>
              <li><Link to="/products?location=Hyderabad" style={styles.link}>Hyderabad Deals</Link></li>
              <li><Link to="/products?location=Pune" style={styles.link}>Pune Classifieds</Link></li>
            </ul>
          </div>

          {/* Trending Categories */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Trending Categories</h4>
            <ul style={styles.linkList}>
              <li><Link to="/categories/mobile-phones" style={styles.link}>Mobile Phones &amp; Accessories</Link></li>
              <li><Link to="/categories/electronics" style={styles.link}>Laptops &amp; Gadgets</Link></li>
              <li><Link to="/categories/cars-vehicles" style={styles.link}>Cars &amp; Motorbikes</Link></li>
              <li><Link to="/categories/furniture-decor" style={styles.link}>Home Furniture &amp; Decor</Link></li>
              <li><Link to="/categories/fashion-beauty" style={styles.link}>Fashion &amp; Streetwear</Link></li>
            </ul>
          </div>

          {/* Quick Links & Safety */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Help &amp; Community</h4>
            <ul style={styles.linkList}>
              <li><Link to="/sell" style={styles.linkHighlight}>+ Post a Free Ad</Link></li>
              <li><Link to="/products" style={styles.link}>Explore All Products</Link></li>
              <li><a href="#safety" style={styles.link}>Safety &amp; Fraud Prevention</a></li>
              <li><a href="#terms" style={styles.link}>Terms &amp; Conditions</a></li>
              <li><a href="#privacy" style={styles.link}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.bottomBar}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} ReSell Technologies Pvt Ltd. All rights reserved. Made with <FiHeart style={{ color: '#ff5630', verticalAlign: 'middle' }} /> in India.
          </p>
          <div style={styles.badges}>
            <span style={styles.safeTag}><FiShield /> 100% SECURE TRANSACTIONS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    backgroundColor: '#002f34',
    color: '#e2e8f0',
    marginTop: 'auto',
  },
  trustBanner: {
    backgroundColor: '#002226',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '36px 0',
  },
  trustInner: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '28px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  trustIcon: {
    fontSize: '32px',
    backgroundColor: 'rgba(0, 164, 159, 0.15)',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trustTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '3px',
  },
  trustDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  mainFooter: {
    paddingTop: '50px',
    paddingBottom: '30px',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '36px',
    marginBottom: '40px',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  logoBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #00a49f 0%, #ff5630 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '17px',
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  brandDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#cbd5e1',
    fontWeight: '500',
  },
  colTitle: {
    fontSize: '14.5px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '18px',
  },
  linkList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    color: '#94a3b8',
    fontSize: '13.5px',
    transition: 'color 0.2s',
  },
  linkHighlight: {
    color: '#ff7a45',
    fontWeight: '700',
    fontSize: '13.5px',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  copyright: {
    fontSize: '12.5px',
    color: '#94a3b8',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  safeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#5eead4',
    letterSpacing: '0.4px',
  },
}
