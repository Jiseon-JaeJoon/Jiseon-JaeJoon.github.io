import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReveal } from '../hooks/useReveal'

const photos = [
  'IMG_0221.webp', 'IMG_0250.webp',
  'LCS_0240.webp', 'LCS_0340.webp', 'LCS_0672.webp', 'LCS_0678.webp',
  'LCS_0711.webp', 'LCS_0760.webp', 'LCS_0793.webp',
  'LCS_0980.webp',
  'LCS_1122.webp', 'LCS_1145.webp', 'LCS_1168.webp', 'LCS_1209.webp',
  'LCS_1398.webp', 'LCS_1523.webp',
  'LCS_1587.webp', 'LCS_1644.webp', 'LCS_1888.webp', 'LCS_1991.webp',
  'LCS_1998.webp', 'LCS_2337.webp',
]

const GAP = 10

export default function Gallery() {
  const { ref, revealed } = useReveal(0.1)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [carouselIdx, setCarouselIdx] = useState(photos.length)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lbTouchStart, setLbTouchStart] = useState<number | null>(null)
  
  const isDraggingRef = useRef(false)
  const lastTouchPosRef = useRef<number | null>(null)

  const startDragging = (position: number) => {
    isDraggingRef.current = true
    lastTouchPosRef.current = position
    setIsDragging(true)
  }

  const stopDragging = () => {
    isDraggingRef.current = false
    lastTouchPosRef.current = null
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) {
      setLbTouchStart(null)
      return
    }
    setLbTouchStart(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (lbTouchStart === null) return
    const diff = lbTouchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextLb()
      else prevLb()
    }
    setLbTouchStart(null)
  }

  const open = (idx: number) => setLightbox(idx)
  const close = () => setLightbox(null)
  const prevLb = () => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null)
  const nextLb = () => setLightbox(i => i !== null ? (i + 1) % photos.length : null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const initial = el.getBoundingClientRect().width
    if (initial > 0) setContainerWidth(initial)
    const ro = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!revealed) return
    // Reset the carousel at the moment the gallery first comes into view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarouselIdx(photos.length)
  }, [revealed])

  useEffect(() => {
    if (!revealed || lightbox !== null) return
    let lastTime = performance.now()
    let frameId: number
    const speed = 0.15 // 1초에 이동할 이미지 갯수 (조금 더 느리게 수정)

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time
      
      if (!isDraggingRef.current) {
        setCarouselIdx(prev => {
          let next = prev + speed * delta
          if (next >= photos.length * 2) {
            next -= photos.length
          } else if (next <= 0) {
            next += photos.length
          }
          return next
        })
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [revealed, lightbox])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevLb()
      if (e.key === 'ArrowRight') nextLb()
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lightbox === null) return

    const preventPinchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault()
    }
    const preventGesture = (event: Event) => event.preventDefault()
    const nonPassiveOptions: AddEventListenerOptions = { passive: false }

    document.addEventListener('touchmove', preventPinchZoom, nonPassiveOptions)
    document.addEventListener('gesturestart', preventGesture, nonPassiveOptions)
    document.addEventListener('gesturechange', preventGesture, nonPassiveOptions)
    document.addEventListener('gestureend', preventGesture, nonPassiveOptions)

    return () => {
      document.removeEventListener('touchmove', preventPinchZoom, nonPassiveOptions)
      document.removeEventListener('gesturestart', preventGesture, nonPassiveOptions)
      document.removeEventListener('gesturechange', preventGesture, nonPassiveOptions)
      document.removeEventListener('gestureend', preventGesture, nonPassiveOptions)
    }
  }, [lightbox !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const photoWidth = containerWidth * 0.55
  const offset = containerWidth > 0
    ? (containerWidth - photoWidth) / 2 - carouselIdx * (photoWidth + GAP)
    : 0

  const extendedPhotos = [...photos, ...photos, ...photos]

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
        onTouchStart={e => {
          if (e.touches.length !== 1) {
            stopDragging()
            return
          }
          startDragging(e.touches[0].clientX)
        }}
        onTouchMove={e => {
          if (!isDraggingRef.current || lastTouchPosRef.current === null) return
          const current = e.touches[0].clientX
          const diff = lastTouchPosRef.current - current
          lastTouchPosRef.current = current
          if (photoWidth > 0) {
            setCarouselIdx(prev => prev + diff / (photoWidth + GAP))
          }
        }}
        onTouchEnd={() => {
          stopDragging()
        }}
        onMouseDown={e => {
          startDragging(e.clientX)
        }}
        onMouseMove={e => {
          if (!isDraggingRef.current || lastTouchPosRef.current === null) return
          const current = e.clientX
          const diff = lastTouchPosRef.current - current
          lastTouchPosRef.current = current
          if (photoWidth > 0) {
            setCarouselIdx(prev => prev + diff / (photoWidth + GAP))
          }
        }}
        onMouseUp={() => {
          stopDragging()
        }}
        onMouseLeave={() => {
          stopDragging()
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: `${GAP}px`,
            // transform이 매 프레임 업데이트되므로 transition은 제거
            transform: `translateX(${offset}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {extendedPhotos.map((filename, idx) => {
            const isCenter = idx === Math.round(carouselIdx);
            return (
              <div
                key={`${filename}-${idx}`}
                onClick={(e) => {
                  if (isDraggingRef.current && lastTouchPosRef.current !== null) {
                    // 드래그 중 클릭 방지
                    e.preventDefault();
                    return;
                  }
                  open(idx % photos.length)
                }}
                style={{
                  flexShrink: 0,
                  width: `${photoWidth}px`,
                  height: `${photoWidth * (4 / 3)}px`,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  opacity: isCenter ? 1 : 0.55,
                  transform: isCenter ? 'scale(1)' : 'scale(0.93)',
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <img
                  src={`/Image/webp/${filename}`}
                  alt=""
                  loading={idx < 4 ? 'eager' : 'lazy'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                />
              </div>
            )
          })}
        </div>

      </div>

      {/* 전체보기 버튼 */}
      <button
        onClick={() => open(Math.round(carouselIdx) % photos.length)}
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
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
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
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />

            <div onClick={e => { e.stopPropagation(); prevLb() }} style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 1, WebkitTapHighlightColor: 'transparent' }} />
            <div onClick={e => { e.stopPropagation(); nextLb() }} style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'pointer', zIndex: 1, WebkitTapHighlightColor: 'transparent' }} />
          </div>

          <div style={{ height: '32px', flexShrink: 0 }} />
        </div>,
        document.body
      )}
    </section>
  )
}
