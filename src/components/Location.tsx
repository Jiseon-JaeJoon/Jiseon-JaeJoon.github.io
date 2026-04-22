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

    const marker = new naver.maps.Marker({ position, map })

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div style="padding:10px 14px; font-size:11.5px; line-height:1.8;">
          <strong style="font-size:13px;">삼성전자 서초사옥</strong><br/>
          서울 서초구 서초대로74길 120
        </div>
      `,
      borderWidth: 0,
      disableAnchor: false,
      backgroundColor: 'white',
      anchorSize: new naver.maps.Size(7, 7),
    })

    infoWindow.open(map, marker)
  }, [])

  return (
    <section>
      <h2 className="section-title">오시는 길</h2>

      <div ref={mapRef} style={{ width: '100%', height: '400px', marginBottom: '20px' }} />

      <div style={{ textAlign: 'left', padding: '0 10px', fontSize: '0.95rem', lineHeight: 1.8 }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>삼성전자 서초사옥</h3>
        <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
          서울 서초구 서초대로74길 120
        </p>

        <div style={{ color: '#444' }}>
          <p><strong>🚇지하철:</strong> 2호선 · 신분당선 강남역 8번출구 도보 1분</p>
          <p><strong>🚌버스:</strong> 강남역</p>
          <p><strong>🚗주차:</strong> 주차방법 알아보고 적어</p>
        </div>
      </div>
    </section>
  )
}
