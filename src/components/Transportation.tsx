import { useState } from 'react'

type Line = string | { text: string; dot: string }

const transportInfo: { icon: string; title: string; lines: Line[] }[] = [
  {
    icon: '🚇',
    title: '지하철',
    lines: [
      { text: '2호선: 8번 출구 지하에서 연결', dot: '#00A84D' },
      { text: '신분당선: 6번 출구 도보 2분', dot: '#9B0D54' },
    ],
  },
  {
    icon: '🚌',
    title: '버스',
    lines: [
      '강남역 정류장 도보 2분',
      { text: '간선: 146, 341, 360, 740', dot: '#4A90D9' },
      { text: '지선: 3412, 4412, 4413', dot: '#4CAF50' },
    ],
  },
  {
    icon: '🚗',
    title: '자가용',
    lines: [
      '지하주차장 6, 7층 이용',
      '접수대에 비치된 무료 주차 도장 날인',
      '주차장 입구는 약도에 표시되어 있습니다.'
    ],
  },
]

const boxStyle: React.CSSProperties = {
  textAlign: 'left',
  background: '#fafafa',
  border: '1px solid #eee',
  borderRadius: '12px',
  padding: '16px 18px',
  marginBottom: '10px',
  fontSize: '0.9rem',
  lineHeight: 1.9,
  color: 'var(--text-main)',
}

export default function Transportation() {
  const [showMap, setShowMap] = useState(false)

  return (
    <section>
      <h2 className="section-title">오시는 길</h2>

      {transportInfo.map(({ icon, title, lines }) => (
        <div key={title} style={boxStyle}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{icon} {title}</p>
          {lines.map((line, i) =>
            typeof line === 'string' ? (
              <p key={i} style={{ color: 'var(--text-light)' }}>{line}</p>
            ) : (
              <p key={i} style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: line.dot, flexShrink: 0, display: 'inline-block' }} />
                {line.text}
              </p>
            )
          )}
        </div>
      ))}

      <button
        onClick={() => setShowMap(true)}
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '12px 6px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: 'white',
          fontSize: '0.9rem',
          color: 'var(--text-main)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
      >
       약도 보기
      </button>

      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowMap(false)}
              style={{
                position: 'absolute', top: '12px', right: '16px',
                background: 'none', border: 'none',
                fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-light)',
              }}
            >✕</button>
            <p style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)' }}>약도</p>
            <img
              src="/Image/SketchMap.png"
              alt="약도"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
