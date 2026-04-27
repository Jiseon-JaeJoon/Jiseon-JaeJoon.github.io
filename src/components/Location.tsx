import { useEffect, useRef } from 'react'

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

    </section>
  )
}
