import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

import envelopeBodySrc  from '../assets/envelope-Bfk8GE_u.png'
import envelopeTopSrc   from '../assets/envelopeTop-DNGkXVSC.png'
import envelopeInnerSrc from '../assets/envelopeInner-Bl_NByj8.png'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

// ── Layout (레퍼런스 사이트 치수 그대로 재현) ──────────────────────────────────
// 레퍼런스: container 680px, card top 460px / h 200px, env top 450px / h 200px
const CONTAINER_H  = 600   // 씬 전체 높이
const CARD_W       = 330   // 카드 너비 (레퍼런스 동일)
const CARD_H       = 200   // 카드 높이 (레퍼런스 동일)
const CARD_BASE_Y  = 390   // 카드 초기 top (봉투 안)
const ENV_TOP      = 380   // 봉투 body 시작 y
const ENV_H        = 200   // 봉투 body 높이

// 완전히 나왔을 때: 카드 top = CARD_BASE_Y + CARD_Y_TRAVEL = 390 - 330 = 60
const CARD_Y_TRAVEL = -(CARD_BASE_Y - 60)  // -330px

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
function easeOut3(t: number) { return 1 - (1 - t) ** 3 }

// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
  attendance: 'yes' | 'no'
  name: string
  contact: string
  totalGuests: number
}
const initialForm: FormData = { attendance: 'yes', name: '', contact: '', totalGuests: 1 }

