export default function Greeting() {
  return (
    <section>
      <h2 className="section-title">초대합니다</h2>

      <div style={{ fontFamily: "'Gowun Dodum', serif", lineHeight: 2, color: 'var(--text-main)', marginBottom: '50px' }}>
        <p>함께 있을 때 가장 나다운 사람이 되고</p>
        <p>함께 있을 때 미래를 꿈꾸게 하는 사람을 만나</p>
        <p>함께 맞는 다섯 번째 가을, 결혼합니다.</p>
        <p>지금처럼 서로에게 가장 친한 친구가 되어</p>
        <p>예쁘고 행복하게 잘 살겠습니다. </p>
        <p>저희의 새로운 시작을 함께해 주세요.</p>

      </div>

      <div style={{ fontSize: '1.1rem', lineHeight: 2 }}>
        <p>
          <span style={{ color: 'var(--text-light)' }}>손성규 · 김채안</span> 의 아들 <strong style={{ fontSize: '1.2rem' }}>     손재준</strong>
        </p>
        <p>
          <span style={{ color: 'var(--text-light)' }}>장경오 · 남궁선미</span> 의 딸 <strong style={{ fontSize: '1.2rem' }}>     장지선</strong>
        </p>
      </div>
    </section>
  )
}
