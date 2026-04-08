export default function Location() {
  return (
    <section>
      <h2 className="section-title">오시는 길</h2>

      {/* 지도 들어갈 임시 회색 배경 박스 */}
      <div style={{
        width: '100%',
        height: '250px',
        backgroundColor: '#eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        color: '#666'
      }}>
        [카카오맵 또는 네이버맵 추가]
      </div>

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
