import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'

// ── 레퍼런스 사이트에서 추출한 봉투 PNG 이미지 ───────────────────────────────
import envelopeBodySrc  from '../assets/envelope-Bfk8GE_u.png'
import envelopeTopSrc   from '../assets/envelopeTop-DNGkXVSC.png'
import envelopeInnerSrc from '../assets/envelopeInner-Bl_NByj8.png'

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

// ── Layout constants ──────────────────────────────────────────────────────────
//
//   [ FLAP_TOP ]  ┌──────────────────────────────────┐  ← flap triangle (z:8)
//                 │         ╲       /                 │
//   [ ENV_TOP  ]  └──────────╲─────/──────────────────┘
//                 ┌──────────────────────────────────────┐  ← envelope body (z:6)
//                 │          INVITATION                  │
//                 │          2026.09.19                  │
//   [ CONTAINER]  └──────────────────────────────────────┘
//
//   Card (z:3) slides up from ENV_TOP → 0 on reveal.
//   Envelope body (z:6) overlaps the card's bottom 90px, hiding it inside.
//
const CARD_H      = 380   // card content height (px)
const ENV_OVERLAP = 90    // how many px of card bottom sit inside the envelope
const ENV_H       = 220   // envelope body height
const FLAP_H      = 120   // triangular flap height
const ENV_TOP     = CARD_H - ENV_OVERLAP   // 290 — where envelope body starts
const FLAP_TOP    = ENV_TOP - FLAP_H       // 170 — where flap starts
const CONTAINER_H = ENV_TOP + ENV_H        // 510 — total scene height
const SLIDE_AMOUNT = ENV_TOP               // 290 — card hides below this line when closed

