import { useReveal } from '../hooks/useReveal'

const INVITED_WORDS = ["You're", "invited", "to", "the", "wedding", "of"]

export default function Cover() {
  const { ref, revealed } = useReveal(0.05)

  const a = (delay: number, name = 'slideUpFade') => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `${name} 0.7s ease ${delay}ms both` : 'none',
  })

  const slideFrom = (dir: 'Left' | 'Right', delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed
      ? `slideFrom${dir} 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms both`
      : 'none',
  })

  return (
    <section id="cover" ref={ref} className={revealed ? 'revealed' : ''}>

      {/* INVITATION 배지 */}
      {/* <div style={{ marginBottom: '14px', ...a(0) }}>
        <span style={{
          display: 'inline-block',
          border: '1.5px solid var(--text-main)',
          borderRadius: '50px',
          padding: '5px 18px',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(0.6rem, 1.6vw, 0.75rem)',
          letterSpacing: '4px',
          color: 'var(--text-main)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Invitation
        </span>
      </div> */}

      {/* You're invited... - 단어별 순차 등장 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.25em',
        marginBottom: '24px',
        textTransform: 'uppercase',
      }}>
        {INVITED_WORDS.map((word, i) => (
          <span
            key={i}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)',
              fontStyle: 'italic',
              letterSpacing: '3px',
              color: 'var(--text-light)',
              display: 'inline-block',
              opacity: revealed ? undefined : 0,
              animation: revealed ? `wordFadeIn 0.5s ease ${i * 130}ms both` : 'none',
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* 이름 블록 */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>

        {/* Son Jaejoon - 왼쪽에서 슬라이드인 */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2.25rem, 9.75vw, 4.5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '1px',
          color: 'var(--text-main)',
          lineHeight: 0.85,
          margin: 0,
          ...slideFrom('Left', 250),
        }}>
          Son Jaejoon
        </h1>

        {/* and - 두 이름 사이 */}
        <div style={{ ...a(480), lineHeight: 1, margin: '0.05em 0' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(0.9rem, 3vw, 1.3rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'var(--text-light)',
          }}>
            &
          </span>
        </div>

        {/* Jang Jiseon - 오른쪽에서 슬라이드인 */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2.25rem, 9.75vw, 4.5rem)',
          fontWeight: 400,
          fontStyle: 'italic',
          letterSpacing: '1px',
          color: 'var(--text-main)',
          lineHeight: 0.85,

          
          margin: 0,
          ...slideFrom('Right', 420),
        }}>
          Jang Jiseon
        </h1>

      </div>

      {/* 사진 */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        aspectRatio: '4 / 5',
        overflow: 'hidden',
        margin: '0 auto',
        borderRadius: '12px',
        ...a(700, 'scaleIn'),
      }}>
        <img
          src="/Image/Mobile_Main.webp"
          alt="커버 사진"
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      </div>

      {/* 혼주 정보 - 사진 하단 */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
        paddingTop: '20px',
        ...a(900),
      }}>
        {/* 신부 */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', letterSpacing: '3px', color: 'var(--text-light)', marginBottom: '6px', fontStyle: 'italic' }}>Bride</p>
          <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '5px' }}>장지선</p>
          <p style={{ fontSize: '0.85rem', color: '#777', lineHeight: 1.6 }}>장경오 · 남궁선미의 딸</p>
        </div>

        {/* 구분선 */}
        <div style={{ width: '1px', backgroundColor: '#d0c8be', margin: '4px 0' }} />

        {/* 신랑 */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', letterSpacing: '3px', color: 'var(--text-light)', marginBottom: '6px', fontStyle: 'italic' }}>Groom</p>
          <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '5px' }}>손재준</p>
          <p style={{ fontSize: '0.85rem', color: '#777', lineHeight: 1.6 }}>손성규 · 김채안의 아들</p>
        </div>
      </div>

    </section>
  )
}
