import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import api from '@/services/api'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  stat1: string
  stat2: string
  stat3: string
  backgroundType: 'gradient' | 'image'
  backgroundGradient?: string
  backgroundImage?: string
  displayOrder: number
}

const BRAND = {
  blue: '#005EB8',
  gold: '#FFC72C',
  purple: '#6A5ACD',
}

const SLIDE_DURATION = 9000 // ms per slide

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Help Your Customers Buy More',
    subtitle: 'Offer BNPL payment plans with zero upfront cost and immediate payment to you',
    stat1: '+30% Conversion Increase',
    stat2: '+40% Average Order Value',
    stat3: '7 days Setup Time',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #0a1628 0%, #1a1f36 50%, #0d0d1a 100%)',
    displayOrder: 0,
  },
  {
    id: '2',
    title: 'No Risk to You — Ever',
    subtitle: 'Get paid immediately while BNPL providers handle all credit risk and repayment',
    stat1: '100% Payment Guaranteed',
    stat2: '0% Credit Risk',
    stat3: '72hr Settlement',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a1228 50%, #0a0f1e 100%)',
    displayOrder: 1,
  },
  {
    id: '3',
    title: 'Multiple Payment Options',
    subtitle: 'Offer every major payment format — from split payments to extended credit terms',
    stat1: '4+ Payment Methods',
    stat2: '50M+ Active Users',
    stat3: '$2B+ Volume',
    backgroundType: 'gradient',
    backgroundGradient: 'linear-gradient(135deg, #0a1020 0%, #111827 50%, #0d1117 100%)',
    displayOrder: 2,
  },
]

const SLIDE_ACCENTS = [
  { orb1: 'rgba(0,94,184,0.55)', orb2: 'rgba(106,90,205,0.35)', stat: BRAND.blue },
  { orb1: 'rgba(106,90,205,0.55)', orb2: 'rgba(255,199,44,0.2)', stat: BRAND.purple },
  { orb1: 'rgba(0,94,184,0.4)', orb2: 'rgba(0,242,254,0.25)', stat: '#00c9ff' },
]

const SLIDE_ICONS = ['💳', '🛡️', '⚡']

// Staggered text reveal — child variants
const wordVariants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.08 + 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

const statVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1 + 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

