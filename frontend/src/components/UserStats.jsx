import { useState, useEffect } from 'react'
import api from '../api/config'
import { FaServer, FaBitcoin, FaFileContract, FaChartLine } from 'react-icons/fa'

const UserStats = ({ user }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/api/rentals/user')
      const rentals = response.data || []
      
      const activeRentals = rentals.filter(r => r.is_active)
      const totalHashrate = activeRentals.reduce((sum, r) => sum + r.hashrate_allocated, 0)
      const totalEarnings = rentals.reduce((sum, r) => sum + r.total_profit_btc, 0)
      
      const networkResponse = await api.get('/api/stats/network')
      const btcPrice = networkResponse.data?.btc_price || 50000
      
      const dailyBtcEstimate = totalHashrate * 0.00000005
      const monthlyBtcEstimate = dailyBtcEstimate * 30
      
      setStats({
        totalHashrate: totalHashrate.toFixed(2),
        activeContracts: activeRentals.length,
        totalEarningsBtc: totalEarnings.toFixed(8),
        totalEarningsUsd: (totalEarnings * btcPrice).toFixed(2),
        monthlyEstimateBtc: monthlyBtcEstimate.toFixed(8),
        monthlyEstimateUsd: (monthlyBtcEstimate * btcPrice).toFixed(2)
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaChartLine className="text-purple-400" />
        Your Mining Stats
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-purple p-2 rounded-lg">
              <FaServer className="text-lg text-white" />
            </div>
            <span className="text-gray-400 text-sm">Total Hashrate</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalHashrate} TH/s</p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-blue p-2 rounded-lg">
              <FaFileContract className="text-lg text-white" />
            </div>
            <span className="text-gray-400 text-sm">Active Contracts</span>
          </div>
          <p className="text-2xl font-bold">{stats.activeContracts}</p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-cyan p-2 rounded-lg">
              <FaBitcoin className="text-lg text-white" />
            </div>
            <span className="text-gray-400 text-sm">Monthly Earnings (Est.)</span>
          </div>
          <p className="text-lg font-bold text-yellow-400">{stats.monthlyEstimateBtc} BTC</p>
          <p className="text-sm text-green-400">${stats.monthlyEstimateUsd}</p>
        </div>

        <div className="glass-card p-6 rounded-xl hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <FaBitcoin className="text-lg text-white" />
            </div>
            <span className="text-gray-400 text-sm">Total Earned</span>
          </div>
          <p className="text-lg font-bold text-yellow-400">{stats.totalEarningsBtc} BTC</p>
          <p className="text-sm text-green-400">${stats.totalEarningsUsd}</p>
        </div>
      </div>
    </div>
  )
}

export default UserStats
