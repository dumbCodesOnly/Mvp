import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Miners from './pages/Miners'
import MyRentals from './pages/MyRentals'
import Referrals from './pages/Referrals'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="miners" element={<Miners />} />
            <Route path="rentals" element={<MyRentals />} />
            <Route path="referrals" element={<Referrals />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
