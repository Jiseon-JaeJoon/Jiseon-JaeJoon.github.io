import { useState } from 'react'

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
  const [current, setCurrent] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length)
  const next = () => setCurrent(i => (i + 1) % photos.length)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setTouchStartX(null)
  }

  const selectPhoto = (idx: number) => {
    setCurrent(idx)
    setIsModalOpen(false)
  }

  return (
    <section style={{ padding: '80px 20px' }}>
      <h2 className="section-title">Gallery</h2>

      {/* 캐러셀 */}
      <div
        style={{ position: 'relative', width: '100%', userSelect: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 사진 영역: contain으로 가로/세로 모두 짤림 없이 표시 */}
        <div style={{
          width: '100%', height: '70vw', maxHeight: '420px',
          background: '#f5f5f5', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img
            src={`/Image/webp/${photos[current]}`}
            alt={`사진 ${current + 1}`}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        <button onClick={prev} style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
          width: '38px', height: '38px', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1
        }}>‹</button>
        <button onClick={next} style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
          width: '38px', height: '38px', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1
        }}>›</button>
      </div>

      {/* 카운터 */}
      <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
        {current + 1} / {photos.length}
      </p>

      {/* 전체보기 버튼 */}
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          marginTop: '16px', width: '100%', padding: '14px',
          border: '1px solid var(--point-color)', borderRadius: '8px',
          background: 'transparent', color: 'var(--point-color)',
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '2px'
        }}
      >
        사진 전체보기
      </button>

      {/* 전체보기 모달 */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '16px',
              width: '90%', maxWidth: '480px', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid #eee', flexShrink: 0
            }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>
                사진을 클릭하면 해당 사진으로 이동합니다
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#555' }}
              >✕</button>
            </div>

            {/* 그리드: 1:1 비율 + contain으로 짤림 없이 */}
            <div style={{ overflowY: 'auto', padding: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                {photos.map((filename, idx) => (
                  <div
                    key={filename}
                    onClick={() => selectPhoto(idx)}
                    style={{
                      aspectRatio: '1/1', overflow: 'hidden', cursor: 'pointer',
                      background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      outline: idx === current ? '2px solid var(--point-color)' : 'none'
                    }}
                  >
                    <img
                      src={`/Image/webp/${filename}`}
                      alt=""
                      loading="lazy"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
