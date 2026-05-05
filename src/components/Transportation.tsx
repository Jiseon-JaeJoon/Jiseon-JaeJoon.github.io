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
    </section>
  )
}
