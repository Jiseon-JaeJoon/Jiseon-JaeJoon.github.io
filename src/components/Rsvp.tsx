import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

import envelopeBodySrc  from '../assets/envelope-Bfk8GE_u.png'
import envelopeTopSrc   from '../assets/envelopeTop-DNGkXVSC.png'
import envelopeInnerSrc from '../assets/envelopeInner-Bl_NByj8.png'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

// ── 레이아웃 상수 ──────────────────────────────────────────────────────────────
// 봉투 바디는 씬 아래쪽에 위치, 카드가 위로 솟아오름
const CONTAINER_H  = 640   // 씬 전체 높이

const CARD_W       = 310   // 카드 너비
const CARD_H       = 200   // 카드 높이
const CARD_BASE_Y  = 410   // 카드 초기 top (봉투 안 깊이)

const ENV_W        = 336   // 봉투 너비 (카드보다 살짝 넓음)
const ENV_TOP      = 390   // 봉투 입구(mouth) y 위치
const ENV_H        = 220   // 봉투 바디 높이

// 플랩: 봉투 입구 *위*에 위치 → 어두운 배경 앞에서 오각형이 선명하게 보임
const FLAP_H       = ENV_H           // 플랩 높이
const FLAP_TOP     = ENV_TOP - FLAP_H  // = 170px  (씬 상단~봉투 입구 사이 어두운 영역)

