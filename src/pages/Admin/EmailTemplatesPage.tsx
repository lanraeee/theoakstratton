import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  preview: string
  is_active: boolean
  created_at: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const { success, error } = useAlert()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/email-templates')
      setTemplates(response.data)
    } catch (err) {
      console.error('Failed to fetch templates:', err)
      error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.body) {
      error('All fields are required')
      return
    }

    try {
      if (editingTemplate.id && editingTemplate.id !== 'new') {
        await api.put(`/api/admin/email-templates/${editingTemplate.id}`, editingTemplate)
        success('Template updated successfully')
      } else {
        await api.post('/api/admin/email-templates', editingTemplate)
        success('Template created successfully')
      }
      fetchTemplates()
      setEditingTemplate(null)
      setIsCreating(false)
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to save template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return

    try {
      await api.delete(`/api/admin/email-templates/${id}`)
      success('Template deleted successfully')
      fetchTemplates()
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to delete template')
    }
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-dark">Email Templates</h2>
            <p className="text-gray-600 text-sm mt-1">Design and manage email templates for campaigns</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTemplate({
                id: 'new',
                name: '',
                subject: '',
                body: '',
                preview: '',
                is_active: true,
                created_at: new Date().toISOString(),
              })
              setIsCreating(true)
            }}
            className="btn btn-primary"
          >
            ✨ Create New Template
          </motion.button>
        </div>

        {/* Template Editor or List */}
        {editingTemplate ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-dark">
                {isCreating ? 'Create New Template' : 'Edit Template'}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  setEditingTemplate(null)
                  setIsCreating(false)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="e.g., Welcome Email, Payment Confirmation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="e.g., Welcome to Oakstratton!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Body (HTML)
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-sm btn btn-outline btn-sm"
                    >
                      {previewMode ? '✎ Edit' : '👁️ Preview'}
                    </motion.button>
                  </div>
                  <textarea
                    value={editingTemplate.body}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                    placeholder="Enter HTML email content here. Use {name}, {email}, {company} for dynamic variables."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    rows={12}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editingTemplate.is_active}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Active (available for use)</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSaveTemplate}
                    className="flex-1 btn btn-primary"
                  >
                    💾 Save Template
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setEditingTemplate(null)
                      setIsCreating(false)
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>

              {/* Preview */}
              <div className="lg:col-span-1">
                <div className="card p-4 bg-gray-50 sticky top-6">
                  <h4 className="font-semibold text-dark mb-3">Preview</h4>
                  <div className="bg-white rounded p-4 border border-gray-200 text-sm">
                    <p className="font-semibold text-gray-900 mb-2">{editingTemplate.subject || '(Subject here)'}</p>
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: editingTemplate.body || '<p>(Email body preview)</p>',
                      }}
                    />
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                      <strong>Variables available:</strong>
                      <ul className="mt-2 space-y-1">
                        <li>{'{{name}}'} - Lead/customer name</li>
                        <li>{'{{email}}'} - Email address</li>
                        <li>{'{{company}}'} - Company name</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full card p-12 text-center">
                <p className="text-gray-600 mb-4">No templates yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setEditingTemplate({
                      id: 'new',
                      name: '',
                      subject: '',
                      body: '',
                      preview: '',
                      is_active: true,
                      created_at: new Date().toISOString(),
                    })
                    setIsCreating(true)
                  }}
                  className="btn btn-primary"
                >
                  Create your first template
                </motion.button>
              </div>
            ) : (
              templates.map((template) => (
                <motion.div key={template.id} whileHover={{ y: -4 }} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-dark">{template.name}</h3>
                    {template.is_active && <span className="badge badge-success text-xs">Active</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.subject}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setEditingTemplate(template)
                        setIsCreating(false)
                      }}
                      className="flex-1 btn btn-outline btn-sm"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex-1 btn btn-outline btn-sm text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
