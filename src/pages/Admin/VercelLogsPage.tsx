import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface Deployment {
  uid: string
  url: string
  name: string
  state: string
  createdAt: number
  creator: { username: string }
  env?: Record<string, string>
  functions?: Array<{ path: string; duration: number }>
}

export default function VercelLogsPage() {
  const [domain, setDomain] = useState('oakstratton.belloite.com')
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [deploymentLogs, setDeploymentLogs] = useState<any>(null)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const { success, error: showError } = useAlert()

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/vercel/project-logs', {
        params: { domain, type: 'build' },
      })

      if (response.data.success) {
        setDeployments(response.data.deployments || [])
        success(`Found ${response.data.deployments?.length || 0} deployments for ${domain}`)
      }
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeploymentLogs = async (deploymentId: string) => {
    try {
      setLoadingLogs(true)
      const response = await api.get(`/api/vercel/logs/${deploymentId}`)

      if (response.data.success) {
        setDeploymentLogs(response.data.builds)
        success('Deployment logs fetched')
      }
    } catch (err: any) {
      showError(err.response?.data?.error || 'Failed to fetch deployment logs')
    } finally {
      setLoadingLogs(false)
    }
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Vercel Deployment Logs</h1>
          <p className="text-gray-600">
            Monitor and view deployment logs for your Vercel projects
          </p>
        </div>

        {/* Log Fetcher */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="oakstratton.belloite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the domain to fetch logs for (e.g., oakstratton.belloite.com)
              </p>
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading || !domain}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Fetching logs...' : '🔄 Fetch Deployment Logs'}
            </button>
          </div>
        </motion.div>

        {/* Deployments List */}
        {deployments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-dark">
              Recent Deployments ({deployments.length})
            </h2>

            <div className="space-y-3">
              {deployments.map((deployment) => (
                <motion.div
                  key={deployment.uid}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedDeployment(deployment)
                    fetchDeploymentLogs(deployment.uid)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark">{deployment.name || deployment.url}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>URL: {deployment.url}</span>
                        <span>
                          State:{' '}
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              deployment.state === 'READY'
                                ? 'bg-green-100 text-green-700'
                                : deployment.state === 'ERROR'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {deployment.state}
                          </span>
                        </span>
                        <span>
                          Created: {new Date(deployment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {deployment.creator && (
                        <p className="text-xs text-gray-500 mt-1">
                          Creator: {deployment.creator.username}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDeployment(deployment)
                        fetchDeploymentLogs(deployment.uid)
                      }}
                      className="btn btn-sm btn-primary ml-4"
                      disabled={loadingLogs}
                    >
                      {loadingLogs ? 'Loading...' : 'View Logs'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Deployment Logs */}
        {selectedDeployment && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-dark">
                  Logs for {selectedDeployment.name || selectedDeployment.url}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Deployment ID: {selectedDeployment.uid}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDeployment(null)
                  setDeploymentLogs(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : deploymentLogs && deploymentLogs.length > 0 ? (
              <div className="space-y-3">
                {deploymentLogs.map((log: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-mono text-sm text-gray-700">
                          {log.path ? `📁 ${log.path}` : '⚙️ Build'}
                        </p>
                        {log.duration && (
                          <p className="text-xs text-gray-500 mt-1">
                            ⏱️ Duration: {log.duration}ms
                          </p>
                        )}
                      </div>
                      {log.status && (
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            log.status === 'ready'
                              ? 'bg-green-100 text-green-700'
                              : log.status === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {log.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">
                {deploymentLogs ? 'No build logs available' : 'Click "View Logs" to fetch deployment logs'}
              </p>
            )}
          </motion.div>
        )}

        {/* No Deployments Message */}
        {!loading && deployments.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
            <p className="text-gray-600 mb-4">
              No deployments found for this domain
            </p>
            <p className="text-sm text-gray-500">
              Make sure you have:
              <br />
              1. Set VERCEL_API_TOKEN in your environment variables
              <br />
              2. Entered the correct domain name
              <br />
              3. Have access to view this deployment on Vercel
            </p>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
