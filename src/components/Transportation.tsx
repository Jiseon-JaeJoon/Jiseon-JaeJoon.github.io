const transportInfo = [
  {
    icon: '🚇',
    title: '지하철',
    lines: [
      '2호선 · 신분당선 강남역 8번 출구 지하에서 연결',
      '좌측의 에스컬레이터 이용하시면 됩니다.',
    ],
  },
  {
    icon: '🚌',
    title: '버스',
    lines: [
      '강남역 정류장 하차 후 도보 5분',
      '8번출구에서 지상에서 건물 보이는 방향에서 자회전 후 건물 1층에서 엘리베이터 이용하시면 됩니다.',
      '간선(파랑): 146, 341, 360, 740',
      '지선(초록): 3412, 4412, 4413',
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
      <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '20px', textAlign: 'center' }}>
        대중교통 이용 안내
      </p>

      {transportInfo.map(({ icon, title, lines }) => (
        <div key={title} style={boxStyle}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{icon} {title}</p>
          {lines.map((line, i) => (
            <p key={i} style={{ color: 'var(--text-light)' }}>{line}</p>
          ))}
        </div>
      ))}
    </section>
  )
}
