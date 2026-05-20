import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

interface FormData {
  attendance: 'yes' | 'no'
  name: string
  contact: string
  totalGuests: number
}

const initialForm: FormData = {
  attendance: 'yes',
  name: '',
  contact: '',
  totalGuests: 1,
}

// Layout constants (px)
const ENV_H = 230
const CARD_H = 480
const CARD_BOTTOM = 80
const CONTAINER_H = 580

const CARD_TOP = CONTAINER_H - CARD_H - CARD_BOTTOM   // 20px
const ENV_TOP = CONTAINER_H - ENV_H                    // 350px
const FLAP_H = Math.round(ENV_H * 0.52)               // 120px
const SLIDE_AMOUNT = 335
const ENV_TAPER = 8
const ENV_TOP_PCT = (ENV_TOP / CONTAINER_H * 100).toFixed(2) // 60.34%

export default function Rsvp() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const { ref: revealRef, revealed } = useReveal(0.25)

  const setRef = (el: HTMLElement | null) => {
    ;(sectionRef as React.MutableRefObject<HTMLElement | null>).current = el
    ;(revealRef as React.MutableRefObject<HTMLElement | null>).current = el
  }

  // 스크롤 진행도로 카드·플랩 직접 제어 (React 상태 X, 60fps)
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      const wh = window.innerHeight
      // section 전체가 뷰포트에 보이는 시점에 애니메이션 완료
      const progress = Math.max(0, Math.min(1, (wh - rect.top) / section.offsetHeight))
      section.style.setProperty('--card-ty', `${Math.round(SLIDE_AMOUNT * (1 - progress))}px`)
      section.style.setProperty('--flap-rx', `${(progress * -170).toFixed(1)}deg`)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const setAttendance = (v: 'yes' | 'no') => {
    setForm(f => ({
      ...f,
      attendance: v,
      totalGuests: v === 'yes' ? Math.max(1, f.totalGuests) : 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        attendance: form.attendance,
        name: form.name.trim(),
        contact: form.contact.trim(),
        totalGuests: form.totalGuests,
        createdAt: Timestamp.now(),
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = form.name.trim() && form.contact.trim() && !submitting

  const adjustGuests = (delta: number) => {
    if (form.attendance === 'no') return
    setForm(f => ({ ...f, totalGuests: Math.max(1, f.totalGuests + delta) }))
  }

  const lineStyle: React.CSSProperties = {
    borderBottom: '1px solid #e8e8e8',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '0.6rem',
    letterSpacing: '3px',
    color: '#b0b0b0',
    display: 'block',
  }

  return (
    <section id="rsvp" ref={setRef} className={`dark-section${revealed ? ' revealed' : ''}`}>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        height: `${CONTAINER_H}px`,
      }}>

        {/* ── 3D 플랩 레이어 ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          perspective: '450px',
          zIndex: 6,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: `${ENV_TOP}px`,
            left: 0, right: 0,
            height: `${FLAP_H}px`,
            transformOrigin: '50% 0%',
            // 스크롤 진행도로 CSS 변수 제어 — transition 없음
            transform: 'rotateX(var(--flap-rx, 0deg))',
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #f2ede5 0%, #d8d2c8 100%)',
            clipPath: 'polygon(8% 0%, 92% 0%, 50% 100%)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          }} />
        </div>

        {/* ── 카드 + 봉투 클리핑 레이어 ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          clipPath: `polygon(0% 0%, 100% 0%, 100% ${ENV_TOP_PCT}%, ${100 - ENV_TAPER}% ${ENV_TOP_PCT}%, 100% 100%, 0% 100%, ${ENV_TAPER}% ${ENV_TOP_PCT}%, 0% ${ENV_TOP_PCT}%)`,
        }}>

        {/* ── 편지지 (카드) — 스크롤 진행도로 슬라이드 ── */}
        <div style={{
          position: 'absolute',
          left: '10%',
          width: '80%',
          top: `${CARD_TOP}px`,
          height: `${CARD_H}px`,
          background: '#e0e0e0',
          border: '1px solid #d4d4d4',
          boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
          zIndex: 2,
          padding: '6px',
          boxSizing: 'border-box',
          // 스크롤 진행도로 CSS 변수 제어 — transition 없음
          transform: `translateY(var(--card-ty, ${SLIDE_AMOUNT}px))`,
        }}>
          <div style={{ width: '100%', height: '100%', background: 'white', display: 'flex', flexDirection: 'column' }}>

          {/* RSVP 타이틀 */}
          <div style={{ textAlign: 'center', padding: '18px 0 14px', ...lineStyle }}>
            <h2 style={{
              fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontWeight: 200,
              fontSize: '2rem',
              color: '#111',
              margin: 0,
              lineHeight: 1,
            }}>RSVP</h2>
          </div>

          {submitted ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#111', lineHeight: 2 }}>
                전달해 주셔서 감사합니다 ✓
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

              {/* 참석 / 불참 */}
              <div style={{ display: 'flex' }}>
                {(['yes', 'no'] as const).map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAttendance(v)}
                    style={{
                      flex: 1,
                      padding: '14px 0',
                      border: 'none',
                      borderRight: i === 0 ? '1px solid #e8e8e8' : 'none',
                      background: form.attendance === v ? '#111' : '#f5f5f5',
                      color: form.attendance === v ? 'white' : '#c0c0c0',
                      fontSize: '0.82rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '1px',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {v === 'yes' ? '참석' : '불참'}
                  </button>
                ))}
              </div>

              {/* 성함 | 전화번호 */}
              <div style={{ display: 'flex' }}>
                <div style={{
                  flex: 1,
                  padding: '10px 14px 10px',
                  borderRight: '1px solid #e8e8e8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <span style={labelStyle}>NAME</span>
                  <input
                    type="text"
                    placeholder="성함"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      border: 'none',
                      borderBottom: '1px solid #d0d0d0',
                      outline: 'none',
                      fontSize: '0.88rem',
                      background: 'transparent',
                      fontFamily: 'inherit',
                      color: '#111',
                      width: '100%',
                      padding: '4px 0 5px',
                    }}
                  />
                </div>
                <div style={{
                  flex: 1,
                  padding: '10px 14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <span style={labelStyle}>PHONE</span>
                  <input
                    type="tel"
                    placeholder="전화번호"
                    value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    style={{
                      border: 'none',
                      borderBottom: '1px solid #d0d0d0',
                      outline: 'none',
                      fontSize: '0.88rem',
                      background: 'transparent',
                      fontFamily: 'inherit',
                      color: '#111',
                      width: '100%',
                      padding: '4px 0 5px',
                    }}
                  />
                </div>
              </div>

              {/* 참석 인원 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '14px 0 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '5px' }}>
                  <button
                    type="button"
                    onClick={() => adjustGuests(-1)}
                    disabled={form.attendance === 'no'}
                    style={{
                      width: '28px', height: '28px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '50%',
                      background: 'none',
                      cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#aaa',
                      fontFamily: 'inherit',
                      opacity: form.attendance === 'no' ? 0.35 : 1,
                    }}
                  >−</button>
                  <span style={{ fontSize: '1rem', color: '#111', minWidth: '40px', textAlign: 'center' }}>
                    {form.totalGuests}명
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustGuests(1)}
                    disabled={form.attendance === 'no'}
                    style={{
                      width: '28px', height: '28px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '50%',
                      background: 'none',
                      cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#aaa',
                      fontFamily: 'inherit',
                      opacity: form.attendance === 'no' ? 0.35 : 1,
                    }}
                  >+</button>
                </div>
                <span style={labelStyle}>참석 인원</span>
              </div>

              {/* 전달하기 버튼 */}
              <div style={{ padding: '14px 16px 16px' }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%',
                    padding: '13px',
                    background: '#111',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit ? 1 : 0.35,
                    transition: 'opacity 0.15s',
                    letterSpacing: '2px',
                  }}
                >
                  {submitting ? '전송 중...' : '전달하기'}
                </button>
              </div>

            </form>
          )}
          </div>
        </div>

        {/* ── 봉투 입구 그림자 선 ── */}
        <div style={{
          position: 'absolute',
          top: `${ENV_TOP}px`,
          left: '8%', right: '8%',
          height: '3px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)',
          zIndex: 5,
          pointerEvents: 'none',
        }} />

        {/* ── 봉투 몸체 ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: `${ENV_H}px`,
          background: '#ede8df',
          zIndex: 4,
          overflow: 'hidden',
          clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
          filter: 'drop-shadow(0 -4px 20px rgba(0,0,0,0.13))',
        }}>
          {/* 종이 질감 */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '220px 220px',
            opacity: 0.07,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 100% 0, 50% 50%)', background: 'linear-gradient(to bottom, #f7f2ea, #e6e0d6)' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 50% 50%, 0 100%)', background: 'linear-gradient(135deg, #eae5dc, #d8d3ca)' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)', background: 'linear-gradient(225deg, #ddd8cf, #cdc8bf)' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)', background: 'linear-gradient(to top, #c8c3ba, #d8d3ca)' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <line x1="0" y1="0" x2="50%" y2="50%" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
            <line x1="100%" y1="0" x2="50%" y2="50%" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
            <line x1="0" y1="100%" x2="50%" y2="50%" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
            <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            paddingBottom: '24px', gap: '7px',
            pointerEvents: 'none',
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.82rem',
              letterSpacing: '8px',
              textTransform: 'uppercase',
              color: 'rgba(100,88,75,0.38)',
              textShadow: '1px 1px 0 rgba(255,255,255,0.7), -1px -1px 0 rgba(0,0,0,0.18)',
            }}>INVITATION</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '0.55rem',
              letterSpacing: '2.5px',
              color: 'rgba(100,88,75,0.75)',
            }}>2026. 09. 19</span>
          </div>
        </div>

        </div>{/* 클리핑 레이어 끝 */}

      </div>
    </section>
  )
}
