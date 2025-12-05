import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaChartLine, FaServer, FaUsers, FaGift, FaCog, FaWallet } from 'react-icons/fa'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FaChartLine, requiresAuth: false },
    { path: '/miners', label: 'Miners', icon: FaServer, requiresAuth: false },
    { path: '/rentals', label: 'My Rentals', icon: FaWallet, requiresAuth: true },
    { path: '/referrals', label: 'Referrals', icon: FaGift, requiresAuth: true },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <aside className="hidden lg:block w-64 bg-dark-card border-r border-gray-800 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-3">Navigation</p>
        </div>
        
        {navItems.map((item) => {
          if (item.requiresAuth && !user) return null
          
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <Icon className="text-lg" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {user && (
          <>
            <div className="border-t border-gray-800 my-4"></div>
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-3">Account</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Referral Code</p>
              <p className="font-mono text-purple-400 text-sm">{user.referral_code || 'Loading...'}</p>
            </div>
          </>
        )}

        <div className="border-t border-gray-800 my-4"></div>
        
        <div className="glass-card p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-sm mb-2">Need Help?</h4>
          <p className="text-xs text-gray-400 mb-3">
            Contact our 24/7 support team for assistance.
          </p>
          <a
            href="#"
            className="text-xs text-purple-400 hover:text-purple-300 transition"
          >
            Get Support &rarr;
          </a>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
