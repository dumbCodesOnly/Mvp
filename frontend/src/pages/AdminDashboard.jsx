import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FaUsers, FaServer, FaWallet, FaDollarSign, FaBolt, FaClock, FaArrowRight } from 'react-icons/fa'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load admin stats')
      console.error('Admin stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchStats} className="mt-4 btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FaUsers}
          label="Total Users"
          value={stats?.users?.total || 0}
          color="purple"
        />
        <StatCard
          icon={FaServer}
          label="Total Miners"
          value={stats?.miners?.total || 0}
          color="blue"
        />
        <StatCard
          icon={FaWallet}
          label="Active Rentals"
          value={stats?.rentals?.active || 0}
          subtext={`${stats?.rentals?.total || 0} total`}
          color="cyan"
        />
        <StatCard
          icon={FaDollarSign}
          label="Total Revenue"
          value={`$${(stats?.revenue?.total_usd || 0).toLocaleString()}`}
          subtext={`${stats?.revenue?.pending_payments || 0} pending`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FaBolt}
          label="Active Hashrate"
          value={`${(stats?.hashrate?.total_active_th || 0).toFixed(2)} TH/s`}
          color="yellow"
        />
        <StatCard
          icon={FaDollarSign}
          label="Referral Commissions"
          value={`$${(stats?.revenue?.referral_commissions || 0).toLocaleString()}`}
          color="pink"
        />
        <StatCard
          icon={FaClock}
          label="Total Rentals"
          value={stats?.rentals?.total || 0}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <Link to="/admin/users" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.users?.recent?.length > 0 ? (
              stats.users.recent.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${user.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No users yet</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Rentals</h2>
            <Link to="/admin/users" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.rentals?.recent?.length > 0 ? (
              stats.rentals.recent.map((rental) => (
                <div key={rental.id} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                  <div>
                    <p className="font-medium">{rental.miner_name}</p>
                    <p className="text-xs text-gray-400">
                      {rental.hashrate_allocated} TH/s - {rental.duration_days} days
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${rental.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {rental.is_active ? 'Active' : 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No rentals yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/miners" className="p-4 bg-dark-hover rounded-lg hover:bg-opacity-70 transition group">
            <FaServer className="text-2xl text-purple-400 mb-2" />
            <h3 className="font-semibold">Manage Miners</h3>
            <p className="text-sm text-gray-400">Add, edit, or remove mining hardware</p>
          </Link>
          <Link to="/admin/users" className="p-4 bg-dark-hover rounded-lg hover:bg-opacity-70 transition group">
            <FaUsers className="text-2xl text-blue-400 mb-2" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-gray-400">View user details and manage accounts</p>
          </Link>
          <button onClick={fetchStats} className="p-4 bg-dark-hover rounded-lg hover:bg-opacity-70 transition group text-left">
            <FaClock className="text-2xl text-cyan-400 mb-2" />
            <h3 className="font-semibold">Refresh Stats</h3>
            <p className="text-sm text-gray-400">Update dashboard with latest data</p>
          </button>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    pink: 'from-pink-500 to-pink-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="text-xl text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  )
}

export default AdminDashboard
