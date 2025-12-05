import { useState, useEffect } from 'react'
import api from '../api/config'
import { FaUsers, FaSearch, FaShieldAlt, FaEnvelope, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users', {
        params: { page: currentPage, search, per_page: 15 }
      })
      setUsers(response.data.users)
      setTotalPages(response.data.pages)
      setError(null)
    } catch (err) {
      setError('Failed to load users')
      console.error('Admin users error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    try {
      const response = await api.get(`/api/admin/users/${userId}`)
      setUserDetails(response.data)
      setSelectedUser(userId)
    } catch (err) {
      console.error('User details error:', err)
    }
  }

  const handleToggleAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to toggle admin status for this user?')) return
    
    try {
      await api.put(`/api/admin/users/${userId}/toggle-admin`)
      fetchUsers()
      if (selectedUser === userId) {
        fetchUserDetails(userId)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update admin status')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Manage Users
        </h1>
      </div>

      {error && (
        <div className="glass-card p-4 border border-red-500/50 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <div className={`${selectedUser ? 'w-1/2' : 'w-full'} transition-all`}>
          <div className="glass-card p-4 mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-hover">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => fetchUserDetails(user.id)}
                        className={`cursor-pointer transition ${
                          selectedUser === user.id ? 'bg-purple-500/20' : 'hover:bg-dark-hover'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-purple-500/20">
                              <FaUsers className="text-purple-400 text-sm" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.email}</p>
                              <p className="text-xs text-gray-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.is_admin 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.is_admin ? 'Admin' : 'User'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <FaUsers className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No users found</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-800">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUser && userDetails && (
          <div className="w-1/2">
            <div className="glass-card p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">User Details</h2>
                <button
                  onClick={() => { setSelectedUser(null); setUserDetails(null); }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-dark-hover rounded-lg">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <FaUsers className="text-purple-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{userDetails.user.email}</p>
                    <p className="text-sm text-gray-400">
                      Referral Code: <span className="text-purple-400 font-mono">{userDetails.user.referral_code}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleAdmin(userDetails.user.id)}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                      userDetails.user.is_admin
                        ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                    }`}
                  >
                    <FaShieldAlt /> {userDetails.user.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-hover rounded-lg">
                    <p className="text-2xl font-bold">{userDetails.stats.total_rentals}</p>
                    <p className="text-sm text-gray-400">Total Rentals</p>
                  </div>
                  <div className="p-4 bg-dark-hover rounded-lg">
                    <p className="text-2xl font-bold text-green-400">{userDetails.stats.active_rentals}</p>
                    <p className="text-sm text-gray-400">Active Rentals</p>
                  </div>
                  <div className="p-4 bg-dark-hover rounded-lg">
                    <p className="text-2xl font-bold">${userDetails.stats.total_spent_usd.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Total Spent</p>
                  </div>
                  <div className="p-4 bg-dark-hover rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{userDetails.stats.total_referrals}</p>
                    <p className="text-sm text-gray-400">Referrals</p>
                  </div>
                </div>

                {userDetails.rentals.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Rentals</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userDetails.rentals.slice(0, 5).map((rental) => (
                        <div key={rental.id} className="p-3 bg-dark-hover rounded-lg flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{rental.miner_name}</p>
                            <p className="text-xs text-gray-400">{rental.hashrate_allocated} TH/s</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rental.is_active ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {rental.is_active ? 'Active' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FaCalendar />
                    <span>Joined {new Date(userDetails.user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
