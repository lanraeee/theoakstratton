import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '@/services/api'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      navigate('/404')
      return
    }

    const fetchOrderInfo = async () => {
      try {
        const response = await api.get(`/api/checkout/session-details?session_id=${sessionId}`)
        setOrderInfo(response.data)
      } catch (err) {
        console.error('Failed to fetch order info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderInfo()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl mb-4 flex justify-center"
        >
          ✅
        </motion.div>

        <h1 className="text-3xl font-bold text-dark mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Thank you for your payment. Your order has been received.</p>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          orderInfo && (
            <div className="bg-light p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Email:</strong> {orderInfo.email}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Plan:</strong> {orderInfo.plan_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Amount:</strong> £{orderInfo.amount}
              </p>
            </div>
          )
        )}

        <p className="text-sm text-gray-600 mb-6">
          A confirmation email has been sent to your inbox. Our team will be in touch shortly.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="w-full btn btn-primary"
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  )
}
