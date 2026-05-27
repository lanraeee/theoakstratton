import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface MenuItem {
  id: string
  label: string
  href: string
  icon?: string
  parent_id?: string
  display_order: number
  is_active: boolean
}

export default function NavMenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ label: '', href: '', icon: '' })
  const { success, error } = useAlert()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/navigation-menu')
      setItems(response.data || [])
    } catch (err) {
      console.error('Failed to fetch menu items:', err)
      error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.label || !formData.href) {
      error('Label and href are required')
      return
    }

    try {
      await api.post('/api/admin/navigation-menu', {
        label: formData.label,
        href: formData.href,
        icon: formData.icon || null
      })
      success('Menu item added successfully')
      setFormData({ label: '', href: '', icon: '' })
      fetchMenuItems()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to add menu item')
    }
  }

  const handleUpdate = async (id: string) => {
    if (!formData.label || !formData.href) {
      error('Label and href are required')
      return
    }

    try {
      await api.put(`/api/admin/navigation-menu/${id}`, {
        label: formData.label,
        href: formData.href,
        icon: formData.icon || null
      })
      success('Menu item updated successfully')
      setEditingId(null)
      setFormData({ label: '', href: '', icon: '' })
      fetchMenuItems()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update menu item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this menu item?')) return

    try {
      await api.delete(`/api/admin/navigation-menu/${id}`)
      success('Menu item deleted')
      fetchMenuItems()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete menu item')
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setFormData({
      label: item.label,
      href: item.href,
      icon: item.icon || ''
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ label: '', href: '', icon: '' })
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-dark">Navigation Menu</h2>
          <p className="text-gray-600 text-sm mt-1">Manage navigation menu items for the landing page</p>
        </div>

        {/* Add/Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-4">
            {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={editingId ? (e) => {
            e.preventDefault()
            handleUpdate(editingId)
          } : handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Features"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link *
                </label>
                <input
                  type="text"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="e.g., #features or /about"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., ⭐"
                  maxLength={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="submit"
                className="btn btn-primary"
              >
                {editingId ? '💾 Update' : '➕ Add Menu Item'}
              </motion.button>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Menu Items List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-600 mb-4">No menu items yet</p>
            </div>
          ) : (
            items.map((item, index) => (
              <motion.div key={item.id} whileHover={{ y: -2 }} className="card p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-2xl">{item.icon}</span>}
                      <div>
                        <h3 className="font-bold text-dark">{item.label}</h3>
                        <p className="text-sm text-gray-500">{item.href}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleEdit(item)}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-outline btn-sm text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AdminLayout>
  )
}
