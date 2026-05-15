const sections = [
  { id: 'cover',     label: '초대' },
  { id: 'greeting',  label: '인사말' },
  { id: 'calendar',  label: '일정' },
  { id: 'gallery',   label: '갤러리' },
  { id: 'location',  label: '오시는 길' },
  { id: 'transport', label: '교통' },
  { id: 'rsvp',      label: '참석' },
  { id: 'account',   label: '마음전하기' },
  { id: 'guestbook', label: '방명록' },
]

export default function Navigation() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <div className="nav-inner" style={{
          display: 'flex',
          gap: 'clamp(14px, 2.8vw, 36px)',
          overflowX: 'auto',
          padding: '0 20px',
        }}>
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.7rem',
                letterSpacing: '1.5px',
                color: '#111',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                padding: '4px 0',
                opacity: 0.72,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
