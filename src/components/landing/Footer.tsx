import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '@/services/api'

interface FooterContent {
  tagline?: string
  companySummary?: string
  madeWithText?: string
}

const defaultLinks = {
  Product: ['Features', 'Pricing', 'Providers', 'Security'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Compliance'],
  Social: [
    { name: 'Twitter', url: 'www.x.com/@oakstratton' },
    { name: 'Instagram', url: 'www.instagram.com/oakstratton' },
    { name: 'Email', url: 'mailto:oakstratton@belloite.co.uk' },
  ],
}

const defaultContent: FooterContent = {
  tagline: 'Oakstratton Solutions',
  companySummary: 'Providing bespoke BNPL payment integration tailored to optimize business operations for up orth profitability.',
  madeWithText: 'Made with ❤️ by <a href= "https://www.belloite.co.uk" target = "_blank"> Belloite Holdings </a>. Helping small businesses compete globally.',
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [content, setContent] = useState<FooterContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterContent()

    // Refetch footer content when page becomes visible (user returns from admin dashboard)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchFooterContent()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchFooterContent = async () => {
    try {
      const response = await api.get('/api/landing-content')
      const data = response.data

      if (data.footer_content) {
        try {
          const parsed = JSON.parse(data.footer_content)
          setContent({ ...defaultContent, ...parsed })
        } catch (e) {
          setContent(defaultContent)
        }
      }
    } catch (error) {
      console.error('Failed to fetch footer content:', error)
      setContent(defaultContent)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <footer className="bg-dark text-gray-300 border-t border-gray-800">
        <div className="container py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded max-w-xs"></div>
            <div className="h-4 bg-gray-700 rounded max-w-sm"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-dark text-gray-300 border-t border-gray-800">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gradient mb-2">
              {content.tagline || 'Oakstratton Solutions'}
            </h3>
            <p className="text-sm text-gray-400">
              {content.companySummary || defaultContent.companySummary}
            </p>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-start md:items-end justify-start"
          >
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-6">
              {defaultLinks.Social.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ scale: 1.15, rotateY: 20 }}
                  className="w-12 h-12 group relative"
                  style={{ perspective: '1000px' }}
                  title={social.name}
                >
                  <motion.div
                    className="w-full h-full flex items-center justify-center relative"
                    whileHover={{ y: -2 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,94,184,0.3) 0%, rgba(102,126,234,0.3) 100%)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    {social.name === 'Twitter' && (
                      <svg className="w-6 h-6 text-[#1DA1F2] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-9.8 7C2 15.5-1 8 3 5c3.6 3.1 7 3 7 3a10.9 10.9 0 01-2-10z" />
                      </svg>
                    )}
                    {social.name === 'Instagram' && (
                      <svg className="w-6 h-6 text-pink-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                      </svg>
                    )}
                    {social.name === 'Email' && (
                      <svg className="w-6 h-6 text-orange-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    )}
                  </motion.div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} Oakstratton Solutions (Belloite Ltd). All rights reserved.
          </p>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-white/5 rounded-lg text-center text-xs text-gray-400"
        >
          {content.madeWithText || defaultContent.madeWithText}
        </motion.div>
      </div>
    </footer>
  )
}
