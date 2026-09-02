import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import Messages from './pages/Messages'
import Wishlist from './pages/Wishlist'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="products/:slug/edit" element={
              <ProtectedRoute><EditListing /></ProtectedRoute>
            } />
            <Route path="categories/:slug" element={<ProductList />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="sell" element={
              <ProtectedRoute><CreateListing /></ProtectedRoute>
            } />
            <Route path="my-listings" element={
              <ProtectedRoute><MyListings /></ProtectedRoute>
            } />
            <Route path="messages" element={
              <ProtectedRoute><Messages /></ProtectedRoute>
            } />
            <Route path="messages/:conversationId" element={
              <ProtectedRoute><Messages /></ProtectedRoute>
            } />
            <Route path="wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
