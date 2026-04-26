import { useState, useEffect } from 'react'

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

export default function CalendarCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  const countdownItems = [
    { label: 'DAYS', value: String(timeLeft.days) },
    { label: 'HOURS', value: pad(timeLeft.hours) },
    { label: 'MIN', value: pad(timeLeft.minutes) },
    { label: 'SEC', value: pad(timeLeft.seconds) },
  ]

  return (
    <section>
      <h2 className="section-title">Wedding day</h2>

      {/* 달력 */}
      <div style={{ fontFamily: "'Gowun Dodum', serif", marginBottom: '40px' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)', letterSpacing: '2px' }}>
          2026년 9월
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                <th key={d} style={{
                  padding: '8px 0', fontSize: '0.8rem',
                  color: d === '일' ? '#e07070' : d === '토' ? '#7090e0' : 'var(--text-light)',
                  fontWeight: 400
                }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
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
                          color: isWedding ? 'white' : isSun ? '#e07070' : isSat ? '#7090e0' : 'var(--text-main)',
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
      <div style={{ borderTop: '1px solid #eee', paddingTop: '32px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', letterSpacing: '2px', marginBottom: '20px' }}>
          결혼식까지
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'flex-start' }}>
          {countdownItems.map(({ label, value }, idx) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ textAlign: 'center', minWidth: '52px' }}>
                <div style={{
                  fontSize: '2rem', fontWeight: '300', color: 'var(--text-main)',
                  fontFamily: "'Gowun Dodum', serif", lineHeight: 1.1
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', letterSpacing: '1px', marginTop: '4px' }}>
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
