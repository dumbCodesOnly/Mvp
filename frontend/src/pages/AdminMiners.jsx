import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaServer, FaSave, FaTimes } from 'react-icons/fa'

const AdminMiners = () => {
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMiner, setEditingMiner] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    hashrate_th: '',
    price_usd: '',
    efficiency: '',
    power_watts: '',
    available_units: '100',
    description: '',
    image_url: ''
  })

  useEffect(() => {
    fetchMiners()
  }, [])

  const fetchMiners = async () => {
    try {
      const response = await axios.get('/api/admin/miners')
      setMiners(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load miners')
      console.error('Admin miners error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      hashrate_th: '',
      price_usd: '',
      efficiency: '',
      power_watts: '',
      available_units: '100',
      description: '',
      image_url: ''
    })
    setEditingMiner(null)
    setShowForm(false)
  }

  const handleEdit = (miner) => {
    setEditingMiner(miner)
    setFormData({
      name: miner.name,
      model: miner.model,
      hashrate_th: miner.hashrate_th.toString(),
      price_usd: miner.price_usd.toString(),
      efficiency: miner.efficiency.toString(),
      power_watts: miner.power_watts.toString(),
      available_units: miner.available_units.toString(),
      description: miner.description || '',
      image_url: miner.image_url || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMiner) {
        await axios.put(`/api/admin/miners/${editingMiner.id}`, formData)
      } else {
        await axios.post('/api/admin/miners', formData)
      }
      resetForm()
      fetchMiners()
    } catch (err) {
      setError(editingMiner ? 'Failed to update miner' : 'Failed to create miner')
      console.error('Miner save error:', err)
    }
  }

  const handleDelete = async (minerId) => {
    if (!window.confirm('Are you sure you want to delete this miner?')) return
    
    try {
      await axios.delete(`/api/admin/miners/${minerId}`)
      fetchMiners()
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to delete miner')
      }
      console.error('Miner delete error:', err)
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Manage Miners
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Miner
        </button>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingMiner ? 'Edit Miner' : 'Add New Miner'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="Antminer S21 Pro"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="S21 Pro"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hashrate (TH/s)</label>
                <input
                  type="number"
                  name="hashrate_th"
                  value={formData.hashrate_th}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price (USD)</label>
                <input
                  type="number"
                  name="price_usd"
                  value={formData.price_usd}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Efficiency (W/TH)</label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="17.5"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Power (Watts)</label>
                <input
                  type="number"
                  name="power_watts"
                  value={formData.power_watts}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="3500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Available Units</label>
                <input
                  type="number"
                  name="available_units"
                  value={formData.available_units}
                  onChange={handleInputChange}
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                placeholder="High-performance ASIC miner..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <FaSave /> {editingMiner ? 'Update' : 'Create'} Miner
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-hover">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Miner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Specs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rentals</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {miners.map((miner) => (
                <tr key={miner.id} className="hover:bg-dark-hover transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <FaServer className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">{miner.name}</p>
                        <p className="text-sm text-gray-400">{miner.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{miner.hashrate_th} TH/s</p>
                    <p className="text-xs text-gray-400">{miner.efficiency} W/TH</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-green-400">${miner.price_usd.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{miner.available_units} available</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{miner.rental_count || 0} total</p>
                    <p className="text-xs text-green-400">{miner.active_rentals || 0} active</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(miner)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(miner.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {miners.length === 0 && (
          <div className="text-center py-12">
            <FaServer className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No miners yet. Add your first miner!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMiners
