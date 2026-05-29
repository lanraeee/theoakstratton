import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface EmailMetrics {
  id: string
  templateName: string
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  bouncedCount: number
  unsubscribeCount: number
  conversionCount: number
  sentDate: string
}

interface TrackingData {
  date: string
  sent: number
  delivered: number
  opened: number
  clicked: number
}

export default function EmailTrackingPage() {
  const [metrics, setMetrics] = useState<EmailMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<EmailMetrics | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const { error } = useAlert()

  useEffect(() => {
    fetchEmailMetrics()
  }, [])

  const fetchEmailMetrics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/email-tracking')
      setMetrics(response.data || [])
    } catch (err) {
      console.error('Failed to fetch email tracking:', err)
      error('Failed to fetch email tracking data')
    } finally {
      setLoading(false)
    }
  }

  // Generate timeline data from metrics
  const TRACKING_TIMELINE: TrackingData[] = useMemo(() => {
    if (metrics.length === 0) return []

    return metrics.slice(0, 6).map((m) => ({
      date: m.sentDate.slice(5),
      sent: m.sentCount,
      delivered: m.deliveredCount,
      opened: m.openedCount,
      clicked: m.clickedCount,
    })).reverse()
  }, [metrics])

  const aggregateMetrics = useMemo(() => {
    return {
      totalSent: metrics.reduce((sum, m) => sum + m.sentCount, 0),
      totalDelivered: metrics.reduce((sum, m) => sum + m.deliveredCount, 0),
      totalOpened: metrics.reduce((sum, m) => sum + m.openedCount, 0),
      totalClicked: metrics.reduce((sum, m) => sum + m.clickedCount, 0),
      totalBounced: metrics.reduce((sum, m) => sum + m.bouncedCount, 0),
      totalConversions: metrics.reduce((sum, m) => sum + m.conversionCount, 0),
    }
  }, [metrics])

  const calculateRate = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  const getDeliveryStatus = (metrics: EmailMetrics) => {
    const deliveryRate = (metrics.deliveredCount / metrics.sentCount) * 100
    if (deliveryRate >= 95) return 'Excellent'
    if (deliveryRate >= 90) return 'Good'
    if (deliveryRate >= 85) return 'Fair'
    return 'Poor'
  }

  const metricCards = [
    {
      label: 'Emails Sent',
      value: aggregateMetrics.totalSent.toLocaleString(),
      icon: '📬',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      label: 'Delivered',
      value: aggregateMetrics.totalDelivered.toLocaleString(),
      rate: calculateRate(aggregateMetrics.totalDelivered, aggregateMetrics.totalSent),
      icon: '✓',
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Opened',
      value: aggregateMetrics.totalOpened.toLocaleString(),
      rate: calculateRate(aggregateMetrics.totalOpened, aggregateMetrics.totalDelivered),
      icon: '👁',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      label: 'Clicked',
      value: aggregateMetrics.totalClicked.toLocaleString(),
      rate: calculateRate(aggregateMetrics.totalClicked, aggregateMetrics.totalOpened),
      icon: '🔗',
      color: 'bg-amber-50 border-amber-200',
    },
    {
      label: 'Conversions',
      value: aggregateMetrics.totalConversions.toLocaleString(),
      rate: calculateRate(aggregateMetrics.totalConversions, aggregateMetrics.totalClicked),
      icon: '🎯',
      color: 'bg-green-50 border-green-200',
    },
    {
      label: 'Bounce Rate',
      value: calculateRate(aggregateMetrics.totalBounced, aggregateMetrics.totalSent),
      icon: '⚠',
      color: 'bg-red-50 border-red-200',
    },
  ]

  if (loading) {
    return (
      <AdminLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </motion.div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-dark">Email Delivery Tracking</h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.05 }}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 90 days' : 'Custom'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricCards.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`card border-l-4 p-6 ${metric.color}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-dark">{metric.value}</p>
                </div>
                <span className="text-3xl">{metric.icon}</span>
              </div>
              {metric.rate && <p className="text-sm font-medium text-primary-500">{metric.rate} of previous</p>}
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Email Performance Timeline</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={TRACKING_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f36',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="sent" stroke="#005EB8" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="delivered" stroke="#6A5ACD" strokeWidth={2} name="Delivered" />
              <Line type="monotone" dataKey="opened" stroke="#FFC72C" strokeWidth={2} name="Opened" />
              <Line type="monotone" dataKey="clicked" stroke="#10B981" strokeWidth={2} name="Clicked" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Campaign Performance Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-6">Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Template</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Sent</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Delivered</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Opened</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Clicked</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Conversions</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, idx) => (
                  <motion.tr
                    key={metric.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    onClick={() => setSelectedMetric(metric)}
                    className="border-b border-gray-100 hover:bg-light transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-dark">{metric.templateName}</td>
                    <td className="px-6 py-4 text-gray-600">{metric.sentCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{metric.deliveredCount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">
                          ({calculateRate(metric.deliveredCount, metric.sentCount)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{metric.openedCount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">
                          ({calculateRate(metric.openedCount, metric.deliveredCount)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{metric.clickedCount.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">
                          ({calculateRate(metric.clickedCount, metric.openedCount)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-success font-semibold">{metric.conversionCount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          getDeliveryStatus(metric) === 'Excellent'
                            ? 'bg-green-100 text-green-800'
                            : getDeliveryStatus(metric) === 'Good'
                              ? 'bg-blue-100 text-blue-800'
                              : getDeliveryStatus(metric) === 'Fair'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getDeliveryStatus(metric)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detailed Metrics Panel */}
        {selectedMetric && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 border-l-4 border-primary-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-dark mb-2">{selectedMetric.templateName} - Detailed Metrics</h3>
                <p className="text-gray-600 text-sm">Sent on {selectedMetric.sentDate}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMetric(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Sent</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.sentCount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Delivered</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.deliveredCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.deliveredCount, selectedMetric.sentCount)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Opened</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.openedCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.openedCount, selectedMetric.deliveredCount)}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Clicked</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.clickedCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.clickedCount, selectedMetric.openedCount)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Bounced</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.bouncedCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.bouncedCount, selectedMetric.sentCount)}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Unsubscribed</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.unsubscribeCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.unsubscribeCount, selectedMetric.sentCount)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Conversions</p>
                <p className="text-2xl font-bold text-dark">{selectedMetric.conversionCount.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{calculateRate(selectedMetric.conversionCount, selectedMetric.clickedCount)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Conversion Value</p>
                <p className="text-2xl font-bold text-dark">£{(selectedMetric.conversionCount * 42.5).toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">Avg £42.50/conv</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
