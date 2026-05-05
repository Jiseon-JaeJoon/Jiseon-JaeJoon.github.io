export default function Cover() {
  return (
    <section style={{ padding: '40px 28px 36px' }}>

      {/* 위: 날짜 */}
      <div style={{
        fontFamily: "'Gowun Dodum', serif",
        textAlign: 'center',
        marginBottom: '22px',
      }}>
        <p style={{ fontSize: '1rem', letterSpacing: '5px', color: 'var(--point-color)', marginBottom: '8px' }}>
          WEDDING INVITATION
        </p>
        <p style={{ fontSize: '2rem', letterSpacing: '3px', color: '#444' }}>
          2026 · 09 · 19
        </p>
        <p style={{ fontSize: '1.5rem', letterSpacing: '2px', color: '#777', marginTop: '6px' }}>
          Saturday
        </p>
      </div>

      {/* 사진 */}
      <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
        <img
          src="/Image/webp/Mobile_Main_260503.webp"
          alt="커버 사진"
          style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        />
      </div>

      {/* 아래: 이름 + 날짜/장소 */}
      <div style={{
        textAlign: 'center',
        fontFamily: "'Gowun Dodum', serif",
        marginTop: '24px',
        color: '#333',
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '400', marginBottom: '14px' }}>
          손재준 <span style={{ fontSize: '1.2rem', margin: '0 10px', color: '#ccc', fontWeight: '200' }}>|</span> 장지선
        </h1>
        <p style={{ fontSize: '0.95rem', letterSpacing: '2px', color: '#666', marginBottom: '6px' }}>
          2026. 09. 19. SAT PM 1:00
        </p>
        <p style={{ fontSize: '0.85rem', color: '#999' }}>
          삼성전자 서초사옥 5층
        </p>
      </div>

    </section>
  )
}
