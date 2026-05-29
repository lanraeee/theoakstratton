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
                      <svg className="w-6 h-6 text-transparent bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] bg-clip-text fill-current group-hover:from-white group-hover:via-white group-hover:to-white transition-all" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
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
