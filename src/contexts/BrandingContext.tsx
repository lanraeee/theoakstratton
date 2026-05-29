import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import api from '@/services/api'

interface BrandingData {
  logoType: 'text' | 'image'
  logoText: string
  logoUrl: string
  faviconUrl: string
}

interface BrandingContextType {
  branding: BrandingData
  updateBranding: (data: BrandingData) => Promise<void>
  loading: boolean
  refetch: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

const DEFAULT_BRANDING: BrandingData = {
  logoType: 'text',
  logoText: 'Oakstratton',
  logoUrl: '',
  faviconUrl: '',
}

const setFavicon = (url: string) => {
  if (!url) return
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
  if (link) {
    link.href = url
    link.type = url.endsWith('.svg') ? 'image/svg+xml' : 'image/x-icon'
  }
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING)
  const [loading, setLoading] = useState(true)

  const fetchBranding = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/landing-content')
      const data = response.data

      // API returns nested structure: { branding: { branding: "..." } }
      const brandingData = data?.branding?.branding || data?.branding

      if (brandingData) {
        try {
          const parsed = typeof brandingData === 'string' ? JSON.parse(brandingData) : brandingData
          const brandingObj: BrandingData = {
            logoType: parsed?.logoType || 'text',
            logoText: parsed?.logoText || 'Oakstratton',
            logoUrl: parsed?.logoUrl || '',
            faviconUrl: parsed?.faviconUrl || '',
          }
          setBranding(brandingObj)
          if (brandingObj.faviconUrl) {
            setFavicon(brandingObj.faviconUrl)
          }
        } catch (e) {
          console.error('Failed to parse branding:', e)
          setBranding(DEFAULT_BRANDING)
        }
      } else {
        setBranding(DEFAULT_BRANDING)
      }
    } catch (err) {
      console.error('Failed to fetch branding:', err)
      setBranding(DEFAULT_BRANDING)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBranding()
  }, [fetchBranding])

  const updateBranding = useCallback(async (data: BrandingData) => {
    setBranding(data)
    if (data.faviconUrl) {
      setFavicon(data.faviconUrl)
    }
  }, [])

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, loading, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider')
  }
  return context
}
