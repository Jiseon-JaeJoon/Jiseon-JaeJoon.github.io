import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

// ── 봉투 씬 레이아웃 상수 ────────────────────────────────────────────────────────
const CONTAINER_H  = 640
const CARD_W       = 310
const CARD_H       = 200
const ENV_W        = 336
const ENV_TOP      = 380
const ENV_H        = 230
const FLAP_H       = ENV_H
const FLAP_TOP     = ENV_TOP - FLAP_H   // = 150px (어두운 배경 위)
// 카드: 봉투 안에서 시작 (410-610px) → 스크롤 완료 시 봉투 위로 완전히 올라옴
const CARD_BASE_Y  = 410               // 봉투 내부 시작 (card bottom=610=ENV_BOTTOM, 딱 맞게 숨김)
const CARD_Y_TRAVEL = -200             // 최종: top=210px, bottom=410px=ENV_TOP (카드 자연스럽게 노출)

// ── 봉투 색상 (전체 통일로 하나의 물체처럼) ──────────────────────────────────────
const ENV_COLOR   = '#ebe5d8'   // 봉투 전체 크림
const INNER_COLOR = '#f9f6ef'   // 봉투 안감 (밝게 — V 개구부 대비 확보)
const FOLD_COLOR  = '#d8d0c0'   // 접힘선·하단립 (어둡게 — 물리적 그림자 표현)
const SEAL_COLOR  = '#b8955a'   // 왁스 씰 브론즈

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
function easeOut2(t: number) { return 1 - (1 - t) ** 2 }

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
  const [darkRevealed, setDarkRevealed] = useState(false)

  // 흰색 헤더 섹션 reveal
  const { ref: headerRef, revealed: headerRevealed } = useReveal(0.2)

  // 봉투 씬 refs
  const darkRef      = useRef<HTMLElement>(null)
  const cardRef      = useRef<HTMLDivElement>(null)
  const flapInnerRef = useRef<HTMLDivElement>(null)

  // 봉투 섹션: IntersectionObserver(페이드인) + scroll(애니메이션)
  useEffect(() => {
    const section = darkRef.current
    if (!section) return

    const ioObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setDarkRevealed(true) },
      { threshold: 0.04 }
    )
    ioObs.observe(section)

    const onScroll = () => {
      const rect    = section.getBoundingClientRect()
      const sectH   = section.offsetHeight
      const vh      = window.innerHeight
      const scrolled = clamp01(-rect.top / (sectH - vh))

      // 오각형 플랩: 0에서 시작 → 연속적으로 펼쳐짐 (fold line 기준으로 위로)
      const flapOpacity = clamp01(scrolled / 0.12)                    // 빠른 페이드인
      const flapScale   = easeOut2(clamp01(scrolled / 0.50))          // 0→1 자연스럽게 펼쳐짐

      // 카드: 30% 지연 후 상승 (오각형 충분히 나온 후), 이동량 줄임
      const t         = easeOut2(clamp01((scrolled - 0.30) / 0.65))
      const cardY     = lerp(0, CARD_Y_TRAVEL, t)
      const cardScale = lerp(0.96, 1.0, t)

      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-50%) translateY(${cardY}px) scale(${cardScale})`
      }
      if (flapInnerRef.current) {
        flapInnerRef.current.style.transform = `scale(${flapScale})`
        flapInnerRef.current.style.opacity   = `${flapOpacity}`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

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
    fontFamily: "'Cormorant Garamond', serif", fontSize: '0.48rem',
    letterSpacing: '2.5px', color: '#aaa', display: 'block', textTransform: 'uppercase',
  }
  const hairline: React.CSSProperties = { borderBottom: '1px solid #ebebeb' }

  const envEl = (extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    width: `${ENV_W}px`, ...extra,
  })

  const a = (delay: number): React.CSSProperties => ({
    opacity: headerRevealed ? undefined : 0,
    animation: headerRevealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════
          흰색 헤더 섹션 — "RSVP" 타이틀 + 설명 (Location/Gallery 스타일)
          id="rsvp" 여기에 둠 → 내비게이션 앵커
          ════════════════════════════════════════════════════════════════════════ */}
      <section
        id="rsvp"
        ref={headerRef}
        className={headerRevealed ? 'revealed' : ''}
      >
        <h2 className="section-title" style={{ marginBottom: '6px', ...a(0) }}>
          RSVP
        </h2>
        <p style={{
          fontFamily: "'Gowun Batang', serif",
          fontSize: '1.25rem', letterSpacing: '3px',
          color: 'var(--text-light)',
          marginBottom: '28px',
          ...a(80),
        }}>
          참석 여부
        </p>
        <p style={{
          fontFamily: "'Gowun Batang', serif",
          fontSize: '0.88rem', lineHeight: 2, letterSpacing: '1px',
          color: 'var(--text-light)',
          maxWidth: '340px', margin: '0 auto',
          ...a(160),
        }}>
          원활한 식사 준비를 위해<br />
          참석 여부와 인원을 알려주시면 감사하겠습니다
        </p>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          어두운 봉투 섹션 — 스크롤 기반 봉투 + 카드 애니메이션
          ════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={darkRef}
        className="dark-section"
        style={{
          display: 'block',
          minHeight: '120vh',
          padding: 0,
          background: 'linear-gradient(to bottom, #1c1917 0%, #111111 60%)',
          position: 'relative',
          transform: 'translateY(0)',
          opacity: darkRevealed ? 1 : 0,
          transition: 'opacity 1.8s ease-out',
        }}
      >
        {/* sticky wrapper — 섹션 스크롤 시 뷰포트에 고정, 내용은 세로 중앙 정렬 */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>

          {/* ── 봉투 씬 컨테이너 ──────────────────────────────────────────────── */}
          <div style={{
            position: 'relative',
            width: `${ENV_W + 60}px`,
            maxWidth: '100%',
            height: `${CONTAINER_H}px`,
          }}>

            {/* z:1 봉투 뒷면 — 같은 크림색, 전체 그림자 */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H + 10}px`,
              zIndex: 1, backgroundColor: ENV_COLOR,
              borderRadius: '0 0 6px 6px',
              boxShadow: '0 28px 70px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.30)',
            })} />

            {/* z:2 봉투 내부 안감 (플랩 열리면 V-갭으로 보임) */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H}px`,
              zIndex: 2, backgroundColor: INNER_COLOR,
            })} />

            {/* z:3 카드 (스크롤로 translateY 업데이트) */}
            <div
              ref={cardRef}
              style={{
                position: 'absolute',
                top: `${CARD_BASE_Y}px`, left: '50%',
                transform: 'translateX(-50%) translateY(0px) scale(0.96)',
                width: `${CARD_W}px`, height: `${CARD_H}px`,
                background: '#fff', zIndex: 3, overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)',
                willChange: 'transform',
              }}
            >
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

                {/* RSVP 소제목 */}
                <div style={{ textAlign: 'center', padding: '8px 0 6px', ...hairline }}>
                  <h3 style={{
                    fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontWeight: 200, fontSize: '1.45rem',
                    color: '#111', margin: 0, lineHeight: 1, letterSpacing: '2px',
                  }}>RSVP</h3>
                </div>

                {submitted ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#111', lineHeight: 2 }}>
                      전달해 주셔서 감사합니다 ✓
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* 참석 / 불참 */}
                    <div style={{ display: 'flex', ...hairline }}>
                      {(['yes', 'no'] as const).map((v, i) => (
                        <button key={v} type="button" onClick={() => setAttendance(v)} style={{
                          flex: 1, padding: '8px 0', border: 'none',
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
                          flex: 1, padding: '6px 10px',
                          borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                          display: 'flex', flexDirection: 'column', gap: '2px',
                        }}>
                          <span style={labelSt}>{f.lb}</span>
                          <input
                            type={f.t} placeholder={f.ph}
                            value={form[f.k as 'name' | 'contact']}
                            onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                            style={{
                              border: 'none', borderBottom: '1px solid #ddd',
                              outline: 'none', fontSize: '0.8rem',
                              background: 'transparent', fontFamily: 'inherit',
                              color: '#111', width: '100%', padding: '2px 0 3px',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* 참석 인원 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '14px', padding: '7px 0', ...hairline,
                    }}>
                      {([-1, 1] as const).map(d => (
                        <button key={d} type="button" onClick={() => adjustGuests(d)}
                          disabled={form.attendance === 'no'}
                          style={{
                            width: '22px', height: '22px',
                            border: '1px solid #e0e0e0', borderRadius: '50%',
                            background: 'none',
                            cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#999', fontFamily: 'inherit',
                            opacity: form.attendance === 'no' ? 0.3 : 1,
                          }}
                        >{d < 0 ? '−' : '+'}</button>
                      ))}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.86rem', color: '#111', display: 'block' }}>
                          {form.totalGuests}명
                        </span>
                        <span style={labelSt}>참석 인원</span>
                      </div>
                    </div>

                    {/* 전달하기 */}
                    <div style={{ padding: '6px 12px 10px', marginTop: 'auto' }}>
                      <button type="submit" disabled={!canSubmit} style={{
                        width: '100%', padding: '9px',
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

            {/* z:2 플랩 — 이미 열린 상태의 오각형. 스크롤로 살짝 커짐 (3D 회전 없음) */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `${FLAP_TOP}px`, width: `${ENV_W}px`, height: `${FLAP_H}px`,
              zIndex: 2, pointerEvents: 'none',
            }}>
              <div
                ref={flapInnerRef}
                style={{
                  position: 'absolute', inset: 0,
                  transformOrigin: '50% 100%',   // 봉투 접힘선(하단)을 기준으로 스케일
                  transform: 'scale(0)',          // 처음엔 invisible → 스크롤 시 펼쳐짐
                  opacity: 0,
                  willChange: 'transform, opacity',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  // 위로 향하는 오각형 — 레퍼런스처럼 "열린 봉투 뚜껑" 형태
                  clipPath: 'polygon(50% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)',
                  backgroundColor: ENV_COLOR,
                  filter: 'drop-shadow(0 -6px 18px rgba(0,0,0,0.40))',
                }}>
                  {/* 이니셜 — 오각형 중상단 */}
                  <div style={{
                    position: 'absolute', top: '28%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: '0.78rem',
                    color: 'rgba(100,85,65,0.55)',
                    letterSpacing: '4px', whiteSpace: 'nowrap', userSelect: 'none',
                  }}>J &amp; J</div>

                  {/* 왁스 씰 — 접힘선 바로 위 (레퍼런스처럼 봉투 중심부에 위치) */}
                  <div style={{
                    position: 'absolute', top: '78%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: SEAL_COLOR,
                    boxShadow: '0 3px 14px rgba(0,0,0,0.50), inset 0 1px 4px rgba(255,255,255,0.25)',
                    border: '1.5px solid rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    userSelect: 'none',
                  }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: '0.62rem',
                      color: 'rgba(255,255,255,0.92)', letterSpacing: '1px',
                    }}>J·J</span>
                  </div>
                </div>
              </div>
            </div>

            {/* z:10 봉투 앞면 V-접힘 (플랩·뒷면과 같은 크림색 → 통일감) */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H}px`, zIndex: 10,
              clipPath: 'polygon(0% 100%, 0% 20%, 50% 76%, 100% 20%, 100% 100%)',
              backgroundColor: ENV_COLOR,
            })} />

            {/* z:11 봉투 하단 삼각 (어둡게 → 물리적 그림자·접힘 표현) */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H}px`, zIndex: 11,
              clipPath: 'polygon(14% 44%, 86% 44%, 100% 100%, 0% 100%)',
              backgroundColor: FOLD_COLOR,
            })} />

            {/* ENV_TOP 경계선 — 플랩·앞면 연결부 접힘선 */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `${ENV_TOP}px`, width: `${ENV_W}px`, height: '1px',
              zIndex: 9, backgroundColor: 'rgba(130,110,85,0.55)', pointerEvents: 'none',
            }} />

            {/* 장식 사진 (봉투 왼쪽에 걸쳐 있는 흑백 소형 포토) */}
            <div style={{
              position: 'absolute',
              left: '50%', marginLeft: `-${ENV_W / 2 + 14}px`,
              top: `${ENV_TOP - 58}px`,
              width: '70px', height: '88px',
              zIndex: 13, overflow: 'hidden',
              boxShadow: '0 4px 18px rgba(0,0,0,0.50)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}>
              <img
                src="/Image/webp/LCS_0686.webp"
                alt=""
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center 30%',
                  filter: 'grayscale(100%) contrast(1.05) brightness(0.88)',
                  display: 'block',
                }}
              />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
