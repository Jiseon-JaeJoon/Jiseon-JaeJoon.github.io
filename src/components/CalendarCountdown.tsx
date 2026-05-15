import { useState, useEffect } from 'react'
import { useReveal } from '../hooks/useReveal'

const WEDDING = new Date(2026, 8, 19, 13, 0, 0)

function getTimeLeft() {
  const diff = WEDDING.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

// 2026년 9월 1일 = 화요일 (index 2, 0=일)
const FIRST_DAY = 2
const DAYS_IN_MONTH = 30
const WEDDING_DAY = 19

const calendarCells: (number | null)[] = [
  ...Array(FIRST_DAY).fill(null),
  ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
]

const rows: (number | null)[][] = []
for (let i = 0; i < calendarCells.length; i += 7) {
  rows.push(calendarCells.slice(i, i + 7))
}

type SlotValues = { days: string; hours: string; min: string; sec: string }

export default function CalendarCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [animDone, setAnimDone] = useState(false)
  const [slotValues, setSlotValues] = useState<SlotValues>({ days: '0', hours: '00', min: '00', sec: '00' })
  const { ref, revealed } = useReveal(0.2)

  // 실시간 카운트다운
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  // DAYS→HOURS→MIN→SEC 스태거 시작, 모두 t=4000ms에 동시 완료
  useEffect(() => {
    if (!revealed || animDone) return

    const target = getTimeLeft()
    const TOTAL = 4000

    const units: Array<{ key: keyof SlotValues; max: number; pad: boolean; startDelay: number }> = [
      { key: 'days',  max: target.days,    pad: false, startDelay:    0 },
      { key: 'hours', max: target.hours,   pad: true,  startDelay:  500 },
      { key: 'min',   max: target.minutes, pad: true,  startDelay: 1000 },
      { key: 'sec',   max: target.seconds, pad: true,  startDelay: 1500 },
    ]

    const rafIds: number[] = []
    const timerIds: ReturnType<typeof setTimeout>[] = []
    let doneCount = 0

    units.forEach(({ key, max, pad, startDelay }) => {
      const duration = TOTAL - startDelay
      const fmt = (n: number) => pad ? String(n).padStart(2, '0') : String(n)
      const from = Math.max(0, max - 10)

      const timerId = setTimeout(() => {
        const startTime = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          setSlotValues(prev => ({ ...prev, [key]: fmt(Math.round(from + (max - from) * ease)) }))

          if (progress < 1) {
            rafIds.push(requestAnimationFrame(tick))
          } else {
            doneCount++
            if (doneCount === units.length) setAnimDone(true)
          }
        }
        rafIds.push(requestAnimationFrame(tick))
      }, startDelay)

      timerIds.push(timerId)
    })

    return () => {
      rafIds.forEach(cancelAnimationFrame)
      timerIds.forEach(clearTimeout)
    }
  }, [revealed]) // eslint-disable-line react-hooks/exhaustive-deps

  const pad = (n: number) => String(n).padStart(2, '0')

  const displayed: SlotValues = animDone
    ? { days: String(timeLeft.days), hours: pad(timeLeft.hours), min: pad(timeLeft.minutes), sec: pad(timeLeft.seconds) }
    : slotValues

  const countdownItems = [
    { label: 'DAYS',  value: displayed.days  },
    { label: 'HOURS', value: displayed.hours },
    { label: 'MIN',   value: displayed.min   },
    { label: 'SEC',   value: displayed.sec   },
  ]

  const a = (delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  return (
    <section id="calendar" ref={ref} className={`dark-section${revealed ? ' revealed' : ''}`}>
      <h2 className="section-title" style={a(0)}>Wedding day</h2>

      {/* 달력 */}
      <div style={{ fontFamily: "'Nanum Myeongjo', serif", marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
        <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.3rem)', marginBottom: '16px', color: 'var(--text-main)', letterSpacing: '2px', ...a(80) }}>
          2026년 9월
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr style={a(130)}>
              {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                <th key={d} style={{
                  padding: '8px 0', fontSize: '0.8rem',
                  color: d === '일' || d === '토' ? '#888' : 'var(--text-light)',
                  fontWeight: 400
                }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  opacity: revealed ? undefined : 0,
                  animation: revealed ? `slideUpFade 0.5s ease ${170 + ri * 65}ms both` : 'none',
                }}
              >
                {row.map((day, ci) => {
                  const isWedding = day === WEDDING_DAY
                  const isSun = ci === 0
                  const isSat = ci === 6
                  return (
                    <td key={ci} style={{ padding: '6px 0', textAlign: 'center' }}>
                      {day && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '50%',
                          fontSize: '0.9rem',
                          backgroundColor: isWedding ? 'var(--point-color)' : 'transparent',
                          color: isWedding ? 'white' : isSun || isSat ? '#888' : 'var(--text-main)',
                          fontWeight: isWedding ? 600 : 400,
                        }}>
                          {day}
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 카운트다운 */}
      <div style={{ borderTop: '1px solid #333', paddingTop: '32px', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', letterSpacing: '2px', marginBottom: '20px', ...a(680) }}>
          결혼식까지
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'flex-start' }}>
          {countdownItems.map(({ label, value }, idx) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                textAlign: 'center', minWidth: '56px',
                opacity: revealed ? undefined : 0,
                animation: revealed ? `slideUpFade 0.6s ease ${730 + idx * 80}ms both` : 'none',
              }}>
                {/* key={value}로 값이 바뀔 때마다 slotTick 애니메이션 재실행 */}
                <div
                  key={value}
                  style={{
                    fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: '300', color: 'var(--text-main)',
                    fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1,
                    animation: revealed ? 'slotTick 0.22s ease both' : 'none',
                    overflow: 'hidden',
                  }}
                >
                  {value}
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem',
                  color: 'var(--text-light)', letterSpacing: '1.5px', marginTop: '4px',
                }}>
                  {label}
                </div>
              </div>
              {idx < 3 && (
                <span style={{ fontSize: '1.6rem', color: 'var(--point-color)', lineHeight: 1.1, marginTop: '2px' }}>:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
