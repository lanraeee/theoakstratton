import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface User {
  id: string
  email: string
  first_name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const { success, error } = useAlert()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin',
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/users')
      setUsers(response.data)
    } catch (err) {
      error('Failed to fetch users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/admin/users', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      })
      success('User created successfully')
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'admin' })
      setShowAddModal(false)
      fetchUsers()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to create user')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/api/admin/users/${id}`)
        success('User deactivated successfully')
        fetchUsers()
      } catch (err) {
        error('Failed to delete user')
      }
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (!selectedUser) return

    try {
      await api.post(`/api/admin/users/${selectedUser.id}/change-password`, {
        newPassword: passwordData.newPassword,
      })
      success('Password changed successfully')
      setShowPasswordModal(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
      setSelectedUser(null)
    } catch (err) {
      error('Failed to change password')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-dark">User Management</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add User
          </motion.button>
        </div>

        {/* Users Table */}
        <div className="card p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <motion.tr key={user.id} whileHover={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-100 hover:bg-light transition-colors">
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4">{user.first_name || 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4 space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedUser(user)
                        setShowPasswordModal(true)
                      }}
                      className="text-sm text-primary-500 hover:text-primary-700"
                    >
                      Change Password
                    </motion.button>
                    {user.email !== 'admin@oakstratton.com' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-sm text-danger hover:text-red-700"
                      >
                        Deactivate
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-dark mb-6">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  minLength={8}
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Add User
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-dark mb-6">Change Password for {selectedUser.email}</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  minLength={8}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  minLength={8}
                />
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Update Password
                  </button>
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
