export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.links}>
          <a href="#" style={styles.link}>Help</a>
          <a href="#" style={styles.link}>About</a>
          <a href="#" style={styles.link}>Privacy</a>
          <a href="#" style={styles.link}>Terms</a>
        </div>
        <p style={styles.copy}>&copy; 2026 OLX Clone. All rights reserved.</p>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    backgroundColor: '#002f34',
    color: '#fff',
    padding: '24px 0',
    marginTop: '48px',
  },
  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  links: {
    display: 'flex',
    gap: '24px',
  },
  link: {
    color: '#fff',
    fontSize: '13px',
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  copy: {
    fontSize: '13px',
    opacity: 0.6,
  },
}
