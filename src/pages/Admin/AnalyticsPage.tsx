import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/services/api'
import { useAlert } from '@/contexts/AlertContext'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState([
    { label: 'Total Leads', value: '0', trend: '0%', color: 'from-primary-500 to-primary-600' },
    { label: 'Conversion Rate', value: '0%', trend: '0%', color: 'from-secondary-500 to-secondary-600' },
    { label: 'Avg. Lead Value', value: '£0', trend: '0%', color: 'from-accent-500 to-accent-600' },
    { label: 'Revenue This Month', value: '£0', trend: '0%', color: 'from-green-500 to-green-600' },
  ])
  const [trendData, setTrendData] = useState<any[]>([])
  const { error } = useAlert()

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch leads data
      const leadsRes = await api.get('/api/admin/leads')
      const leads = leadsRes.data || []

      // Fetch orders data
      const ordersRes = await api.get('/api/admin/orders')
      const orders = ordersRes.data || []

      const totalLeads = leads.length
      const qualifiedLeads = leads.filter((l: any) => l.status === 'qualified' || l.status === 'customer').length
      const customers = leads.filter((l: any) => l.status === 'customer').length

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.amount_gbp || 0), 0)
      const conversionRate = totalLeads > 0 ? ((customers / totalLeads) * 100).toFixed(1) : '0'
      const avgLeadValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : '0'

      setMetrics([
        { label: 'Total Leads', value: totalLeads.toString(), trend: '+0%', color: 'from-primary-500 to-primary-600' },
        { label: 'Conversion Rate', value: `${conversionRate}%`, trend: '+0%', color: 'from-secondary-500 to-secondary-600' },
        { label: 'Avg. Lead Value', value: `£${avgLeadValue}`, trend: '+0%', color: 'from-accent-500 to-accent-600' },
        { label: 'Revenue This Month', value: `£${totalRevenue.toLocaleString()}`, trend: '+0%', color: 'from-green-500 to-green-600' },
      ])

      // Generate trend data from leads
      const trendMap: { [key: string]: any } = {}
      leads.forEach((lead: any) => {
        const date = new Date(lead.created_at || lead.date)
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' })
        if (!trendMap[dateStr]) {
          trendMap[dateStr] = { date: dateStr, leads: 0, contacts: 0, waitlist: 0 }
        }
        if (lead.source === 'contact') trendMap[dateStr].contacts++
        else if (lead.source === 'waitlist') trendMap[dateStr].waitlist++
        trendMap[dateStr].leads++
      })

      setTrendData(Object.values(trendMap).slice(-7))
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <AdminLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Date Range Selector */}
        <motion.div variants={itemVariants} className="flex gap-2">
          {['7d', '30d', '90d', 'custom'].map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                dateRange === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-500'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Custom'}
            </motion.button>
          ))}
        </motion.div>

        {/* Key Metrics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`card p-6 border-l-4 bg-gradient-to-br ${metric.color} border-transparent hover:shadow-lg transition-all`}
            >
              <p className="text-white/80 text-sm mb-2">{metric.label}</p>
              <p className="text-3xl font-bold text-white mb-2">{metric.value}</p>
              <p className="text-white/60 text-sm">{metric.trend} from last period</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads Trend */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Leads Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={leadsTrendData}>
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
                <Legend />
                <Area type="monotone" dataKey="leads" fill="#005EB8" stroke="#005EB8" opacity={0.3} />
                <Line type="monotone" dataKey="leads" stroke="#005EB8" strokeWidth={2} dot={{ fill: '#005EB8' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-dark mb-4">Payment Methods Used</h3>
            <div className="space-y-4">
              {paymentMethodsData.map((method, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{method.name}</span>
                    <span className="text-sm font-bold text-primary-500">{method.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${method.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{method.value} transactions</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={conversionFunnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="stage" type="category" stroke="#9ca3af" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f36',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="value" fill="#005EB8" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* Conversion Rates */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stage: 'Leads → Contacted', rate: '60%' },
              { stage: 'Contacted → Qualified', rate: '56%' },
              { stage: 'Qualified → Customer', rate: '54%' },
              { stage: 'Overall Conversion', rate: '18%' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-light rounded-lg text-center"
              >
                <p className="text-sm text-gray-600 mb-1">{item.stage}</p>
                <p className="text-2xl font-bold text-primary-500">{item.rate}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Email Performance */}
        <motion.div variants={itemVariants} className="card p-6">
          <h3 className="text-xl font-bold text-dark mb-4">Email Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Sent', value: 2847, color: 'text-blue-600' },
              { label: 'Delivered', value: 2756, color: 'text-green-600' },
              { label: 'Open Rate', value: '32%', color: 'text-purple-600' },
              { label: 'Click Rate', value: '8.2%', color: 'text-orange-600' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-4 bg-light rounded-lg"
              >
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}
