export default function Gallery() {
  // 임시로 박스들만 만들어서 갤러리 영역이라는 것을 보여주는 코드입니다.
  const tempPhotos = [1, 2, 3, 4, 5, 6];

  return (
    <section style={{ backgroundColor: '#fdfbfb' }}>
      <h2 className="section-title">우리의 순간들</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '5px' 
      }}>
        {tempPhotos.map((num) => (
          <div 
            key={num}
            style={{
              width: '100%',
              aspectRatio: '1/1', // 정사각형 유지
              backgroundColor: '#eaeaea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}
          >
            사진 {num}
          </div>
        ))}
      </div>
      
      <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
        ※ 추후 이 갤러리는 클릭하면 크게 보이고 양옆으로 넘기는 (Swipe) 기능이 추가될 예정입니다.
      </p>
    </section>
  )
}
