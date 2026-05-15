import { useReveal } from '../hooks/useReveal'

export default function Cover() {
  const { ref, revealed } = useReveal(0.1)

  const a = (delay: number, name = 'slideUpFade') => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `${name} 0.7s ease ${delay}ms both` : 'none',
  })

  return (
    <section id="cover" ref={ref} className={revealed ? 'revealed' : ''}>

      <div style={{ ...a(0) }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
          fontStyle: 'italic',
          letterSpacing: '4px',
          color: 'var(--text-light)',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          You're invited to the wedding of
        </p>
      </div>

      {/* 오벌 커버 사진 */}
      <div style={{
        width: 'clamp(200px, 40vw, 480px)',
        aspectRatio: '4 / 5',
        borderRadius: '50%',
        overflow: 'hidden',
        margin: '0 auto 40px',
        ...a(120, 'scaleIn'),
      }}>
        <img
          src="/Image/Mobile_Main.webp"
          alt="커버 사진"
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>

      {/* 이름 */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(2rem, 5vw, 3.6rem)',
        fontWeight: 300,
        fontStyle: 'italic',
        letterSpacing: '2px',
        color: 'var(--text-main)',
        lineHeight: 1.15,
        marginBottom: '36px',
        ...a(300),
      }}>
        Son Jaejun<br />
        <span style={{ fontSize: '0.55em', fontWeight: 400, color: 'var(--text-light)' }}>& </span>
        Jang Jiseon
      </h1>

      {/* 혼주 정보 */}
      <div style={{
        display: 'flex',
        gap: 'clamp(32px, 8vw, 80px)',
        justifyContent: 'center',
        ...a(480),
      }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic' }}>bride</p>
          <p style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '1rem', color: 'var(--text-main)' }}>장지선</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '5px', lineHeight: 1.6 }}>장경오 · 남궁선미의 딸</p>
        </div>
        <div style={{ width: '1px', background: '#e0e0e0', alignSelf: 'stretch' }} />
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic' }}>groom</p>
          <p style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '1rem', color: 'var(--text-main)' }}>손재준</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '5px', lineHeight: 1.6 }}>손성규 · 김채안의 아들</p>
        </div>
      </div>

    </section>
  )
}
