import { useEffect, useRef } from 'react'

const transportInfo = [
  {
    icon: '🚇',
    title: '지하철',
    lines: [
      '2호선 · 신분당선 강남역 8번 출구 지하에서 연결',
      '에스컬레이터 이용하여 지상으로 올라오시고 다시 엘리베이터 이용하시면 됩니다.',
      ''
    ],
    note: null,
  },
  {
    icon: '🚌',
    title: '버스',
    lines: [
      '강남역 정류장 하차 후 도보 약 5분',
      '간선(파랑): 146, 341, 360, 740',
      '지선(초록): 3412, 4412, 4413',
    ],
    note: null,
  },
  {
    icon: '🚗',
    title: '자가용',
    lines: [
      '지하주차장 6, 7층 이용',
      '- 접수대에 비치된 무료 주차 도장 날인 '
    ]
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

export default function Location() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const position = new naver.maps.LatLng(37.496820, 127.026919)

    const map = new naver.maps.Map(mapRef.current, {
      center: position,
      zoom: 17,
    })

    new naver.maps.Marker({ position, map })

  }, [])

  return (
    <section>
      <h2 className="section-title">Location</h2>

      {/* 장소명 + 주소 (지도 위) */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
        삼성전자 서초사옥 5층
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '16px' }}>
        서울 서초구 서초대로74길 120
      </p>

      {/* 지도 */}
      <div ref={mapRef} style={{ width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }} />

      {/* 지도 앱 버튼 (지도 바로 아래) */}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        {[
          { label: '네이버 지도', href: 'https://map.naver.com/p/search/삼성전자%20서초사옥', icon: 'map.naver.com' },
          { label: '카카오 내비', href: 'https://map.kakao.com/link/to/삼성전자+서초사옥,37.496820,127.026919', icon: 'kakao.com' },
          { label: '티맵', href: 'tmap://route?goalname=삼성전자+서초사옥&goalx=127.026919&goaly=37.496820', icon: 'www.tmap.co.kr' },
        ].map(({ label, href, icon }, idx, arr) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '12px 6px', textAlign: 'center',
              border: '1px solid #ddd',
              borderLeft: idx === 0 ? '1px solid #ddd' : 'none',
              borderRadius: idx === 0 ? '8px 0 0 8px' : idx === arr.length - 1 ? '0 8px 8px 0' : '0',
              fontSize: '0.9rem', color: 'var(--text-main)',
              background: 'white', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
            }}
          >
            <img
              src={`https://www.google.com/s2/favicons?domain=${icon}&sz=32`}
              alt={label}
              style={{ width: '14px', height: '14px', borderRadius: '3px' }}
            />
            {label}
          </a>
        ))}
      </div>

      {/* 교통 안내 박스 */}
      {transportInfo.map(({ icon, title, lines, note }) => (
        <div key={title} style={boxStyle}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{icon} {title}</p>
          {lines.map((line, i) => (
            <p key={i} style={{ color: 'var(--text-light)' }}>{line}</p>
          ))}
          {note && (
            <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'var(--point-color)' }}>{note}</p>
          )}
        </div>
      ))}
    </section>
  )
}
