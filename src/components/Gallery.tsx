import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReveal } from '../hooks/useReveal'

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

const GAP = 10

export default function Gallery() {
  const { ref, revealed } = useReveal(0.1)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lbTouchStart, setLbTouchStart] = useState<number | null>(null)
  const [carTouchStart, setCarTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => setLbTouchStart(e.touches[0].clientX)
  const handleTouchEnd   = (e: React.TouchEvent) => {
    if (lbTouchStart === null) return
    const diff = lbTouchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? nextLb() : prevLb()
    setLbTouchStart(null)
  }

  const open  = (idx: number) => setLightbox(idx)
  const close = () => setLightbox(null)
  const prevLb = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const nextLb = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)
  const prevCar = () => setCarouselIdx(i => (i - 1 + photos.length) % photos.length)
  const nextCar = () => setCarouselIdx(i => (i + 1) % photos.length)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (lightbox !== null) return
    const timer = setInterval(nextCar, 3000)
    return () => clearInterval(timer)
  }, [lightbox]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prevLb()
      if (e.key === 'ArrowRight') nextLb()
      if (e.key === 'Escape')     close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const photoWidth = containerWidth * 0.55
  const offset = containerWidth > 0
    ? (containerWidth - photoWidth) / 2 - carouselIdx * (photoWidth + GAP)
    : 0

  return (
    <section id="gallery" ref={ref} className={`dark-section${revealed ? ' revealed' : ''}`} style={{ padding: 'clamp(60px, 10vh, 120px) 0' }}>
      <h2
        className="section-title"
        style={{
          padding: '0 clamp(20px, 7vw, 120px)',
          marginBottom: '6px',
          opacity: revealed ? undefined : 0,
          animation: revealed ? 'slideUpFade 0.6s ease 0ms both' : 'none',
        }}
      >Gallery</h2>
      <p style={{
        padding: '0 clamp(20px, 7vw, 120px)',
        fontFamily: "'Gowun Batang', serif",
        fontSize: '1.25rem',
        letterSpacing: '3px',
        color: 'var(--text-light)',
        marginBottom: '32px',
        opacity: revealed ? undefined : 0,
        animation: revealed ? 'slideUpFade 0.6s ease 80ms both' : 'none',
      }}>갤러리</p>

      {/* 가로 슬라이드 캐러셀 */}
      <div
        ref={containerRef}
        style={{ position: 'relative', overflow: 'hidden', visibility: containerWidth === 0 ? 'hidden' : 'visible' }}
        onTouchStart={e => setCarTouchStart(e.touches[0].clientX)}
        onTouchEnd={e => {
          if (carTouchStart === null) return
          const diff = carTouchStart - e.changedTouches[0].clientX
          if (Math.abs(diff) > 50) diff > 0 ? nextCar() : prevCar()
          setCarTouchStart(null)
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(${offset}px)`,
          }}
        >
          {photos.map((filename, idx) => (
            <div
              key={filename}
              onClick={() => open(idx)}
              style={{
                flexShrink: 0,
                width: `${photoWidth}px`,
                aspectRatio: '3/4',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: idx === carouselIdx ? 1 : 0.55,
                transform: idx === carouselIdx ? 'scale(1)' : 'scale(0.93)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <img
                src={`/Image/webp/${filename}`}
                alt=""
                loading={idx < 4 ? 'eager' : 'lazy'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>

      </div>

      {/* 전체보기 버튼 */}
      <button
        onClick={() => open(carouselIdx)}
        style={{
          marginTop: '12px', width: 'calc(100% - clamp(40px, 14vw, 240px))', marginLeft: 'clamp(20px, 7vw, 120px)', padding: '14px',
          border: '1px solid var(--point-color)', borderRadius: '8px',
          background: 'transparent', color: 'var(--point-color)',
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '2px', display: 'block',
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
            backgroundColor: 'rgba(245, 245, 245, 0.97)',
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
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              padding: '14px 20px', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              color: 'var(--text-light)', fontSize: '0.72rem', fontFamily: 'inherit',
              letterSpacing: '0.5px', opacity: 0.7, whiteSpace: 'nowrap',
            }}>
              이미지를 넘기려면 양끝을 클릭하거나 스와이프하세요
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
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            />

            <div onClick={e => { e.stopPropagation(); prevLb() }} style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
            <div onClick={e => { e.stopPropagation(); nextLb() }} style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 1 }} />
          </div>

          <div style={{ height: '32px', flexShrink: 0 }} />
        </div>,
        document.body
      )}
    </section>
  )
}
