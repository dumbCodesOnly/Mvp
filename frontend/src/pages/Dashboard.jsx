import { useState, useEffect } from 'react'
import api from '../api/config'
import { FaBitcoin, FaNetworkWired, FaCube } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import UserStats from '../components/UserStats'
import PriceChart from '../components/PriceChart'
import { CardSkeleton } from '../components/LoadingSpinner'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchNetworkStats()
    const interval = setInterval(fetchNetworkStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNetworkStats = async () => {
    try {
      const response = await api.get('/api/stats/network')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch network stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center py-12">
          <div className="skeleton h-12 w-80 mx-auto rounded mb-4" />
          <div className="skeleton h-6 w-96 mx-auto rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center py-12 animate-fade-in-down">
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Start Mining Bitcoin
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join the world's most advanced cloud mining platform. Rent hash power and start earning Bitcoin today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl hover-scale animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-blue p-3 rounded-lg">
                <FaBitcoin className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold">BTC Price</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">
            ${stats?.btc_price?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Live Bitcoin Price</p>
        </div>

        <div className="glass-card p-6 rounded-2xl hover-scale animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-purple p-3 rounded-lg">
                <FaNetworkWired className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold">Network Hashrate</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            {((stats?.network_hashrate_th || 0) / 1_000_000).toFixed(2)} EH/s
          </p>
          <p className="text-sm text-gray-400 mt-2">Global Mining Power</p>
        </div>

        <div className="glass-card p-6 rounded-2xl hover-scale animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-cyan p-3 rounded-lg">
                <FaCube className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold">Difficulty</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-cyan-400">
            {(stats?.difficulty?.difficulty / 1_000_000_000_000).toFixed(2)}T
          </p>
          <p className="text-sm text-gray-400 mt-2">Mining Difficulty</p>
        </div>
      </div>

      {user && <UserStats user={user} />}

      <PriceChart currentPrice={stats?.btc_price} />

      <div className="glass-card p-8 rounded-2xl text-center hover-glow animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Mining?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Browse our mining plans and choose the perfect hashrate for your needs. 
          All plans include 24/7 monitoring, automatic payouts, and transparent fees.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/miners" className="bg-gradient-primary hover:opacity-90 px-8 py-3 rounded-lg font-semibold btn-transition">
            Browse Miners
          </a>
          {!user && (
            <a href="/register" className="glass-card hover:bg-dark-hover px-8 py-3 rounded-lg font-semibold btn-transition">
              Create Account
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl hover-scale animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <h3 className="text-xl font-bold mb-3">⚡ Instant Activation</h3>
          <p className="text-gray-400">
            Start mining immediately after payment confirmation. No delays, no waiting.
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl hover-scale animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xl font-bold mb-3">💰 Daily Payouts</h3>
          <p className="text-gray-400">
            Receive your mining rewards daily directly to your wallet. Transparent and automatic.
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl hover-scale animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <h3 className="text-xl font-bold mb-3">🔒 Secure Platform</h3>
          <p className="text-gray-400">
            Bank-grade security with encrypted transactions and multi-factor authentication.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
