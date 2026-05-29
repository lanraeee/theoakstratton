import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface WaitlistLead {
  id: string
  email: string
  name: string
  company: string
  joinedDate: string
  lastSeen: string
  status: 'active' | 'dormant' | 'converted'
  engagementScore: number
}

export default function WaitlistPage() {
  const [leads, setLeads] = useState<WaitlistLead[]>([])
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState<'all' | 'active' | 'dormant' | 'converted'>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const { success, error } = useAlert()

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/waitlist')
      setLeads(response.data)
    } catch (err) {
      console.error('Failed to fetch waitlist:', err)
      error('Failed to fetch waitlist')
    } finally {
      setLoading(false)
    }
  }

  const handleAddWaitlistEntry = async () => {
    if (!formData.email || !formData.name) {
      error('Name and email are required')
      return
    }

    try {
      await api.post('/api/admin/leads', {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        source: 'waitlist',
        status: 'active',
      })
      success('Waitlist entry added successfully')
      setFormData({ name: '', email: '', company: '' })
      setShowAddForm(false)
      fetchWaitlist()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to add entry')
    }
  }

  const filteredLeads = useMemo(() => {
    if (segment === 'all') return leads
    return leads.filter((lead) => lead.status === segment)
  }, [leads, segment])

  const stats = {
    total: leads.length,
    active: leads.filter((l) => l.status === 'active').length,
    dormant: leads.filter((l) => l.status === 'dormant').length,
    converted: leads.filter((l) => l.status === 'converted').length,
  }

  const sendEmailToSegment = () => {
    const target = selectedLeads.length > 0 ? selectedLeads.length : filteredLeads.length
    success(`Email queued to ${target} lead${target !== 1 ? 's' : ''}`)
    setSelectedLeads([])
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id))
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </motion.div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Add Waitlist Entry Button */}
        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            ➕ Add Waitlist Entry
          </motion.button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-blue-50 border border-blue-200"
          >
            <h3 className="text-lg font-bold text-dark mb-4">Add New Waitlist Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAddWaitlistEntry}
                className="btn btn-primary"
              >
                Save Entry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setShowAddForm(false)
                  setFormData({ name: '', email: '', company: '' })
                }}
                className="btn btn-outline"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Waitlist', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: stats.active, color: 'from-green-500 to-green-600' },
            { label: 'Dormant', value: stats.dormant, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Converted', value: stats.converted, color: 'from-purple-500 to-purple-600' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className={`card p-6 bg-gradient-to-br ${stat.color} text-white`}
            >
              <p className="text-white/80 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Segment Selector */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Waitlist', value: 'all' },
              { label: 'Active (Last 30 Days)', value: 'active' },
              { label: 'Dormant (No Activity)', value: 'dormant' },
              { label: 'Converted', value: 'converted' },
            ].map((seg) => (
              <motion.button
                key={seg.value}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSegment(seg.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  segment === seg.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-light border border-gray-300 text-gray-700 hover:border-primary-500'
                }`}
              >
                {seg.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4 bg-blue-50 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">
                {selectedLeads.length} selected
              </span>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={sendEmailToSegment}
                  className="btn btn-primary btn-sm"
                >
                  📧 Send Email
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedLeads([])}
                  className="btn btn-outline btn-sm"
                >
                  Clear
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Waitlist Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Last Seen</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Engagement</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, idx) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="border-b border-gray-100 hover:bg-light transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() =>
                          setSelectedLeads((prev) =>
                            prev.includes(lead.id)
                              ? prev.filter((id) => id !== lead.id)
                              : [...prev, lead.id]
                          )
                        }
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.company}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.joinedDate}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.lastSeen}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lead.engagementScore}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                          />
                        </div>
                        <span className="text-sm font-bold text-primary-500">{lead.engagementScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : lead.status === 'dormant'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600">No leads in this segment</p>
            </div>
          )}
        </div>

        {/* Bulk Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={sendEmailToSegment}
          disabled={filteredLeads.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📧 Send Email to Segment ({filteredLeads.length})
        </motion.button>
      </motion.div>
    </AdminLayout>
  )
}
