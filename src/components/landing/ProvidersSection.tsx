import { motion } from 'framer-motion'

const providers = [
  {
    name: 'Klarna',
    fee: '2.49% + 30p',
    terms: '3-4 monthly payments',
    users: '150M+',
    description: 'Best for fashion, lifestyle, and home goods',
    color: 'from-pink-600 to-rose-600',
  },
  {
    name: 'Clearpay',
    fee: '4-6%',
    terms: '4 fortnightly payments',
    users: '20M+',
    description: 'Perfect for retail and beauty',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    name: 'PayPal Pay Later',
    fee: '~2.9%',
    terms: '4 installments',
    users: '100M+',
    description: 'For existing PayPal merchants',
    color: 'from-amber-600 to-orange-600',
  },
  {
    name: 'Stripe Installments',
    fee: '5.99-29.99% APR',
    terms: '3-24 months',
    users: '50M+',
    description: 'Flexible terms for any business',
    color: 'from-purple-600 to-indigo-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6 },
  },
}

export default function ProvidersSection() {
  return (
    <section id="providers" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            Top BNPL Providers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from the leading payment providers or we can set up multiple for you
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {providers.map((provider, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover="hover"
              className="card p-8 border-2 border-gray-200 relative overflow-hidden cursor-pointer h-full"
              initial="initial"
            >
              {/* Gradient background on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${provider.color} -z-10`}
                variants={{
                  initial: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Dark overlay for text contrast */}
              <motion.div
                className="absolute inset-0 bg-black/20 -z-10"
                variants={{
                  initial: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.4 }}
              />

              {/* Hover lift effect */}
              <motion.div
                className="absolute inset-0 -z-20"
                variants={{
                  initial: { boxShadow: '0 4px 6px rgba(0,0,0,0.07)' },
                  hover: { boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
                }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className="relative z-10"
                variants={{
                  initial: { y: 0 },
                  hover: { y: -8 },
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3
                  className="text-2xl font-bold text-dark mb-2"
                  variants={{
                    initial: { color: '#1a1a2e' },
                    hover: { color: '#ffffff' },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {provider.name}
                </motion.h3>

                <div className="mb-6">
                  <motion.div
                    className="text-3xl font-bold text-primary-500 mb-2"
                    variants={{
                      initial: { color: '#005EB8' },
                      hover: { color: '#ffffff' },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {provider.fee}
                  </motion.div>
                  <motion.p
                    className="text-sm text-gray-600"
                    variants={{
                      initial: { color: '#4b5563' },
                      hover: { color: '#ffffff' },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {provider.terms}
                  </motion.p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👥</span>
                  <motion.span
                    className="text-sm text-gray-600"
                    variants={{
                      initial: { color: '#4b5563' },
                      hover: { color: '#ffffff' },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {provider.users} users
                  </motion.span>
                </div>

                <motion.p
                  className="text-sm text-gray-600"
                  variants={{
                    initial: { color: '#4b5563' },
                    hover: { color: '#ffffff' },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {provider.description}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Custom Setup Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-100"
        >
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div>
              <h4 className="text-2xl font-bold text-dark mb-2">Custom Combinations</h4>
              <p className="text-gray-600">
                Not sure which provider is best? We recommend setting up 2-3 providers to maximize
                customer choice and conversion rates. Our Growth plan includes A/B testing to find
                the best combination for your business.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
