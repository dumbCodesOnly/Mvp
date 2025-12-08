import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaBitcoin, FaChartLine, FaServer, FaUsers, FaSignOutAlt, FaBars, FaTimes, FaGift } from 'react-icons/fa'
import { useState } from 'react'
import Footer from './Footer'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <nav className="bg-dark-card border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <FaBitcoin className="text-4xl text-yellow-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  CloudMiner
                </span>
              </Link>
              
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <FaChartLine /> Dashboard
                </Link>
                <Link to="/miners" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                  <FaServer /> Miners
                </Link>
                {user && (
                  <>
                    <Link to="/rentals" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                      <FaUsers /> My Rentals
                    </Link>
                    <Link to="/referrals" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                      <FaGift /> Referrals
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="hidden sm:block text-sm text-gray-400">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="bg-gradient-primary hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition">
                    Register
                  </Link>
                </>
              )}
              
              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
            </div>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-card border-t border-gray-800">
            <div className="px-4 py-3 space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaChartLine /> Dashboard
              </Link>
              <Link 
                to="/miners" 
                className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaServer /> Miners
              </Link>
              {user && (
                <>
                  <Link 
                    to="/rentals" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUsers /> My Rentals
                  </Link>
                  <Link 
                    to="/referrals" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaGift /> Referrals
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full lg:pl-4 px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
      <BottomTabs />
    </div>
  )
}

export default Layout
