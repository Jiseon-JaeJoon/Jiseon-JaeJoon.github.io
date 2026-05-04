import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const photos = [
  'IMG_0221.webp',
  'LCS_0002.webp', 'LCS_0240.webp', 'LCS_0340.webp', 'LCS_0436.webp',
  'LCS_0672.webp', 'LCS_0678.webp', 'LCS_0686.webp', 'LCS_0711.webp',
  'LCS_0715.webp', 'LCS_0750.webp', 'LCS_0760.webp', 'LCS_0793.webp',
  'LCS_0805.webp', 'LCS_0872.webp', 'LCS_0916.webp', 'LCS_0953.webp',
  'LCS_0967.webp', 'LCS_0980.webp', 'LCS_1011.webp', 'LCS_1070.webp',
  'LCS_1122.webp', 'LCS_1145.webp', 'LCS_1168.webp', 'LCS_1209.webp',
  'LCS_1211.webp', 'LCS_1224.webp', 'LCS_1398.webp', 'LCS_1433.webp',
  'LCS_1492.webp', 'LCS_1587.webp', 'LCS_1644.webp', 'LCS_1690.webp',
  'LCS_1691.webp', 'LCS_1888.webp', 'LCS_1991.webp', 'LCS_1998.webp',
  'LCS_2005.webp', 'LCS_2337.webp',
]

export default function Gallery() {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const open  = (idx: number) => setLightbox(idx)
  const close = () => setLightbox(null)
  const prev  = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const next  = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setTouchStartX(null)
  }

  return (
    <section style={{ padding: '80px 20px' }}>
      <h2 className="section-title">Gallery</h2>

      {/* 3×3 미리보기 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3px',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        {photos.slice(0, 9).map((filename, idx) => (
          <div
            key={filename}
            onClick={() => open(idx)}
            style={{ aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer', background: '#f0f0f0' }}
          >
            <img
              src={`/Image/webp/${filename}`}
              alt=""
              loading="lazy"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transition: 'transform 0.25s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </div>
        ))}
      </div>

      {/* 전체보기 버튼 */}
      <button
        onClick={() => open(0)}
        style={{
          marginTop: '16px', width: '100%', padding: '14px',
          border: '1px solid var(--point-color)', borderRadius: '8px',
          background: 'transparent', color: 'var(--point-color)',
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '2px',
        }}
      >
        사진 전체보기
      </button>

      {/* 라이트박스 — body에 포탈로 마운트해서 ancestor transform 영향 차단 */}
      {lightbox !== null && createPortal(
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(250, 234, 232, 0.97)',
            zIndex: 1000,
            display: 'flex', flexDirection: 'column',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* 상단 바 */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', flexShrink: 0,
              borderBottom: '1px solid rgba(200,132,154,0.2)',
            }}
          >
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontFamily: 'inherit', letterSpacing: '1px' }}>
              {lightbox + 1} / {photos.length}
            </span>
            <button
              onClick={close}
              style={{
                background: 'none', border: 'none', color: 'var(--text-light)',
                fontSize: '1.5rem', lineHeight: 1, cursor: 'pointer', padding: '4px 8px',
              }}
            >✕</button>
          </div>

          {/* 사진 + 화살표 */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, minHeight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', padding: '12px 8px',
            }}
          >
            <img
              key={lightbox}
              src={`/Image/webp/${photos[lightbox]}`}
              alt={`사진 ${lightbox + 1}`}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', display: 'block',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(180,100,120,0.15)',
              }}
            />

            <button
              onClick={prev}
              style={{
                position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(200,132,154,0.35)',
                borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--point-color)', fontSize: '1.6rem', cursor: 'pointer',
                zIndex: 1,
              }}
            >‹</button>

            <button
              onClick={next}
              style={{
                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(200,132,154,0.35)',
                borderRadius: '50%', width: '40px', height: '40px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--point-color)', fontSize: '1.6rem', cursor: 'pointer',
                zIndex: 1,
              }}
            >›</button>
          </div>

          <div style={{ height: '32px', flexShrink: 0 }} />
        </div>,
        document.body
      )}
    </section>
  )
}
