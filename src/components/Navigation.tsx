import { useEffect, useRef, useState } from 'react'

const sections = [
  { id: 'cover',     label: '초대' },
  { id: 'greeting',  label: '인사말' },
  { id: 'calendar',  label: '일정' },
  { id: 'gallery',   label: '갤러리' },
  { id: 'location',  label: '오시는 길' },
  { id: 'rsvp',      label: '참석 여부' },
  { id: 'account',   label: '마음 전하기' },
  { id: 'guestbook', label: '방명록' },
]

const NAV_HEIGHT = 56

export default function Navigation() {
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState<string>('cover')
  const targetY = useRef<number | null>(null)
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 10)

      // 목표 위치에 도달했거나 근처면 블록 해제
      if (targetY.current !== null) {
        if (Math.abs(window.scrollY - targetY.current) < 10) {
          targetY.current = null
          if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
        }
        return
      }

      const baseline = window.scrollY + NAV_HEIGHT + 8
      let current = sections[0].id
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top + window.scrollY <= baseline) {
          current = id
        }
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    setActiveId(id)

    const top = Math.round(el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT)
    targetY.current = top

    // 혹시 스크롤이 정확히 안 닿는 경우 대비 fallback
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
    fallbackTimer.current = setTimeout(() => {
      targetY.current = null
    }, 2000)

    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <>
      <style>{`
        .nav-inner::-webkit-scrollbar { display: none; }
        .nav-inner { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: `${NAV_HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
      }}>
        <div className="nav-inner" style={{
          display: 'flex',
          gap: 'clamp(14px, 2.8vw, 36px)',
          overflowX: 'auto',
          padding: '0 20px',
        }}>
          {sections.map(({ id, label }) => {
            const isActive = activeId === id
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.7rem',
                  letterSpacing: '1.5px',
                  color: isActive ? 'var(--point-color)' : '#111',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  padding: '4px 0',
                  opacity: isActive ? 1 : 0.72,
                  fontWeight: isActive ? 700 : 400,
                  borderBottom: isActive ? '1.5px solid var(--point-color)' : '1.5px solid transparent',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
