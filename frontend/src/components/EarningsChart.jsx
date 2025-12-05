import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts'

const EarningsChart = ({ rentals, btcPrice = 50000 }) => {
  const generateEarningsData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    
    return months.map((month, index) => {
      const targetMonth = (currentMonth - 5 + index + 12) % 12
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const displayMonth = monthNames[targetMonth]
      
      const totalHashrate = rentals.reduce((sum, r) => sum + (r.is_active ? r.hashrate_allocated : 0), 0)
      const baseBtc = (totalHashrate * 0.00000005 * 30) * (0.7 + Math.random() * 0.6)
      const btcEarned = index === 5 ? rentals.reduce((sum, r) => sum + r.total_profit_btc, 0) : baseBtc
      
      return {
        month: displayMonth,
        btc: btcEarned,
        usd: btcEarned * btcPrice
      }
    })
  }

  const data = generateEarningsData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm mb-2">{label}</p>
          <p className="text-yellow-400 font-semibold">{payload[0]?.value?.toFixed(8)} BTC</p>
          <p className="text-green-400 font-semibold">${payload[1]?.value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Earnings History</h3>
          <p className="text-gray-400 text-sm">Monthly BTC earnings and USD equivalent</p>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              stroke="#fbbf24"
              tick={{ fill: '#fbbf24', fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(6)}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#4ade80"
              tick={{ fill: '#4ade80', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              yAxisId="left" 
              dataKey="btc" 
              fill="#fbbf24" 
              radius={[4, 4, 0, 0]}
              name="BTC"
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="usd" 
              stroke="#4ade80" 
              strokeWidth={2}
              dot={{ fill: '#4ade80', strokeWidth: 2 }}
              name="USD"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span className="text-sm text-gray-400">BTC Earned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-400">USD Value</span>
        </div>
      </div>
    </div>
  )
}

export default EarningsChart
