import { useState, useEffect } from 'react'
import api from '../api/config'
import { FaDatabase, FaTrash, FaBroom, FaUsers, FaServer, FaWallet, FaCreditCard, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { useToast } from '../components/Toast'

const AdminDatabase = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/database/stats')
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load database stats')
      console.error('Database stats error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async (type) => {
    if (!window.confirm(`Are you sure you want to clean up ${type}? This action cannot be undone.`)) {
      return
    }

    setCleaning(true)
    try {
      const response = await api.post('/api/admin/database/cleanup', { type })
      showToast(`Cleanup completed: ${JSON.stringify(response.data.results)}`, 'success')
      fetchStats()
    } catch (err) {
      showToast('Failed to perform cleanup', 'error')
      console.error('Cleanup error:', err)
    } finally {
      setCleaning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
          <FaDatabase className="text-purple-400" />
          Database Management
        </h1>
        <button
          onClick={fetchStats}
          className="btn-secondary flex items-center gap-2"
        >
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={FaUsers}
          label="Users"
          total={stats?.users?.total || 0}
          details={[
            { label: 'Admins', value: stats?.users?.admins || 0 }
          ]}
          color="purple"
        />
        <StatCard
          icon={FaServer}
          label="Miners"
          total={stats?.miners?.total || 0}
          color="blue"
        />
        <StatCard
          icon={FaWallet}
          label="Rentals"
          total={stats?.rentals?.total || 0}
          details={[
            { label: 'Active', value: stats?.rentals?.active || 0, color: 'green' },
            { label: 'Inactive', value: stats?.rentals?.inactive || 0, color: 'gray' }
          ]}
          color="cyan"
        />
        <StatCard
          icon={FaCreditCard}
          label="Payments"
          total={stats?.payments?.total || 0}
          details={[
            { label: 'Pending', value: stats?.payments?.pending || 0, color: 'yellow' },
            { label: 'Confirmed', value: stats?.payments?.confirmed || 0, color: 'green' },
            { label: 'Failed', value: stats?.payments?.failed || 0, color: 'red' }
          ]}
          color="green"
        />
        <StatCard
          icon={FaUsers}
          label="Referrals"
          total={stats?.referrals?.total || 0}
          color="pink"
        />
        <StatCard
          icon={FaWallet}
          label="Payouts"
          total={stats?.payouts?.total || 0}
          details={[
            { label: 'Pending', value: stats?.payouts?.pending || 0, color: 'yellow' },
            { label: 'Paid', value: stats?.payouts?.paid || 0, color: 'green' }
          ]}
          color="yellow"
        />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaBroom className="text-yellow-400" />
          Database Cleanup
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CleanupButton
            title="Clean Failed Payments"
            description="Remove all failed payment records"
            icon={FaTrash}
            color="red"
            onClick={() => handleCleanup('failed_payments')}
            loading={cleaning}
          />
          <CleanupButton
            title="Clean Old Rentals"
            description="Remove inactive rentals older than 1 year"
            icon={FaBroom}
            color="yellow"
            onClick={() => handleCleanup('old_inactive_rentals')}
            loading={cleaning}
          />
          <CleanupButton
            title="Clean Orphan Payouts"
            description="Remove payouts with no associated user"
            icon={FaExclamationTriangle}
            color="orange"
            onClick={() => handleCleanup('orphan_payouts')}
            loading={cleaning}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-800">
          <button
            onClick={() => handleCleanup('all')}
            disabled={cleaning}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <FaTrash />
            {cleaning ? 'Cleaning...' : 'Run Full Cleanup'}
          </button>
          <p className="text-center text-gray-500 text-sm mt-2">
            This will run all cleanup operations at once
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-400" />
          Danger Zone
        </h2>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300 mb-4">
            These actions are destructive and cannot be undone. Use with extreme caution.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
              <div>
                <p className="font-medium">Delete All Failed Payments</p>
                <p className="text-sm text-gray-500">Permanently remove all payment records with failed status</p>
              </div>
              <button
                onClick={() => handleCleanup('failed_payments')}
                disabled={cleaning}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon: Icon, label, total, details, color }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-700',
    blue: 'from-blue-500 to-blue-700',
    cyan: 'from-cyan-500 to-cyan-700',
    green: 'from-green-500 to-green-700',
    yellow: 'from-yellow-500 to-yellow-700',
    pink: 'from-pink-500 to-pink-700'
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]}`}>
          <Icon className="text-2xl text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{label}</h3>
          <p className="text-3xl font-bold">{total.toLocaleString()}</p>
        </div>
      </div>
      {details && details.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-800">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-400">{detail.label}</span>
              <span className={`font-medium ${
                detail.color === 'green' ? 'text-green-400' :
                detail.color === 'red' ? 'text-red-400' :
                detail.color === 'yellow' ? 'text-yellow-400' :
                'text-gray-300'
              }`}>
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const CleanupButton = ({ title, description, icon: Icon, color, onClick, loading }) => {
  const colorClasses = {
    red: 'bg-red-600/20 border-red-500/30 hover:bg-red-600/30',
    yellow: 'bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/30',
    orange: 'bg-orange-600/20 border-orange-500/30 hover:bg-orange-600/30'
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`p-4 border rounded-lg transition-colors text-left ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`text-xl ${
          color === 'red' ? 'text-red-400' :
          color === 'yellow' ? 'text-yellow-400' :
          'text-orange-400'
        }`} />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  )
}

export default AdminDatabase