function AnimatedWords({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

function StatCard({
  stat,
  index,
  accentColor,
}: {
  stat: string
  index: number
  accentColor: string
}) {
  const [value, ...labelParts] = stat.split(' ')
  const label = labelParts.join(' ')

  return (
    <motion.div
      custom={index}
      variants={statVariants}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${accentColor}40`,
        borderRadius: 16,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 24px ${accentColor}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
        padding: '16px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 'clamp(1.1rem, 3.5vw, 1.75rem)',
          fontWeight: 900,
          color: accentColor,
          lineHeight: 1,
          letterSpacing: -0.5,
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 'clamp(0.6rem, 1.8vw, 0.8rem)',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.3,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </motion.div>
  )
}

export default function Hero3DSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(Date.now())
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    api
      .get('/api/landing-content')
      .then((res) => {
        if (res.data.hero_content) {
          const parsed = JSON.parse(res.data.hero_content)
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-advance + progress bar
  useEffect(() => {
    if (loading || prefersReduced) return

    startRef.current = Date.now()
    setProgress(0)

    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - startRef.current
      setProgress(Math.min(elapsed / SLIDE_DURATION, 1))
      if (elapsed < SLIDE_DURATION) {
        requestAnimationFrame(tick)
      }
    })

    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % slides.length)
      startRef.current = Date.now()
      setProgress(0)
    }, SLIDE_DURATION)

    return () => {
      clearInterval(timerRef.current!)
      cancelAnimationFrame(raf)
    }
  }, [slides.length, loading, current, prefersReduced])

  const paginate = (dir: number) => {
    clearInterval(timerRef.current!)
    setDirection(dir)
    setCurrent((prev) => (prev + dir + slides.length) % slides.length)
    startRef.current = Date.now()
    setProgress(0)
  }

  const goTo = (idx: number) => {
    if (idx === current) return
    clearInterval(timerRef.current!)
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
    startRef.current = Date.now()
    setProgress(0)
  }

  if (loading) {
    return (
      <section
        className="relative min-h-[100svh] pt-16 flex flex-col"
        style={{ background: '#0D1117' }}
      >
        <div className="flex-1 flex flex-col justify-center items-center px-6 animate-pulse">
          <div className="w-full max-w-3xl text-center">
            <div className="h-12 bg-white/10 rounded-xl mb-6 mx-auto max-w-lg" />
            <div className="h-6 bg-white/10 rounded mb-3 max-w-md mx-auto" />
            <div className="h-6 bg-white/10 rounded mb-10 max-w-sm mx-auto" />
            <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 bg-white/10 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const slide = slides[current] ?? slides[0]
  const accent = SLIDE_ACCENTS[current % SLIDE_ACCENTS.length]

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 0.97,
      x: prefersReduced ? 0 : dir > 0 ? 80 : -80,
      filter: 'blur(4px)',
    }),
    center: { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.97,
      x: prefersReduced ? 0 : dir > 0 ? -80 : 80,
      filter: 'blur(4px)',
    }),
  }

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] pt-16 overflow-hidden flex flex-col"
      style={{ background: '#0D1117' }}
    >
      {/* Gold top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple}, ${BRAND.gold})`,
          transformOrigin: 'left',
          zIndex: 10,
        }}
      />

      {/* Slide background crossfade */}
      <AnimatePresence>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute inset-0"
          style={{ background: slide.backgroundGradient ?? '#0D1117' }}
        />
      </AnimatePresence>

      {/* Animated orbs */}
      <AnimatePresence>
        <motion.div
          key={`orb1-${current}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: [1, 1.15, 1] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-8%',
            width: 'min(70vw, 600px)',
            height: 'min(70vw, 600px)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent.orb1} 0%, transparent 70%)`,
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>
      <AnimatePresence>
        <motion.div
          key={`orb2-${current}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: [1.15, 1, 1.15] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, scale: { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: 'min(80vw, 700px)',
            height: 'min(80vw, 700px)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent.orb2} 0%, transparent 70%)`,
            filter: 'blur(2px)',
            pointerEvents: 'none',
          }}
        />
      </AnimatePresence>

      {/* Floating sparkles */}
      {!prefersReduced && [0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={`spark-${i}`}
          animate={{
            y: [-20, 20, -20],
            x: [0, i % 2 === 0 ? 12 : -12, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: `${15 + i * 18}%`,
            left: `${5 + i * 20}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            borderRadius: '50%',
            background: i % 3 === 0 ? BRAND.gold : i % 3 === 1 ? BRAND.blue : BRAND.purple,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-10" style={{ zIndex: 2 }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-white max-w-4xl mx-auto w-full"
          >
            {/* Slide icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 18 }}
              style={{
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                marginBottom: 16,
                display: 'block',
              }}
            >
              {SLIDE_ICONS[current % SLIDE_ICONS.length]}
            </motion.div>

            {/* Eyebrow label */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.2em' }}
              transition={{ delay: 0.08, duration: 0.5 }}
              style={{
                fontSize: 'clamp(0.6rem, 2vw, 0.85rem)',
                fontWeight: 700,
                color: BRAND.gold,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginBottom: 12,
              }}
            >
              Oak<span style={{ color: '#ffffff' }}>stratton</span> · BNPL Setup Service
            </motion.div>

            {/* Title — word-by-word reveal */}
            <motion.h1
              initial="hidden"
              animate="visible"
              style={{
                fontSize: 'clamp(1.8rem, 6vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                marginBottom: 20,
                textShadow: `0 0 60px ${accent.orb1.replace('0.55', '0.5')}`,
              }}
            >
              <AnimatedWords text={slide.title} />
            </motion.h1>

            {/* Gold underline accent */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: 3,
                width: 120,
                background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.blue})`,
                borderRadius: 2,
                margin: '0 auto 20px',
                transformOrigin: 'left',
              }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.55,
                maxWidth: 560,
                margin: '0 auto 32px',
                padding: '0 4px',
              }}
            >
              {slide.subtitle}
            </motion.p>

            {/* Stat cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-8"
            >
              {[slide.stat1, slide.stat2, slide.stat3].map((stat, idx) => (
                <StatCard key={idx} stat={stat} index={idx} accentColor={accent.stat} />
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            >
              <motion.a
                href="#pricing"
                whileHover={{ scale: 1.05, boxShadow: `0 0 32px ${BRAND.gold}60` }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: `linear-gradient(135deg, ${BRAND.gold} 0%, #ffb000 100%)`,
                  color: '#0D1117',
                  fontWeight: 800,
                  fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)',
                  padding: '14px 32px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  display: 'inline-block',
                  letterSpacing: '-0.01em',
                  boxShadow: `0 4px 20px ${BRAND.gold}40`,
                  transition: 'box-shadow 0.2s',
                }}
              >
                Get Started — from £599
              </motion.a>
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.03, borderColor: 'rgba(255,255,255,0.6)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 600,
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  padding: '13px 28px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  display: 'inline-block',
                  border: '1px solid rgba(255,255,255,0.25)',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(255,255,255,0.06)',
                }}
              >
                See how it works →
              </motion.a>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Progress + navigation */}
        <div className="flex flex-col items-center gap-3 mt-8">
          {/* Slide indicators with progress */}
          <div className="flex gap-3 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  position: 'relative',
                  height: 4,
                  width: idx === current ? 48 : 16,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                {idx === current && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: BRAND.gold,
                      transformOrigin: 'left',
                      scaleX: progress,
                    }}
                  />
                )}
                {idx !== current && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                width: 44,
                height: 44,
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => paginate(1)}
              aria-label="Next slide"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 12,
                width: 44,
                height: 44,
                color: '#fff',
                fontSize: 18,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              →
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
