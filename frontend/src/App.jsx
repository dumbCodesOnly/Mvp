import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Miners from './pages/Miners'
import MyRentals from './pages/MyRentals'
import Referrals from './pages/Referrals'
import Checkout from './pages/Checkout'
import Payments from './pages/Payments'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AdminMiners from './pages/AdminMiners'
import AdminUsers from './pages/AdminUsers'
import AdminSettings from './pages/AdminSettings'
import AdminDatabase from './pages/AdminDatabase'
import Account from './pages/Account'

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="miners" element={<Miners />} />
              <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="rentals" element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="account" element={<Account />} />
              <Route path="admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/miners" element={<ProtectedRoute requireAdmin><AdminMiners /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
              <Route path="admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
              <Route path="admin/database" element={<ProtectedRoute requireAdmin><AdminDatabase /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