// 카드 완전히 나왔을 때 top = 55px → travel = -(410-55) = -355px
const CARD_Y_TRAVEL = -(CARD_BASE_Y - 55)

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
function easeOut2(t: number) { return 1 - (1 - t) ** 2 }   // 부드럽지만 easeOut3보다 완만

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

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // ① 섹션 최초 진입 → 페이드인
    const ioObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setRevealed(true) },
      { threshold: 0.04 }
    )
    ioObs.observe(section)

    // ② 스크롤 위치 → 카드 Y / 플랩 각도 직접 DOM 업데이트
    const onScroll = () => {
      const rect    = section.getBoundingClientRect()
      const sectH   = section.offsetHeight
      const vh      = window.innerHeight
      const scrolled = clamp01(-rect.top / (sectH - vh))

      // 플랩: 선형 진행, 스크롤 65%까지 서서히 열림 (0→200deg)
      // 90deg 지나면 backfaceVisibility:hidden 으로 보이지 않음 = 봉투 입구 열림
      const flapAngle = lerp(0, 200, clamp01(scrolled / 0.65))

      // 카드: 5% 지연, easeOut2로 85%까지 부드럽게 올라옴
      const cardP  = easeOut2(clamp01((scrolled - 0.05) / 0.80))
      const cardY  = lerp(0, CARD_Y_TRAVEL, cardP)

      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(-50%) translateY(${cardY}px)`
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

  const pngBg = (src: string): React.CSSProperties => ({
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
  })

  // 봉투 요소 공통 스타일 (중앙 배치)
  const envEl = (extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: `${ENV_W}px`,
    ...extra,
  })

  return (
    <section
      id="rsvp"
      ref={sectionRef}
      className="dark-section"
      style={{
        display: 'block',
        minHeight: '160vh',
        padding: 0,
        background: 'linear-gradient(to bottom, #1c1917 0%, #111111 60%)',
        position: 'relative',
        transform: 'translateY(0)',
        opacity: revealed ? 1 : 0,
        transition: 'opacity 1.8s ease-out',
      }}
    >
      {/* sticky wrapper — 뷰포트 수직 중앙에 고정 */}
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
          lineHeight: 2, marginBottom: '20px', textAlign: 'center',
          padding: '0 24px',
        }}>
          원활한 식사 제공을 위해 참석 인원 확인이 필요합니다
        </p>

        {/* ── 봉투 씬 컨테이너 ────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: `${ENV_W + 60}px`,
          maxWidth: '100%',
          height: `${CONTAINER_H}px`,
        }}>

          {/* ── z:1  봉투 뒷면 백판 ─────────────────────────────────────────────
              ENV_TOP부터만 채움 → 위쪽은 어두운 배경이 보여 플랩이 대비됨       */}
          <div style={envEl({
            top: `${ENV_TOP}px`,
            height: `${ENV_H + 10}px`,
            zIndex: 1,
            ...pngBg(envelopeBodySrc),
            borderRadius: '0 0 4px 4px',
          })} />

          {/* ── z:2  봉투 내부 안감 ─────────────────────────────────────────────
              플랩이 열리면 내부 안감이 보임                                      */}
          <div style={envEl({
            top: `${ENV_TOP}px`,
            height: `${ENV_H}px`,
            zIndex: 2,
            ...pngBg(envelopeInnerSrc),
          })} />

          {/* ── z:3  카드 ───────────────────────────────────────────────────────
              scroll handler가 translateY로 봉투 안→위로 이동                     */}
          <div
            ref={cardRef}
            style={{
              position: 'absolute',
              top:  `${CARD_BASE_Y}px`,
              left: '50%',
              transform: 'translateX(-50%) translateY(0px)',
              width:  `${CARD_W}px`,
              height: `${CARD_H}px`,
              background: '#fff',
              zIndex: 3,
              overflow: 'hidden',                 // 내용이 카드 밖으로 넘치지 않도록
              boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/* RSVP 제목 */}
              <div style={{ textAlign: 'center', padding: '8px 0 6px', ...hairline }}>
                <h2 style={{
                  fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontWeight: 200, fontSize: '1.45rem',
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

          {/* ── z:12 오각형 플랩 ─────────────────────────────────────────────────
              봉투 입구(ENV_TOP) 위 어두운 영역에 위치.
              힌지 = FLAP_TOP (플랩 상단). rotateX 증가 → 위로 젖혀지며 입구 열림.
              어두운 배경에 흰 오각형이 뚜렷하게 보임. z:12 로 V-노치보다 위에 위치.  */}
          <div style={{
            position: 'absolute',
            left: '50%', transform: 'translateX(-50%)',
            top: `${FLAP_TOP}px`,                  // 170px — 어두운 배경 위
            width: `${ENV_W}px`,
            height: `${FLAP_H}px`,
            perspective: '900px',
            zIndex: 12,
            pointerEvents: 'none',
          }}>
            <div
              ref={flapInnerRef}
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: '50% 0%',           // 힌지: 플랩 상단 (FLAP_TOP)
                transform: 'rotateX(0deg)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* 오각형 클립: 상단 전체 너비 → 하단 중앙 꼭짓점 */}
              <div style={{
                position: 'absolute', inset: 0,
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
                ...pngBg(envelopeTopSrc),
                // 봉투 바디와 구분되는 그림자 (오각형 윤곽이 어두운 배경에서 선명하게 보임)
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.50))',
              }}>
                {/* 봉투 하단 접힘선 */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '8%', right: '8%',
                  height: '1px',
                  background: 'rgba(160,150,140,0.30)',
                }} />
                {/* 모노그램 */}
                <div style={{
                  position: 'absolute', top: '28%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: '0.74rem',
                  color: 'rgba(100,90,78,0.50)',
                  letterSpacing: '3px', whiteSpace: 'nowrap', userSelect: 'none',
                }}>J &amp; J</div>
              </div>
            </div>
          </div>

          {/* ── z:10 봉투 앞면 V-노치 ──────────────────────────────────────────
              카드 하단(봉투 안쪽)을 가리는 앞면 패널. 봉투 fold line 보임.      */}
          <div style={envEl({
            top: `${ENV_TOP}px`,
            height: `${ENV_H}px`,
            zIndex: 10,
            clipPath: 'polygon(0% 100%, 0% 20%, 50% 76%, 100% 20%, 100% 100%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.28)',
            ...pngBg(envelopeBodySrc),
          })} />

          {/* ── z:11 봉투 하단 립 ──────────────────────────────────────────────
              봉투 바닥 사다리꼴 fold                                            */}
          <div style={envEl({
            top: `${ENV_TOP}px`,
            height: `${ENV_H}px`,
            zIndex: 11,
            clipPath: 'polygon(14% 44%, 86% 44%, 100% 100%, 0% 100%)',
            ...pngBg(envelopeBodySrc),
          })} />

          {/* ── 장식 사진: 봉투 왼쪽에 걸쳐 있는 흑백 소형 포토 ──────────────
              레퍼런스 4번째 이미지처럼 봉투/카드 경계에 살짝 겹침              */}
          <div style={{
            position: 'absolute',
            left: '50%',
            marginLeft: `-${ENV_W / 2 + 14}px`,
            top: `${ENV_TOP - 58}px`,
            width: '70px',
            height: '88px',
            zIndex: 13,
            overflow: 'hidden',
            boxShadow: '0 4px 18px rgba(0,0,0,0.50)',
            border: '2px solid rgba(255,255,255,0.15)',
          }}>
            <img
              src="/Image/webp/LCS_0686.webp"
              alt=""
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 30%',
                filter: 'grayscale(100%) contrast(1.05) brightness(0.88)',
                display: 'block',
              }}
            />
          </div>

        </div>
      </div>
    </section>
  )
}
