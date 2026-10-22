import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    // Scroll immediately to the top of the page on route/search changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname, search])

  return null
}