export default function Rsvp() {
  const [form, setForm]             = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const { ref, revealed }           = useReveal(0.25)

  const setAttendance = (v: 'yes' | 'no') => {
    setForm(f => ({
      ...f,
      attendance:  v,
      totalGuests: v === 'yes' ? Math.max(1, f.totalGuests) : 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        attendance:  form.attendance,
        name:        form.name.trim(),
        contact:     form.contact.trim(),
        totalGuests: form.totalGuests,
        createdAt:   Timestamp.now(),
      })
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit    = form.name.trim() && form.contact.trim() && !submitting
  const adjustGuests = (delta: number) => {
    if (form.attendance === 'no') return
    setForm(f => ({ ...f, totalGuests: Math.max(1, f.totalGuests + delta) }))
  }

  const labelStyle: React.CSSProperties = {
    fontFamily:    "'Cormorant Garamond', serif",
    fontSize:      '0.58rem',
    letterSpacing: '3px',
    color:         '#aaa',
    display:       'block',
    textTransform: 'uppercase',
  }
  const hairline: React.CSSProperties = { borderBottom: '1px solid #ebebeb' }

  // PNG를 배경으로 꽉 채우는 헬퍼
  const pngBg = (src: string): React.CSSProperties => ({
    backgroundImage:    `url(${src})`,
    backgroundSize:     'cover',
    backgroundRepeat:   'no-repeat',
    backgroundPosition: 'center',
  })

  return (
    <section
      id="rsvp"
      ref={ref as React.RefObject<HTMLElement>}
      className={`dark-section${revealed ? ' revealed' : ''}`}
    >
      {/* 안내 문구 */}
      <p style={{
        fontFamily:    "'Gowun Batang', serif",
        fontSize:      '0.78rem',
        color:         'rgba(255,255,255,0.42)',
        letterSpacing: '1.5px',
        lineHeight:    2,
        marginBottom:  '32px',
      }}>
        원활한 식사 제공을 위해 참석 인원 확인이 필요합니다
      </p>

      {/* ── 씬 컨테이너 ── */}
      <div style={{
        position: 'relative',
        width:    '100%',
        maxWidth: '480px',
        margin:   '0 auto',
        height:   `${CONTAINER_H}px`,
        overflow: 'hidden',
      }}>

        {/* z:1 — 봉투 내부 이너 (open 시 보이는 안쪽 질감) */}
        <div style={{
          position: 'absolute',
          top:      `${ENV_TOP}px`,
          left: 0, right: 0,
          height:   `${ENV_H}px`,
          zIndex:   1,
          ...pngBg(envelopeInnerSrc),
        }} />

        {/* z:3 — 카드 — 섹션 진입 시 자동으로 슬라이드업 */}
        <div style={{
          position:   'absolute',
          top:        0, left: 0, right: 0,
          height:     `${CARD_H}px`,
          background: '#fff',
          zIndex:     3,
          boxShadow:  '0 16px 56px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)',
          transform:  revealed ? 'translateY(0)' : `translateY(${SLIDE_AMOUNT}px)`,
          transition: revealed ? 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.38s' : 'none',
          willChange: 'transform',
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* RSVP 제목 */}
            <div style={{ textAlign: 'center', padding: '22px 0 18px', ...hairline }}>
              <h2 style={{
                fontFamily:    "'PP Editorial Old', 'Cormorant Garamond', serif",
                fontStyle:     'italic',
                fontWeight:    200,
                fontSize:      '2rem',
                color:         '#111',
                margin:        0,
                lineHeight:    1,
                letterSpacing: '2px',
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
                <div style={{ display: 'flex', ...hairline }}>
                  {(['yes', 'no'] as const).map((v, i) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAttendance(v)}
                      style={{
                        flex:          1,
                        padding:       '15px 0',
                        border:        'none',
                        borderRight:   i === 0 ? '1px solid #ebebeb' : 'none',
                        background:    form.attendance === v ? '#111' : '#f8f8f8',
                        color:         form.attendance === v ? 'white' : '#bbb',
                        fontSize:      '0.8rem',
                        fontFamily:    'inherit',
                        cursor:        'pointer',
                        transition:    'all 0.2s',
                        letterSpacing: '1.5px',
                      }}
                    >
                      {v === 'yes' ? '참석' : '불참'}
                    </button>
                  ))}
                </div>

                {/* 성함 | 전화번호 */}
                <div style={{ display: 'flex', ...hairline }}>
                  <div style={{
                    flex: 1, padding: '12px 18px',
                    borderRight: '1px solid #ebebeb',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <span style={labelStyle}>Name</span>
                    <input
                      type="text"
                      placeholder="성함"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      style={{
                        border: 'none', borderBottom: '1px solid #d8d8d8',
                        outline: 'none', fontSize: '0.88rem',
                        background: 'transparent', fontFamily: 'inherit',
                        color: '#111', width: '100%', padding: '4px 0 6px',
                      }}
                    />
                  </div>
                  <div style={{
                    flex: 1, padding: '12px 18px',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}>
                    <span style={labelStyle}>Phone</span>
                    <input
                      type="tel"
                      placeholder="전화번호"
                      value={form.contact}
                      onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                      style={{
                        border: 'none', borderBottom: '1px solid #d8d8d8',
                        outline: 'none', fontSize: '0.88rem',
                        background: 'transparent', fontFamily: 'inherit',
                        color: '#111', width: '100%', padding: '4px 0 6px',
                      }}
                    />
                  </div>
                </div>

                {/* 참석 인원 */}
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', padding: '16px 0 14px', ...hairline,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '6px' }}>
                    {[-1, 1].map(delta => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => adjustGuests(delta)}
                        disabled={form.attendance === 'no'}
                        style={{
                          width: '30px', height: '30px',
                          border: '1px solid #e0e0e0', borderRadius: '50%',
                          background: 'none',
                          cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                          fontSize: '1.1rem', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#999', fontFamily: 'inherit',
                          opacity: form.attendance === 'no' ? 0.3 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >{delta < 0 ? '−' : '+'}</button>
                    ))}
                  </div>
                  <span style={{ fontSize: '1rem', color: '#111', marginBottom: '6px' }}>
                    {form.totalGuests}명
                  </span>
                  <span style={labelStyle}>참석 인원</span>
                </div>

                {/* 전달하기 */}
                <div style={{ padding: '14px 20px 18px' }}>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                      width:         '100%',
                      padding:       '14px',
                      background:    '#111',
                      color:         'white',
                      border:        'none',
                      fontSize:      '0.82rem',
                      fontFamily:    'inherit',
                      cursor:        canSubmit ? 'pointer' : 'not-allowed',
                      opacity:       canSubmit ? 1 : 0.35,
                      transition:    'opacity 0.15s',
                      letterSpacing: '2.5px',
                    }}
                  >
                    {submitting ? '전송 중...' : '전달하기'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>

        {/* z:6 — 봉투 뒷면 몸체 (카드 하단을 감싸는 메인 envelope.png) */}
        <div style={{
          position: 'absolute',
          top:      `${ENV_TOP}px`,
          left: 0, right: 0,
          height:   `${ENV_H}px`,
          zIndex:   6,
          boxShadow: '0 8px 36px rgba(0,0,0,0.26)',
          ...pngBg(envelopeBodySrc),
        }} />

        {/* z:7 — 봉투 앞면 아랫입술 V자 (카드 하단 경계를 덮음) */}
        <div style={{
          position: 'absolute',
          top:      `${ENV_TOP}px`,
          left: 0, right: 0,
          height:   `${ENV_H}px`,
          zIndex:   7,
          clipPath: 'polygon(0% 100%, 0% 44%, 50% 8%, 100% 44%, 100% 100%)',
          ...pngBg(envelopeBodySrc),
        }} />

        {/* z:8 — 플랩 (perspective wrapper) */}
        {/*   hinge = bottom of this element (= ENV_TOP)                */}
        {/*   closed: triangle points down, covers card top area        */}
        {/*   open  : rotateX(-180deg) → backface hidden → disappears   */}
        <div style={{
          position:      'absolute',
          top:           `${FLAP_TOP}px`,
          left: 0, right: 0,
          height:        `${FLAP_H}px`,
          perspective:   '800px',
          zIndex:        8,
          pointerEvents: 'none',
        }}>
          <div style={{
            position:           'absolute', inset: 0,
            transformOrigin:    '50% 100%',
            transform:          revealed ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            transition:         'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
          }}>
            {/* 삼각형 클립: 좌상 → 우상 → 중앙하 */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              filter:   'drop-shadow(0 6px 18px rgba(0,0,0,0.20))',
              ...pngBg(envelopeTopSrc),
            }}>
              {/* 모노그램 */}
              <div style={{
                position:      'absolute',
                top:           '30%',
                left:          '50%',
                transform:     'translate(-50%, -50%)',
                fontFamily:    "'Cormorant Garamond', serif",
                fontStyle:     'italic',
                fontSize:      '0.85rem',
                color:         'rgba(120,108,94,0.65)',
                letterSpacing: '3px',
                whiteSpace:    'nowrap',
                userSelect:    'none',
              }}>
                J &amp; J
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
