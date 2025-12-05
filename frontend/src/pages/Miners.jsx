import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { FaServer, FaBolt, FaDollarSign, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'

const Miners = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [miners, setMiners] = useState([])
  const [filteredMiners, setFilteredMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [estimate, setEstimate] = useState(null)
  
  const [filters, setFilters] = useState({
    duration: 30,
    minHashrate: 0,
    maxHashrate: 500,
    sortBy: 'price',
    sortOrder: 'asc'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchMiners()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [miners, filters])

  const fetchMiners = async () => {
    try {
      const response = await axios.get('/api/miners/')
      setMiners(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch miners:', error)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...miners]
    
    result = result.filter(m => 
      m.hashrate_th >= filters.minHashrate && 
      m.hashrate_th <= filters.maxHashrate
    )
    
    result.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'price':
          comparison = a.price_usd - b.price_usd
          break
        case 'hashrate':
          comparison = a.hashrate_th - b.hashrate_th
          break
        case 'efficiency':
          comparison = a.efficiency - b.efficiency
          break
        default:
          comparison = 0
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    setFilteredMiners(result)
  }

  const fetchEstimate = async (minerId, hashrate) => {
    try {
      const response = await axios.post(`/api/miners/${minerId}/estimate`, {
        hashrate,
        duration_days: filters.duration
      })
      setEstimate(response.data)
    } catch (error) {
      console.error('Failed to fetch estimate:', error)
    }
  }

  const handleMinerClick = (miner) => {
    setSelectedMiner(miner)
    fetchEstimate(miner.id, miner.hashrate_th)
  }

  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Mining Plans</h1>
        <p className="text-gray-400">Choose your perfect mining plan and start earning Bitcoin</p>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-hover rounded-lg hover:bg-gray-700 transition"
            >
              <FaFilter /> Filters
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Duration:</span>
              {[30, 90, 180].map(days => (
                <button
                  key={days}
                  onClick={() => setFilters(prev => ({ ...prev, duration: days }))}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    filters.duration === days
                      ? 'bg-gradient-primary text-white'
                      : 'bg-dark-hover text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="bg-dark-hover border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="price">Price</option>
                <option value="hashrate">Hashrate</option>
                <option value="efficiency">Efficiency</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 bg-dark-hover rounded-lg hover:bg-gray-700 transition"
              >
                {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Min Hashrate: {filters.minHashrate} TH/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.minHashrate}
                  onChange={(e) => setFilters(prev => ({ ...prev, minHashrate: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Hashrate: {filters.maxHashrate} TH/s
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.maxHashrate}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxHashrate: parseInt(e.target.value) }))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400">
        Showing {filteredMiners.length} of {miners.length} miners
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMiners.map((miner) => (
          <div
            key={miner.id}
            className="glass-card p-6 rounded-2xl hover:scale-105 transition-all cursor-pointer"
            onClick={() => handleMinerClick(miner)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-primary p-3 rounded-lg">
                <FaServer className="text-2xl text-white" />
              </div>
              {miner.available_units < 20 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Limited Stock
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">{miner.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{miner.model}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hashrate</span>
                <span className="font-semibold">{miner.hashrate_th} TH/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Efficiency</span>
                <span className="font-semibold">{miner.efficiency} W/TH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Power</span>
                <span className="font-semibold">{miner.power_watts} W</span>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-green-400">
                  ${miner.price_usd.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400">{filters.duration} Days</span>
              </div>
              
              <button className="w-full bg-gradient-primary hover:opacity-90 py-3 rounded-lg font-semibold transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMiners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No miners match your filters</p>
          <button
            onClick={() => setFilters({
              duration: 30,
              minHashrate: 0,
              maxHashrate: 500,
              sortBy: 'price',
              sortOrder: 'asc'
            })}
            className="mt-4 text-purple-400 hover:text-purple-300 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {selectedMiner && estimate && (
        <div className="glass-card p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Profit Estimate - {selectedMiner.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-card p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Daily BTC</p>
              <p className="text-xl font-bold text-yellow-400">{estimate.daily_btc?.toFixed(8)} BTC</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Monthly BTC</p>
              <p className="text-xl font-bold text-yellow-400">{estimate.monthly_btc?.toFixed(8)} BTC</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Monthly USD</p>
              <p className="text-xl font-bold text-green-400">${estimate.monthly_usd?.toFixed(2)}</p>
            </div>
            <div className="bg-dark-card p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">ROI Days</p>
              <p className="text-xl font-bold text-blue-400">{estimate.roi_days} days</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            * Estimates based on current BTC price of ${estimate.btc_price?.toLocaleString()} 
            and network hashrate of {(estimate.network_hashrate_th / 1_000_000)?.toFixed(2)} EH/s. 
            Maintenance fee of 5% already deducted.
          </p>
          
          <button 
            onClick={() => {
              if (!user) {
                navigate('/login')
              } else {
                navigate('/checkout', { 
                  state: { 
                    miner: selectedMiner, 
                    hashrate: selectedMiner.hashrate_th, 
                    duration: filters.duration 
                  } 
                })
              }
            }}
            className="bg-gradient-primary hover:opacity-90 px-8 py-3 rounded-lg font-semibold transition"
          >
            {user ? 'Rent This Miner' : 'Login to Rent'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Miners
