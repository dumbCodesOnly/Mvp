import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaServer, FaBolt, FaDollarSign } from 'react-icons/fa'

const Miners = () => {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [estimate, setEstimate] = useState(null)

  useEffect(() => {
    fetchMiners()
  }, [])

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

  const fetchEstimate = async (minerId, hashrate) => {
    try {
      const response = await axios.post(`/api/miners/${minerId}/estimate`, {
        hashrate,
        duration_days: 30
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {miners.map((miner) => (
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
                <span className="text-sm text-gray-400">30 Days</span>
              </div>
              
              <button className="w-full bg-gradient-primary hover:opacity-90 py-3 rounded-lg font-semibold transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

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
          
          <button className="bg-gradient-primary hover:opacity-90 px-8 py-3 rounded-lg font-semibold transition">
            Rent This Miner
          </button>
        </div>
      )}
    </div>
  )
}

export default Miners
