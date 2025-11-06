import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaServer, FaCheckCircle, FaClock } from 'react-icons/fa'
import { format } from 'date-fns'

const MyRentals = () => {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchRentals()
  }, [user])

  const fetchRentals = async () => {
    try {
      const response = await axios.get('/api/rentals/user')
      setRentals(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch rentals:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (rentals.length === 0) {
    return (
      <div className="text-center py-16">
        <FaServer className="text-6xl text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Active Rentals</h2>
        <p className="text-gray-400 mb-6">Start mining by renting your first miner</p>
        <a
          href="/miners"
          className="inline-block bg-gradient-primary hover:opacity-90 px-8 py-3 rounded-lg font-semibold transition"
        >
          Browse Miners
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">My Rentals</h1>
        <p className="text-gray-400">Track your mining contracts and earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">Active Contracts</p>
          <p className="text-3xl font-bold">{rentals.filter(r => r.is_active).length}</p>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">Total Hashrate</p>
          <p className="text-3xl font-bold">
            {rentals.reduce((sum, r) => sum + (r.is_active ? r.hashrate_allocated : 0), 0).toFixed(2)} TH/s
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">Total Earnings</p>
          <p className="text-3xl font-bold text-green-400">
            {rentals.reduce((sum, r) => sum + r.total_profit_btc, 0).toFixed(8)} BTC
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rentals.map((rental) => (
          <div key={rental.id} className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-primary p-3 rounded-lg">
                  <FaServer className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{rental.miner_name || `Miner #${rental.miner_id}`}</h3>
                  <p className="text-sm text-gray-400">{rental.hashrate_allocated} TH/s allocated</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rental.is_active ? (
                  <span className="flex items-center gap-2 bg-green-900 text-green-300 px-4 py-2 rounded-full text-sm">
                    <FaCheckCircle /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-2 bg-yellow-900 text-yellow-300 px-4 py-2 rounded-full text-sm">
                    <FaClock /> Pending
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-semibold">{rental.duration_days} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Start Date</p>
                <p className="font-semibold">
                  {rental.start_date ? format(new Date(rental.start_date), 'MMM dd, yyyy') : 'Not started'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">End Date</p>
                <p className="font-semibold">
                  {rental.end_date ? format(new Date(rental.end_date), 'MMM dd, yyyy') : 'TBD'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Profit Earned</p>
                <p className="font-semibold text-green-400">{rental.total_profit_btc.toFixed(8)} BTC</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyRentals
