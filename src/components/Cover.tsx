import { useReveal } from '../hooks/useReveal'

export default function Cover() {
  const { ref, revealed } = useReveal(0.1)

  const a = (delay: number, name = 'slideUpFade') => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `${name} 0.7s ease ${delay}ms both` : 'none',
  })

  return (
    <section ref={ref} className={revealed ? 'revealed' : ''}>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", textAlign: 'center', marginBottom: '32px', ...a(0) }}>
        <p style={{ fontSize: 'clamp(0.85rem, 1.2vw, 1.2rem)', fontStyle: 'italic', letterSpacing: '4px', color: 'var(--point-color)', fontWeight: 400, textTransform: 'uppercase' }}>
          Wedding Invitation
        </p>
      </div>

      <div style={{ borderRadius: '12px', overflow: 'hidden', maxWidth: '760px', margin: '0 auto', ...a(120, 'scaleIn') }}>
        <img
          src="/Image/Mobile_Main.webp"
          alt="커버 사진"
          style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '36px', color: 'var(--text-main)' }}>
        <h1 style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)', fontWeight: '400', letterSpacing: '4px', ...a(340) }}>
          손재준 <span style={{ fontSize: '1.2rem', margin: '0 16px', color: '#c8c8c8', fontWeight: '200' }}>|</span> 장지선
        </h1>
      </div>

    </section>
  )
}
