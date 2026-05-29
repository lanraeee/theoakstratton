import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'
import Papa from 'papaparse'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  phone: string
  notes: string
  source: 'waitlist' | 'contact' | 'payment'
  status: 'new' | 'contacted' | 'qualified' | 'customer'
  created_at?: string
  date?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
    source: 'contact' as const,
    status: 'new' as const,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | Lead['source']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Lead['status']>('all')
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const { success, error } = useAlert()

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/leads')
      setLeads(response.data)
    } catch (err) {
      console.error('Failed to fetch leads:', err)
      // Keep using mock data on error
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async () => {
    if (!addFormData.name || !addFormData.email) {
      error('Name and email are required')
      return
    }

    try {
      const response = await api.post('/api/admin/leads', addFormData)
      success('Lead added successfully')
      setLeads([response.data, ...leads])
      setShowAddForm(false)
      setAddFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        notes: '',
        source: 'contact',
        status: 'new',
      })
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to add lead')
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return

    try {
      await api.delete(`/api/admin/leads/${id}`)
      success('Lead deleted successfully')
      setLeads(leads.filter(l => l.id !== id))
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete lead')
    }
  }

  const handleSendResponse = async () => {
    if (!selectedLead || !responseMessage.trim()) {
      error('Please select a lead and write a message')
      return
    }

    setSendingEmail(true)
    try {
      await api.post(`/api/admin/send-response/${selectedLead.id}`, {
        message: responseMessage,
      })
      success('Response sent successfully')
      setResponseMessage('')
      setSelectedLead(null)
      fetchLeads()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to send response')
    } finally {
      setSendingEmail(false)
    }
  }

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

      return matchesSearch && matchesSource && matchesStatus
    })
  }, [leads, searchTerm, sourceFilter, statusFilter])

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id))
    }
  }

  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    )
  }

  const exportCSV = () => {
    const dataToExport = selectedLeads.length > 0
      ? leads.filter((lead) => selectedLeads.includes(lead.id))
      : filteredLeads

    const csv = Papa.unparse(dataToExport)
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    success(`Exported ${dataToExport.length} leads`)
  }

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      customer: 'bg-green-100 text-green-800',
    }
    return colors[status]
  }

  if (loading) {
    return (
      <AdminLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </motion.div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Add Lead Button */}
        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            ➕ Add Lead
          </motion.button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-blue-50 border border-blue-200"
          >
            <h3 className="text-lg font-bold text-dark mb-4">Add New Lead</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name *"
                value={addFormData.name}
                onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="Company"
                value={addFormData.company}
                onChange={(e) => setAddFormData({ ...addFormData, company: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={addFormData.source}
                onChange={(e) => setAddFormData({ ...addFormData, source: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="contact">Source: Contact</option>
                <option value="waitlist">Source: Waitlist</option>
                <option value="payment">Source: Payment</option>
              </select>
              <select
                value={addFormData.status}
                onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value as any })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="new">Status: New</option>
                <option value="contacted">Status: Contacted</option>
                <option value="qualified">Status: Qualified</option>
                <option value="customer">Status: Customer</option>
              </select>
            </div>
            <textarea
              placeholder="Notes"
              value={addFormData.notes}
              onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAddLead}
                className="btn btn-primary"
              >
                Save Lead
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setShowAddForm(false)
                  setAddFormData({
                    name: '',
                    email: '',
                    company: '',
                    phone: '',
                    notes: '',
                    source: 'contact',
                    status: 'new',
                  })
                }}
                className="btn btn-outline"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Header with Filters */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sources</option>
              <option value="waitlist">Waitlist</option>
              <option value="contact">Contact</option>
              <option value="payment">Payment</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <span className="text-sm font-medium text-blue-900">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={exportCSV}
                className="btn btn-primary btn-sm"
              >
                📥 Export Selected
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedLeads([])}
                className="btn btn-outline btn-sm"
              >
                Clear Selection
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Leads Table */}
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Company</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Message</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Source</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Actions</th>
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
                    onClick={() => setSelectedLead(lead)}
                    className="border-b border-gray-100 hover:bg-light transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-dark">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.email}</td>
                    <td className="px-6 py-4 text-gray-600">{lead.company}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate" title={lead.notes}>
                      {lead.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.date || lead.created_at?.split('T')[0] || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLead(lead)
                        }}
                        className="text-primary-500 hover:text-primary-700 font-semibold"
                      >
                        Reply
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLead(lead.id)
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-600 mb-4">No leads found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>

        {/* Export All Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={exportCSV}
          disabled={filteredLeads.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 Export All {filteredLeads.length > 0 && `(${filteredLeads.length})`}
        </motion.button>

        {/* Response Panel */}
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-blue-50 border border-blue-200 mt-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-dark mb-1">Send Response to {selectedLead.name}</h3>
                <p className="text-sm text-gray-600">{selectedLead.email} • {selectedLead.company}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </motion.button>
            </div>

            {selectedLead.notes && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Message</label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.notes}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message to Send
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Write your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendResponse}
                  disabled={sendingEmail || !responseMessage.trim()}
                  className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? 'Sending...' : '📧 Send Email Response'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setSelectedLead(null)
                    setResponseMessage('')
                  }}
                  className="flex-1 btn btn-outline"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
