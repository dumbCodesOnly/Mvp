import { useState, useEffect } from 'react'
import api from '../api/config'
import { FaCog, FaSave, FaPercent, FaBitcoin, FaDollarSign, FaUndo } from 'react-icons/fa'
import { useToast } from '../components/Toast'

const AdminSettings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useToast()

  const settingLabels = {
    referral_percentage: { label: 'Referral Commission (%)', icon: FaPercent, type: 'number', step: '0.1' },
    profit_percentage: { label: 'Daily Profit (%)', icon: FaPercent, type: 'number', step: '0.1' },
    min_withdrawal: { label: 'Minimum Withdrawal ($)', icon: FaDollarSign, type: 'number', step: '1' },
    maintenance_fee_percentage: { label: 'Maintenance Fee (%)', icon: FaPercent, type: 'number', step: '0.1' },
    btc_mining_reward: { label: 'BTC Reward per TH/s/day', icon: FaBitcoin, type: 'number', step: '0.00000001' }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings')
      setSettings(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load settings')
      console.error('Settings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }))
  }

  const handleSave = async (key) => {
    setSaving(true)
    try {
      await api.put(`/api/admin/settings/${key}`, {
        value: settings[key].value
      })
      showToast(`${settingLabels[key]?.label || key} updated successfully`, 'success')
    } catch (err) {
      showToast('Failed to save setting', 'error')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const updates = {}
      Object.keys(settings).forEach(key => {
        updates[key] = settings[key].value
      })
      await api.put('/api/admin/settings', updates)
      showToast('All settings saved successfully', 'success')
    } catch (err) {
      showToast('Failed to save settings', 'error')
      console.error('Save all error:', err)
    } finally {
      setSaving(false)
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
          <FaCog className="text-purple-400" />
          System Settings
        </h1>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <FaSave />
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchSettings} className="mt-2 text-sm text-purple-400 hover:underline">
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaPercent className="text-green-400" />
            Commission & Profit Settings
          </h2>
          <div className="space-y-6">
            {['referral_percentage', 'profit_percentage', 'maintenance_fee_percentage'].map(key => {
              const config = settingLabels[key]
              const Icon = config?.icon || FaCog
              const setting = settings[key] || { value: '0', description: '' }
              
              return (
                <div key={key} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 font-medium">
                    <Icon className="text-purple-400" />
                    {config?.label || key}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={config?.type || 'text'}
                      step={config?.step}
                      value={setting.value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="flex-1 bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleSave(key)}
                      disabled={saving}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <FaSave />
                    </button>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaDollarSign className="text-yellow-400" />
            Financial Settings
          </h2>
          <div className="space-y-6">
            {['min_withdrawal', 'btc_mining_reward'].map(key => {
              const config = settingLabels[key]
              const Icon = config?.icon || FaCog
              const setting = settings[key] || { value: '0', description: '' }
              
              return (
                <div key={key} className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300 font-medium">
                    <Icon className="text-yellow-400" />
                    {config?.label || key}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={config?.type || 'text'}
                      step={config?.step}
                      value={setting.value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="flex-1 bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => handleSave(key)}
                      disabled={saving}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    >
                      <FaSave />
                    </button>
                  </div>
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaUndo className="text-blue-400" />
          Reset to Defaults
        </h2>
        <p className="text-gray-400 mb-4">
          Reset all settings to their default values. This action cannot be undone.
        </p>
        <button
          onClick={fetchSettings}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaUndo />
          Reload Current Settings
        </button>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">All Settings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Key</th>
                <th className="text-left py-3 px-4 text-gray-400">Value</th>
                <th className="text-left py-3 px-4 text-gray-400">Description</th>
                <th className="text-left py-3 px-4 text-gray-400">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(settings).map(([key, data]) => (
                <tr key={key} className="border-b border-gray-800 hover:bg-dark-hover">
                  <td className="py-3 px-4 font-mono text-sm">{key}</td>
                  <td className="py-3 px-4 text-purple-400">{data.value}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{data.description}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
