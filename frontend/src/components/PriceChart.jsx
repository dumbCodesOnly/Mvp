import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const PriceChart = ({ currentPrice }) => {
  const [priceData, setPriceData] = useState([])

  useEffect(() => {
    const generateHistoricalData = () => {
      const data = []
      const basePrice = currentPrice || 50000
      const now = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const variance = (Math.random() - 0.5) * 0.08 * basePrice
        const price = basePrice + variance + (6 - i) * (Math.random() * 500 - 250)
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: Math.round(price),
          fullDate: date.toISOString()
        })
      }
      
      data[data.length - 1].price = currentPrice || basePrice
      return data
    }

    setPriceData(generateHistoricalData())
  }, [currentPrice])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-green-400 font-bold">${payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">BTC Price (7 Days)</h3>
          <p className="text-gray-400 text-sm">Historical price movement</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">${currentPrice?.toLocaleString() || '0'}</p>
          <p className="text-gray-400 text-sm">Current Price</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PriceChart
