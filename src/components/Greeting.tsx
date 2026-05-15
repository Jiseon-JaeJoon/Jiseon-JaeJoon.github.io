import { useReveal } from '../hooks/useReveal'

const LINES = [
  '함께 있을 때 가장 나다운 사람이 되고',
  '함께 있을 때 미래를 꿈꾸게 하는 사람을 만나',
  '함께 맞는 다섯 번째 가을, 결혼합니다.',
  '지금처럼 서로에게 가장 친한 친구가 되어',
  '예쁘고 행복하게 잘 살겠습니다.',
  '저희의 새로운 시작을 함께해 주세요.',
]

const CHAR_MS = 16

// 모듈 로드 시 각 글자의 딜레이를 미리 계산
let _idx = 0
const DELAYS = LINES.map(line => line.split('').map(() => (_idx++) * CHAR_MS))
const TOTAL_CHARS = _idx

export default function Greeting() {
  const { ref, revealed } = useReveal(0.2)

  const a = (delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  return (
    <section id="greeting" ref={ref} className={revealed ? 'revealed' : ''}>

      <div style={{ fontFamily: "'Gowun Batang', serif", lineHeight: 2.4, color: 'var(--text-main)', marginBottom: '50px' }}>
        {LINES.map((line, li) => (
          <p key={li} style={{ marginBottom: li === 2 ? '0.4rem' : li < LINES.length - 1 ? '0.1rem' : 0 }}>
            {line.split('').map((char, ci) => (
              <span
                key={`${li}-${ci}`}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity: revealed ? undefined : 0,
                  animation: revealed ? `charReveal 0.35s ease ${DELAYS[li][ci]}ms both` : 'none',
                }}
              >
                {char}
              </span>
            ))}
          </p>
        ))}
      </div>

      <div style={{ fontSize: '1.1rem', lineHeight: 2 }}>
        <p style={a(TOTAL_CHARS * CHAR_MS + 100)}>
          <span style={{ color: 'var(--text-light)' }}>손성규 · 김채안</span> 의 아들 <strong style={{ fontSize: '1.2rem' }}>     손재준</strong>
        </p>
        <p style={a(TOTAL_CHARS * CHAR_MS + 260)}>
          <span style={{ color: 'var(--text-light)' }}>장경오 · 남궁선미</span> 의 딸 <strong style={{ fontSize: '1.2rem' }}>     장지선</strong>
        </p>
      </div>
    </section>
  )
}
