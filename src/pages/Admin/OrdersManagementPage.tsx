import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  amount_gbp: number
  status: string
  created_at: string
}

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { error } = useAlert()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/admin/orders')
      setOrders(response.data)
    } catch (err) {
      error('Failed to fetch orders')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
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
        <div>
          <h2 className="text-3xl font-bold text-dark">Orders</h2>
          <p className="text-gray-600">Total Orders: {orders.length}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-primary-500">
              {formatPrice(orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.amount_gbp, 0))}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Completed Orders</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter((o) => o.status === 'completed').length}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter((o) => o.status === 'pending').length}</p>
          </div>
          <div className="card p-4">
            <p className="text-gray-600 text-sm">Failed Orders</p>
            <p className="text-2xl font-bold text-red-600">{orders.filter((o) => o.status === 'failed').length}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Order Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <motion.tr
                    key={order.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="border-b border-gray-100 hover:bg-light transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-4 px-4 font-medium text-dark">{order.order_number}</td>
                    <td className="py-4 px-4">{order.customer_name || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600">{order.customer_email}</td>
                    <td className="py-4 px-4 font-semibold">{formatPrice(order.amount_gbp)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{formatDate(order.created_at)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-dark mb-6">Order Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Order Number</p>
                  <p className="text-lg font-semibold text-dark">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Customer Name</p>
                  <p className="text-lg font-semibold text-dark">{selectedOrder.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-lg font-semibold text-dark">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className="text-lg font-semibold text-primary-500">{formatPrice(selectedOrder.amount_gbp)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="text-lg font-semibold text-dark">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-full btn btn-primary mt-6">
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  )
}
