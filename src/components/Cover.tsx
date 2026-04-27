export default function Cover() {
  return (
    <section style={{ padding: 0 }}>
      <div className="cover-inner" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <img
          src="/Image/webp/Mobile_Main.webp"
          alt="커버 사진"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* 텍스트 가독성을 위한 오버레이 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.25)'
        }} />

        {/* 텍스트 영역 */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          width: '100%',
          textAlign: 'center',
          color: 'white',
          fontFamily: "'Gowun Dodum', serif"
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '300', marginBottom: '10px', letterSpacing: '4px' }}>
            WEDDING INVITATION
          </h2>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '400', marginBottom: '20px' }}>
            재준 <span style={{ fontSize: '1.5rem', margin: '0 10px' }}>&</span> 지선
          </h1>
          <p style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>
            2026. 09. 19. SAT PM 1:00
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.8 }}>
            삼성전자 서초사옥 5층
          </p>
        </div>
      </div>
    </section>
  )
}
