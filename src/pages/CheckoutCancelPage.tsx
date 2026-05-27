import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function CheckoutCancelPage() {
  const navigate = useNavigate()

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
          ❌
        </motion.div>

        <h1 className="text-3xl font-bold text-dark mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">Your payment was cancelled. No charges have been made to your account.</p>

        <p className="text-sm text-gray-600 mb-6">
          If you encountered any issues or have questions, please don't hesitate to contact our support team.
        </p>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/checkout', { state: { plan: null } })}
            className="flex-1 btn btn-primary"
          >
            Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex-1 btn btn-outline"
          >
            Back Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
