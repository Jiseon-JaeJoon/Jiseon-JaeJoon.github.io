import React, { useState, useEffect, useRef } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'
import envFaceTexture  from '../assets/envelopeTop-DNGkXVSC.png'
import envInnerTexture from '../assets/envelopeInner-Bl_NByj8.png'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

// ── 봉투 씬 레이아웃 상수 ────────────────────────────────────────────────────────
const CONTAINER_H   = 580
const CARD_W        = 310
const CARD_H        = 220               // 전달하기 버튼 살짝 여유
const ENV_W         = 336
const ENV_TOP       = 160              // 봉투를 씬 상단으로 올려 갭 제거
const ENV_H         = 230
const FLAP_H        = ENV_H
const CARD_BASE_Y   = 190             // ENV_TOP + 30 (봉투 안쪽 시작)
const CARD_Y_TRAVEL = -200             // 카드 상승 거리

const SEAL_COLOR = '#b8955a'

// ── easing 함수 (기존 quadratic → cubic/inOut 으로 부드럽게) ──────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
// 플랩: ease-in-out — 자연스러운 뚜껑 열림
function easeInOut2(t: number) { return t < 0.5 ? 2*t*t : 1 - (-2*t+2)**2/2 }
// 카드: ease-out cubic — 빠르게 나왔다가 부드럽게 멈춤
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
  const [darkRevealed, setDarkRevealed] = useState(false)

  // 흰색 헤더 섹션 reveal
  const { ref: headerRef, revealed: headerRevealed } = useReveal(0.2)

  // 봉투 씬 refs
  const darkRef        = useRef<HTMLElement>(null)
  const cardRef        = useRef<HTMLDivElement>(null)
  const flapInnerRef   = useRef<HTMLDivElement>(null)

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
      // 봉투가 화면 하단에 나타나는 순간(rect.top=vh)부터 시작, 섹션 끝에서 완료
      const scrolled = clamp01((vh - rect.top) / sectH)

      // 플랩: 봉투가 화면에 등장하는 시점(~32%)부터 → 60%에 완료
      const flapAngle = lerp(90, 160, easeInOut2(clamp01((scrolled - 0.32) / 0.28)))

      // 카드: 봉투 등장 시점(~32%)부터 → 62%에 완료 (rotateX 45° 초기)
      const t        = easeOut3(clamp01((scrolled - 0.32) / 0.30))
      const cardY    = lerp(0, CARD_Y_TRAVEL, t)
      const cardRotX = lerp(45, 3, t)

      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-50%) translateY(${cardY}px) rotateX(${cardRotX}deg)`
      }
      if (flapInnerRef.current) {
        flapInnerRef.current.style.transform = `rotateX(${flapAngle}deg)`
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
        {/* <h2 className="section-title" style={{ marginBottom: '6px', ...a(0) }}>
          RSVP
        </h2> */}
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
          height: '106vh',
          padding: 0,
          background: '#ffffff',   // 섹션 배경은 흰색 — 다크는 sticky wrapper에만
          position: 'relative',
          opacity: darkRevealed ? 1 : 0,
          transition: 'opacity 1.2s ease-out',
          transform: 'none',
        }}
      >
        {/* sticky wrapper — index.css body의 overflow-x:hidden 제거 후 CSS sticky 정상 동작 */}
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          // 봉투 위쪽 흰색→검정, 봉투 밑 검정 → viewport 하단 근처까지 유지 후 짧게 페이드
          background: `linear-gradient(to bottom,
            #ffffff calc((100vh - ${CONTAINER_H}px) / 2 + ${ENV_TOP - 20}px),
            #111111 calc((100vh - ${CONTAINER_H}px) / 2 + ${ENV_TOP + 20}px),
            #111111 88vh,
            rgba(17,17,17,0) 96vh
          )`,
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
            perspective: '1000px',
            zIndex: 1,
          }}>

            {/* z:1 봉투 뒷면 — 위 좁고 아래 넓은 사다리꼴 */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H + 10}px`,
              zIndex: 1,
              backgroundImage: `url(${envFaceTexture})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
              boxShadow: '0 28px 70px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.30)',
            })} />

            {/* z:2 봉투 내부 안감 — 위 좁고 아래 넓은 사다리꼴 */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H}px`,
              zIndex: 2,
              backgroundImage: `url(${envInnerTexture})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
            })} />

            {/* z:3 카드 (스크롤로 translateY 업데이트) */}
            <div
              ref={cardRef}
              style={{
                position: 'absolute',
                top: `${CARD_BASE_Y}px`, left: '50%',
                transform: 'translateX(-50%) translateY(0px) rotateX(30deg)',
                transformOrigin: '50% 0%',
                width: `${CARD_W}px`, height: `${CARD_H}px`,
                backgroundColor: '#faf9f7',
                zIndex: 3, overflow: 'hidden',
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

                    {/* 참석 인원 — [−] 1명/참석인원 [+] 순서 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '14px', padding: '7px 0', ...hairline,
                    }}>
                      {([-1, 1] as const).map((d, i) => (
                        <React.Fragment key={d}>
                          <button type="button" onClick={() => adjustGuests(d)}
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
                          {i === 0 && (
                            <div style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.86rem', color: '#111', display: 'block' }}>
                                {form.totalGuests}명
                              </span>
                              <span style={labelSt}>참석 인원</span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
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

            {/* z:2 플랩 — 레퍼런스 스타일: rotateX 3D 폴드, top=ENV_TOP, transform-origin 상단 */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `${ENV_TOP}px`, width: `${ENV_W}px`, height: `${FLAP_H}px`,
              zIndex: 2, pointerEvents: 'none',
            }}>
              <div
                ref={flapInnerRef}
                style={{
                  position: 'absolute', inset: 0,
                  transformOrigin: '50% 0%',     // fold line(상단)을 기준으로 rotateX
                  transform: 'rotateX(90deg)',    // 초기: edge-on = invisible
                  willChange: 'transform',
                }}
              >
                {/* 아래로 향하는 오각형 — 사다리꼴 상단 맞춤 */}
                <div style={{
                  position: 'absolute', inset: 0,
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  backgroundImage: `url(${envFaceTexture})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'drop-shadow(0 -8px 20px rgba(0,0,0,0.45))',
                }}>
                  {/* 왁스 씰 — 오각형 중앙 (fold line 근처) */}
                  <div style={{
                    position: 'absolute', top: '22%', left: '50%',
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

            {/* z:10 봉투 앞면 V-접힘 — 외곽을 사다리꼴 기울기에 맞춤 */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H}px`, zIndex: 10,
              clipPath: 'polygon(0% 100%, 4% 20%, 50% 76%, 96% 20%, 100% 100%)',
              backgroundImage: `url(${envFaceTexture})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            })} />

            {/* z:11 봉투 하단 사다리꼴 — z:1과 동일한 높이(ENV_H+10)로 바닥까지 딱 맞춤 */}
            <div style={envEl({
              top: `${ENV_TOP}px`, height: `${ENV_H + 10}px`, zIndex: 11,
              clipPath: 'polygon(18% 42%, 82% 42%, 100% 100%, 0% 100%)',
              backgroundImage: `url(${envFaceTexture})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(0.82)',
            })} />

            {/* ENV_TOP 접힘선 — 미세한 구분선 */}
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              top: `${ENV_TOP}px`, width: `${ENV_W}px`, height: '1px',
              zIndex: 9, backgroundColor: 'rgba(180,160,140,0.35)', pointerEvents: 'none',
            }} />

            {/* INVITATION 텍스트 — 항상 표시 (애니메이션 없음) */}
            <div
              style={{
                position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                top: `${ENV_TOP + 130}px`,
                width: `${ENV_W}px`,
                textAlign: 'center', zIndex: 12, pointerEvents: 'none',
              }}
            >
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontWeight: 1000, fontSize: '1.3rem',
                letterSpacing: '5px', color: 'rgba(255,255,255,0.97)',
              }}>INVITATION</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '3px',
                color: 'rgba(255,255,255,0.85)', marginTop: '6px',
              }}>2026.09.19</div>
            </div>

            {/* 장식 사진 (봉투 왼쪽에 걸쳐 있는 흑백 소형 포토) */}
            <div style={{
              position: 'absolute',
              left: '50%', marginLeft: `-${ENV_W / 2 + 14}px`,
              top: `${ENV_TOP + 15}px`,
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
