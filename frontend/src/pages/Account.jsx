import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaUser, FaSignOutAlt, FaCreditCard, FaCog, FaShieldAlt } from 'react-icons/fa'

const Account = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-dark-card rounded-full flex items-center justify-center mb-6">
          <FaUser className="text-4xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to CloudMiner</h2>
        <p className="text-gray-400 text-center mb-8">Sign in to access your account and start mining</p>
        
        <div className="w-full max-w-xs space-y-3">
          <Link
            to="/login"
            className="block w-full bg-gradient-primary text-white text-center py-4 rounded-xl font-semibold text-lg transition hover:opacity-90"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="block w-full bg-dark-card border border-gray-700 text-white text-center py-4 rounded-xl font-semibold text-lg transition hover:bg-gray-800"
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 md:pb-0">
      <div className="bg-dark-card rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <FaUser className="text-2xl text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.username || 'User'}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          to="/payments"
          className="flex items-center justify-between bg-dark-card rounded-xl p-4 hover:bg-gray-800 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <FaCreditCard className="text-blue-400" />
            </div>
            <span className="text-white font-medium">Payment History</span>
          </div>
          <span className="text-gray-500">&rarr;</span>
        </Link>

        {user.is_admin && (
          <Link
            to="/admin"
            className="flex items-center justify-between bg-dark-card rounded-xl p-4 hover:bg-gray-800 transition"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-purple-400" />
              </div>
              <span className="text-white font-medium">Admin Dashboard</span>
            </div>
            <span className="text-gray-500">&rarr;</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full bg-dark-card rounded-xl p-4 hover:bg-gray-800 transition"
        >
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
              <FaSignOutAlt className="text-red-400" />
            </div>
            <span className="text-white font-medium">Sign Out</span>
          </div>
          <span className="text-gray-500">&rarr;</span>
        </button>
      </div>
    </div>
  )
}

export default Account
