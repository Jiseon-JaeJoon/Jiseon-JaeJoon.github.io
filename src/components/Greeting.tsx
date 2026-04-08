export default function Greeting() {
  return (
    <section>
      <h2 className="section-title">초대합니다</h2>

      <div style={{ fontFamily: "'Gowun Dodum', serif", lineHeight: 2, color: 'var(--text-main)', marginBottom: '50px' }}>
        <p>두 사람이 사랑으로 만나</p>
        <p>진실과 이해로써 하나를 이루려 합니다.</p>
        <p>이 약속의 자리에 여러분을 모시고자 하오니</p>
        <p>따스한 격려로 축복해 주시기 바랍니다.</p>
      </div>

      <div style={{ fontSize: '1.1rem', lineHeight: 2 }}>
        <p>
          <span style={{ color: 'var(--text-light)' }}>손○○ · 김○○</span> 의 아들 <strong style={{ fontSize: '1.2rem' }}>손재준</strong>
        </p>
        <p>
          <span style={{ color: 'var(--text-light)' }}>장○○ · 남궁○○</span> 의 딸 <strong style={{ fontSize: '1.2rem' }}>장지선</strong>
        </p>
      </div>
    </section>
  )
}
