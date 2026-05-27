import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface Campaign {
  id: string
  name: string
  template_id: string
  segment: 'all' | 'waitlist' | 'contacted' | 'customers' | 'new'
  recipient_count: number
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  sent_at?: string
  created_at: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingCampaign, setCreatingCampaign] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    segment: 'all' as Campaign['segment'],
  })
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null)
  const { success, error } = useAlert()

  useEffect(() => {
    fetchCampaigns()
    fetchTemplates()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/email-campaigns')
      setCampaigns(response.data)
    } catch (err) {
      console.error('Failed to fetch campaigns:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/admin/email-templates')
      setTemplates(response.data.filter((t: any) => t.is_active))
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.template_id) {
      error('Please fill in all required fields')
      return
    }

    try {
      await api.post('/api/admin/email-campaigns', formData)
      success('Campaign created successfully')
      setFormData({ name: '', template_id: '', segment: 'all' })
      setCreatingCampaign(false)
      fetchCampaigns()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to create campaign')
    }
  }

  const handleSendCampaign = async (campaignId: string) => {
    if (!window.confirm('Send this campaign to all recipients? This cannot be undone.')) return

    try {
      setSendingCampaignId(campaignId)
      await api.post(`/api/admin/email-campaigns/${campaignId}/send`)
      success('Campaign sent successfully!')
      fetchCampaigns()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to send campaign')
    } finally {
      setSendingCampaignId(null)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Delete this campaign?')) return

    try {
      await api.delete(`/api/admin/email-campaigns/${campaignId}`)
      success('Campaign deleted')
      fetchCampaigns()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete campaign')
    }
  }

  const getSegmentLabel = (segment: Campaign['segment']) => {
    const labels = {
      all: '📨 Everyone',
      waitlist: '⏳ Waitlist',
      contacted: '💬 Contacted',
      customers: '🎉 Customers',
      new: '⭐ New Leads',
    }
    return labels[segment]
  }

  const getStatusBadge = (status: Campaign['status']) => {
    const styles = {
      draft: 'badge-gray',
      scheduled: 'badge-blue',
      sending: 'badge-yellow',
      sent: 'badge-success',
    }
    const icons = { draft: '📝', scheduled: '⏰', sending: '📧', sent: '✅' }
    return (
      <span className={`badge ${styles[status]} text-xs`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-dark">Email Campaigns</h2>
            <p className="text-gray-600 text-sm mt-1">Send bulk emails to customer segments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreatingCampaign(!creatingCampaign)}
            className="btn btn-primary"
          >
            {creatingCampaign ? '✕ Cancel' : '📧 New Campaign'}
          </motion.button>
        </div>

        {/* Create Campaign Form */}
        {creatingCampaign && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Create Email Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Promotion"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Template *
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Segment *
                  </label>
                  <select
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value as Campaign['segment'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">📨 Everyone</option>
                    <option value="waitlist">⏳ Waitlist Subscribers</option>
                    <option value="contacted">💬 Already Contacted</option>
                    <option value="customers">🎉 Customers</option>
                    <option value="new">⭐ New Leads</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="submit"
                  className="btn btn-primary"
                >
                  📝 Create Draft Campaign
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => setCreatingCampaign(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Campaigns List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-600 mb-4">No campaigns yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setCreatingCampaign(true)}
                className="btn btn-primary"
              >
                Create your first campaign
              </motion.button>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <motion.div key={campaign.id} whileHover={{ y: -2 }} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark mb-2">{campaign.name}</h3>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {getStatusBadge(campaign.status)}
                      <span className="text-sm text-gray-600">
                        📨 {campaign.recipient_count} recipient{campaign.recipient_count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm text-gray-600">{getSegmentLabel(campaign.segment)}</span>
                    </div>
                    {campaign.sent_at && (
                      <p className="text-xs text-gray-500">
                        Sent on {new Date(campaign.sent_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={sendingCampaignId === campaign.id}
                          className="btn btn-primary btn-sm disabled:opacity-50"
                        >
                          {sendingCampaignId === campaign.id ? 'Sending...' : '🚀 Send Now'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="btn btn-outline btn-sm text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </motion.button>
                      </>
                    )}
                    {campaign.status !== 'draft' && (
                      <div className="text-sm text-gray-500">Sent</div>
                    )}
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
