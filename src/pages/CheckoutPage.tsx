import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAlert } from '@/contexts/AlertContext'
import api from '@/services/api'

interface Plan {
  id: string
  name: string
  price_gbp: number
  features?: string[]
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'klarna',
    name: 'Klarna',
    icon: '🛍️',
    description: 'Pay in 4 interest-free instalments',
  },
  {
    id: 'clearpay',
    name: 'Clearpay',
    icon: '💳',
    description: 'Buy now, pay later in instalments',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '📲',
    description: 'Secure payment with PayPal',
  },
  {
    id: 'card',
    name: 'Credit Card',
    icon: '💰',
    description: 'Visa, Mastercard, Amex',
  },
]

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { success, error } = useAlert()
  const [loading, setLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<string>('klarna')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  })

  const plan = location.state?.plan as Plan | undefined

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-dark mb-4">No Plan Selected</h1>
          <p className="text-gray-600 mb-6">Please select a plan from the pricing section first.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Pricing
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      error('Name and email are required')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/checkout/create-session', {
        planId: plan.id,
        email: formData.email,
        name: formData.name,
        paymentMethod: selectedPayment,
      })

      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url
      } else {
        error('Failed to create checkout session')
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-dark mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">You're about to get started with {plan.name}</p>
          </div>

          {/* Payment Methods Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-dark mb-2">Choose How to Pay</h2>
            <p className="text-gray-600 mb-6">Select your preferred BNPL payment method:</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-lg border-2 transition-all text-center cursor-pointer ${
                    selectedPayment === method.id
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-primary-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{method.icon}</div>
                  <h3 className="font-bold text-dark mb-1">{method.name}</h3>
                  <p className="text-xs text-gray-600">{method.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Plan Details */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-4">Order Summary</h3>
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-bold text-dark mb-4">{plan.name}</h2>
                  <div className="mb-6">
                    <p className="text-4xl font-bold text-primary-500">{formatPrice(plan.price_gbp)}</p>
                    <p className="text-gray-600 text-sm">One-time payment</p>
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold text-dark text-sm">Includes:</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-700 text-sm">
                          <span className="text-success">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3">BNPL Benefits:</h4>
                  <ul className="space-y-2 text-sm text-blue-900">
                    <li className="flex items-center gap-2">
                      <span>✓</span> Split payments into smaller amounts
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✓</span> Zero interest payments
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✓</span> Fast checkout process
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✓</span> Flexible payment schedules
                    </li>
                  </ul>
                </div>
              </div>

              {/* Checkout Form */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-4">Your Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-700">Total Amount:</span>
                      <span className="font-bold text-lg text-dark">{formatPrice(plan.price_gbp)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-600">Payment Method:</span>
                      <span className="font-semibold text-dark">
                        {paymentMethods.find((m) => m.id === selectedPayment)?.name}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn btn-primary py-3 font-semibold mt-6"
                  >
                    {loading ? 'Processing...' : `Pay with ${paymentMethods.find((m) => m.id === selectedPayment)?.name}`}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    🔒 Secure payment powered by Stripe. No payment details stored.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button onClick={() => navigate('/')} className="text-primary-500 hover:text-primary-700 font-medium">
              ← Back to Pricing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
