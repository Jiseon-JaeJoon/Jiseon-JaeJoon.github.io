import { useEffect, useRef } from 'react'
import { useReveal } from '../hooks/useReveal'

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
      { text: '간선: 146, 341, 360, 740', dot: '#087af5' },
      { text: '지선: 0411, 3412, 4312', dot: '#209f24' },
      { text: '마을: 서초03, 서초11', dot: '#7fdc88' },
    ],
  },
  {
    icon: '🚗',
    title: '자가용',
    lines: [
      '내비게이션 "삼성전자 서초사옥 주차장"',
      '지하주차장 6, 7층 이용',
      '주차장 입구는 약도에 표시되어 있습니다.',
      '* 축의대에 비치된 무료 주차 도장 날인',
    ],
  },
]

const boxStyle: React.CSSProperties = {
  textAlign: 'left',
  background: 'transparent',
  border: '1px solid #333',
  borderRadius: '2px',
  padding: '16px 18px',
  marginBottom: '10px',
  fontSize: '0.9rem',
  lineHeight: 1.9,
  color: 'var(--text-main)',
}

export default function Location() {
  const mapRef = useRef<HTMLDivElement>(null)
  const { ref, revealed } = useReveal(0.15)

  useEffect(() => {
    if (!mapRef.current) return

    const position = new naver.maps.LatLng(37.496820, 127.026919)

    const map = new naver.maps.Map(mapRef.current, {
      center: position,
      zoom: 17,
    })

    new naver.maps.Marker({ position, map })

  }, [])

  const a = (delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  return (
    <section id="location" ref={ref} className={`dark-section${revealed ? ' revealed' : ''}`}>
      <h2 className="section-title" style={{ marginBottom: '6px', ...a(0) }}>Location</h2>
      <p style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '0.72rem', letterSpacing: '3px', color: 'var(--text-light)', marginBottom: '32px', ...a(80) }}>오시는 길</p>

      <h3 style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)', ...a(100) }}>
        삼성전자 서초사옥 5층
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: '24px', ...a(180) }}>
        서울 서초구 서초대로74길 120
      </p>

      <div
        ref={mapRef}
        style={{ width: '100%', height: 'clamp(280px, 40vh, 500px)', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', ...a(260) }}
      />

      <div style={{ display: 'flex', marginBottom: '32px', ...a(380) }}>
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
              border: '1px solid #333',
              borderLeft: idx === 0 ? '1px solid #333' : 'none',
              borderRadius: idx === 0 ? '8px 0 0 8px' : idx === arr.length - 1 ? '0 8px 8px 0' : '0',
              fontSize: '0.9rem', color: 'var(--text-main)',
              background: '#1a1a1a', textDecoration: 'none',
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

      {transportInfo.map(({ icon, title, lines }, ti) => (
        <div key={title} style={{ ...boxStyle, ...a(460 + ti * 110) }}>
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

      <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', ...a(790) }}>
        <img
          src="/Image/SketchMap.png"
          alt="약도"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </section>
  )
}