export default function Rsvp() {
  const [form, setForm]             = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [revealed,  setRevealed]    = useState(false)

  const sectionRef   = useRef<HTMLElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const flapInnerRef = useRef<HTMLDivElement>(null)

  // 섹션 페이드인(IntersectionObserver) + 봉투 스크롤 애니메이션 동시 등록
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // ① 섹션 최초 진입 → 페이드인
    const ioObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true) },
      { threshold: 0.04 }   // 200vh 섹션이라 낮은 threshold 사용
    )
    ioObs.observe(section)

    // ② 스크롤 위치 → 카드 Y / 플랩 각도 직접 DOM 업데이트 (setState 없이 60fps)
    const onScroll = () => {
      const rect    = section.getBoundingClientRect()
      const sectH   = section.offsetHeight
      const vh      = window.innerHeight
      // 섹션 top이 0(뷰포트 상단)이 됐을 때부터 progress 시작
      const scrolled = clamp01(-rect.top / (sectH - vh))

      // 플랩: 스크롤 30%까지 0→200deg (먼저 빠르게 열림)
      const flapP    = easeOut3(clamp01(scrolled / 0.30))
      const flapAngle = lerp(0, 200, flapP)

      // 카드: 2% 지연 후 55%까지 완전히 올라옴 → 스크롤 중간쯤에 등장
      const cardP    = easeOut3(clamp01((scrolled - 0.02) / 0.53))
      const cardY    = lerp(0, CARD_Y_TRAVEL, cardP)

      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-50%) translateY(${cardY}px)`
      }
      if (flapInnerRef.current) {
        flapInnerRef.current.style.transform = `rotateX(${flapAngle}deg)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()  // 최초 실행 (섹션이 이미 뷰포트 안에 있을 때 대비)

    return () => {
      ioObs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const setAttendance = (v: 'yes' | 'no') =>
    setForm(f => ({ ...f, attendance: v, totalGuests: v === 'yes' ? Math.max(1, f.totalGuests) : 0 }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        attendance: form.attendance, name: form.name.trim(),
        contact:    form.contact.trim(), totalGuests: form.totalGuests,
        createdAt:  Timestamp.now(),
      })
      setSubmitted(true)
    } finally { setSubmitting(false) }
  }

  const canSubmit    = !!(form.name.trim() && form.contact.trim() && !submitting)
  const adjustGuests = (d: number) => {
    if (form.attendance === 'no') return
    setForm(f => ({ ...f, totalGuests: Math.max(1, f.totalGuests + d) }))
  }

  const labelSt: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '0.5rem',
    letterSpacing: '3px', color: '#aaa', display: 'block', textTransform: 'uppercase',
  }
  const hairline: React.CSSProperties = { borderBottom: '1px solid #ebebeb' }
  const pngBg = (src: string): React.CSSProperties => ({
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
  })

  return (
    // ─── 섹션을 200vh로 늘려서 스크롤 공간 확보 ──────────────────────────────
    // display:block, padding:0 으로 App.css flex/padding 오버라이드
    <section
      id="rsvp"
      ref={sectionRef}
      className="dark-section"
      style={{
        display: 'block',
        minHeight: '150vh',
        padding: 0,
        background: 'linear-gradient(to bottom, #1c1917 0%, #111111 60%)',
        position: 'relative',
        // transform을 none으로 고정 → App.css의 translateY(32px)가 sticky를 깨지 않도록
        transform: 'translateY(0)',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 1.8s ease-out',
      }}
    >
      {/* ─── sticky wrapper: 뷰포트 중앙에 고정 (top:50% + translateY(-50%)) ── */}
      {/* overflow:visible 유지 → 플랩 3D 회전 클리핑 방지                       */}
      <div style={{
        position: 'sticky',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
      }}>

        <p style={{
          fontFamily: "'Gowun Batang', serif", fontSize: '0.76rem',
          color: 'rgba(255,255,255,0.38)', letterSpacing: '1.5px',
          lineHeight: 2, marginBottom: '28px', textAlign: 'center',
          padding: '0 24px',
        }}>
          원활한 식사 제공을 위해 참석 인원 확인이 필요합니다
        </p>

        {/* ─── 봉투 씬 컨테이너 ─────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: '100%', maxWidth: `${CARD_W + 60}px`,
          height: `${CONTAINER_H}px`,
        }}>

          {/* z:1 — 봉투 뒷면 (전체 높이): 닫힌 상태에서 봉투 전체가 보임 */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: `${CONTAINER_H}px`, zIndex: 1,
            ...pngBg(envelopeBodySrc),
          }} />

          {/* z:2 — 내부 안감: 봉투 열렸을 때 안쪽 보임 */}
          <div style={{
            position: 'absolute', top: `${ENV_TOP}px`, left: 0, right: 0,
            height: `${ENV_H}px`, zIndex: 2,
            ...pngBg(envelopeInnerSrc),
          }} />

          {/* z:3 — 카드: 스크롤에 따라 translateY로 봉투 속→위로 이동 */}
          <div
            ref={cardRef}
            style={{
              position: 'absolute',
              top:  `${CARD_BASE_Y}px`,
              left: '50%',
              transform: 'translateX(-50%) translateY(0px)',  // scroll handler가 업데이트
              width:  `${CARD_W}px`,
              height: `${CARD_H}px`,
              background: '#fff',
              zIndex: 3,
              boxShadow: '0 16px 48px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/* RSVP 제목 */}
              <div style={{ textAlign: 'center', padding: '12px 0 10px', ...hairline }}>
                <h2 style={{
                  fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontWeight: 200, fontSize: '1.55rem',
                  color: '#111', margin: 0, lineHeight: 1, letterSpacing: '2px',
                }}>RSVP</h2>
              </div>

              {submitted ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#111', lineHeight: 2 }}>
                    전달해 주셔서 감사합니다 ✓
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* 참석 / 불참 */}
                  <div style={{ display: 'flex', ...hairline }}>
                    {(['yes', 'no'] as const).map((v, i) => (
                      <button key={v} type="button" onClick={() => setAttendance(v)} style={{
                        flex: 1, padding: '9px 0', border: 'none',
                        borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                        background: form.attendance === v ? '#111' : '#f8f8f8',
                        color:      form.attendance === v ? 'white' : '#bbb',
                        fontSize: '0.72rem', fontFamily: 'inherit',
                        cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '1.5px',
                      }}>
                        {v === 'yes' ? '참석' : '불참'}
                      </button>
                    ))}
                  </div>

                  {/* 성함 | 전화번호 */}
                  <div style={{ display: 'flex', ...hairline }}>
                    {[
                      { k: 'name',    lb: 'Name',  ph: '성함',    t: 'text' },
                      { k: 'contact', lb: 'Phone', ph: '전화번호', t: 'tel'  },
                    ].map((f, i) => (
                      <div key={f.k} style={{
                        flex: 1, padding: '8px 12px',
                        borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                        display: 'flex', flexDirection: 'column', gap: '3px',
                      }}>
                        <span style={labelSt}>{f.lb}</span>
                        <input
                          type={f.t} placeholder={f.ph}
                          value={form[f.k as 'name' | 'contact']}
                          onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                          style={{
                            border: 'none', borderBottom: '1px solid #ddd',
                            outline: 'none', fontSize: '0.82rem',
                            background: 'transparent', fontFamily: 'inherit',
                            color: '#111', width: '100%', padding: '2px 0 4px',
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* 참석 인원 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '16px', padding: '9px 0', ...hairline,
                  }}>
                    {([-1, 1] as const).map(d => (
                      <button key={d} type="button" onClick={() => adjustGuests(d)}
                        disabled={form.attendance === 'no'}
                        style={{
                          width: '24px', height: '24px',
                          border: '1px solid #e0e0e0', borderRadius: '50%',
                          background: 'none',
                          cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#999', fontFamily: 'inherit',
                          opacity: form.attendance === 'no' ? 0.3 : 1,
                        }}
                      >{d < 0 ? '−' : '+'}</button>
                    ))}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.88rem', color: '#111', display: 'block' }}>
                        {form.totalGuests}명
                      </span>
                      <span style={labelSt}>참석 인원</span>
                    </div>
                  </div>

                  {/* 전달하기 */}
                  <div style={{ padding: '8px 14px 12px', marginTop: 'auto' }}>
                    <button type="submit" disabled={!canSubmit} style={{
                      width: '100%', padding: '10px',
                      background: '#111', color: 'white', border: 'none',
                      fontSize: '0.72rem', fontFamily: 'inherit',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      opacity: canSubmit ? 1 : 0.35,
                      transition: 'opacity 0.15s', letterSpacing: '2.5px',
                    }}>
                      {submitting ? '전송 중...' : '전달하기'}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>

          {/* z:6 — 오각형 플랩: transformOrigin top (y=ENV_TOP), 스크롤 → rotateX 증가 */}
          {/* 0deg=닫힘, ~90deg에서 backface hidden으로 사라짐, 200deg=완전 열림 */}
          <div style={{
            position: 'absolute',
            top: `${ENV_TOP}px`,
            left: 0, right: 0,
            height: `${ENV_H}px`,
            perspective: '800px',
            zIndex: 6,
            pointerEvents: 'none',
          }}>
            <div
              ref={flapInnerRef}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: '50% 0%',          // 힌지: 플랩 위쪽 모서리(=봉투 입구)
                transform: 'rotateX(0deg)',          // 초기: 닫힘
                backfaceVisibility: 'hidden',        // 90deg 이후 뒷면 숨김
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* 오각형 클립 */}
              <div style={{
                position: 'absolute', inset: 0,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
                filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.22))',
                ...pngBg(envelopeTopSrc),
              }}>
                {/* 모노그램 */}
                <div style={{
                  position: 'absolute', top: '26%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: '0.78rem',
                  color: 'rgba(110,98,84,0.65)',
                  letterSpacing: '3px', whiteSpace: 'nowrap', userSelect: 'none',
                }}>J &amp; J</div>
              </div>
            </div>
          </div>

          {/* z:10 — 봉투 앞면 하단 (V-노치): 카드 아래 부분을 가림 */}
          <div style={{
            position: 'absolute', top: `${ENV_TOP}px`, left: 0, right: 0,
            height: `${ENV_H}px`, zIndex: 10,
            clipPath: 'polygon(0% 100%, 0% 22%, 50% 78%, 100% 22%, 100% 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            ...pngBg(envelopeBodySrc),
          }} />

          {/* z:11 — 하단 립 (삼각형): V 아래 봉투 바닥 */}
          <div style={{
            position: 'absolute', top: `${ENV_TOP}px`, left: 0, right: 0,
            height: `${ENV_H}px`, zIndex: 11,
            clipPath: 'polygon(18% 44%, 82% 44%, 100% 100%, 0% 100%)',
            ...pngBg(envelopeBodySrc),
          }} />

        </div>
      </div>
    </section>
  )
}
