import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'

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
const initialForm: FormData = { attendance: 'yes', name: '', contact: '', totalGuests: 1 }

// ── Layout ────────────────────────────────────────────────────────────────────
//
//   0          CARD_H = 300        CARD_H + ENV_H = 510
//   ├──────────────────────────────┼──────────────────────┤
//   │  card area (slides up here)  │   envelope body       │
//   └──────────────────────────────┴───────────────────────┘
//
//   FLAP_TOP = 195   FLAP_H = 105
//   ├──────────────────────┤   ← flap sits just above envelope mouth (y=300)
//
//   Initially the card is pushed down by SLIDE_Y=300 so it lives inside the
//   envelope (y=300→510 clipped to container). The envelope front (z:5, V-notch)
//   and inner lining (z:2) fill that zone. When revealed: flap rotates open,
//   card slides up to y=0, fully visible above the envelope.
//
const CARD_H      = 300
const ENV_H       = 210
const FLAP_H      = 105
const CONTAINER_H = CARD_H + ENV_H  // 510

const ENV_TOP  = CARD_H            // 300 — top edge of envelope body
const FLAP_TOP = ENV_TOP - FLAP_H  // 195 — top of flap element (hinge at bottom = y 300)
const SLIDE_Y  = CARD_H            // 300 — card starts fully inside envelope

export default function Rsvp() {
  const [form, setForm]             = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const { ref, revealed }           = useReveal(0.2)

  const setAttendance = (v: 'yes' | 'no') =>
    setForm(f => ({ ...f, attendance: v, totalGuests: v === 'yes' ? Math.max(1, f.totalGuests) : 0 }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim() || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        attendance: form.attendance, name: form.name.trim(),
        contact: form.contact.trim(), totalGuests: form.totalGuests,
        createdAt: Timestamp.now(),
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
    fontFamily: "'Cormorant Garamond', serif", fontSize: '0.52rem',
    letterSpacing: '3px', color: '#aaa', display: 'block', textTransform: 'uppercase',
  }
  const hairline: React.CSSProperties = { borderBottom: '1px solid #ebebeb' }
  const pngBg = (src: string): React.CSSProperties => ({
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
  })

  return (
    <section
      id="rsvp"
      ref={ref as React.RefObject<HTMLElement>}
      className={`dark-section${revealed ? ' revealed' : ''}`}
      style={{ background: 'linear-gradient(to bottom, #1c1917 0%, #111111 60%)' }}
    >
      <p style={{
        fontFamily: "'Gowun Batang', serif", fontSize: '0.76rem',
        color: 'rgba(255,255,255,0.38)', letterSpacing: '1.5px',
        lineHeight: 2, marginBottom: '28px',
      }}>
        원활한 식사 제공을 위해 참석 인원 확인이 필요합니다
      </p>

      <div style={{
        position: 'relative', width: '100%',
        maxWidth: '420px', margin: '0 auto',
        height: `${CONTAINER_H}px`,
        overflow: 'hidden',
      }}>

        {/* ── z:1  ENVELOPE BACK — fills entire scene as envelope texture ────── */}
        {/* Visible in the top area (y=0→195) and behind the inner lining below.  */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${CONTAINER_H}px`, zIndex: 1,
          ...pngBg(envelopeBodySrc),
        }} />

        {/* ── z:2  INNER LINING — shows inside the envelope (below card) ──────── */}
        <div style={{
          position: 'absolute', top: `${ENV_TOP}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 2,
          ...pngBg(envelopeInnerSrc),
        }} />

        {/* ── z:3  CARD — slides up from inside the envelope ───────────────────── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${CARD_H}px`,
          background: '#fff',
          zIndex: 3,
          boxShadow: '0 16px 56px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.10)',
          transform:  revealed ? 'translateY(0)' : `translateY(${SLIDE_Y}px)`,
          transition: revealed ? 'transform 1.0s cubic-bezier(0.22, 1, 0.36, 1) 0.38s' : 'none',
          willChange: 'transform',
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* RSVP title */}
            <div style={{ textAlign: 'center', padding: '18px 0 14px', ...hairline }}>
              <h2 style={{
                fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
                fontStyle: 'italic', fontWeight: 200, fontSize: '1.9rem',
                color: '#111', margin: 0, lineHeight: 1, letterSpacing: '2px',
              }}>RSVP</h2>
            </div>

            {submitted ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#111', lineHeight: 2 }}>
                  전달해 주셔서 감사합니다 ✓
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* 참석 / 불참 */}
                <div style={{ display: 'flex', ...hairline }}>
                  {(['yes', 'no'] as const).map((v, i) => (
                    <button key={v} type="button" onClick={() => setAttendance(v)} style={{
                      flex: 1, padding: '11px 0', border: 'none',
                      borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                      background: form.attendance === v ? '#111' : '#f8f8f8',
                      color: form.attendance === v ? 'white' : '#bbb',
                      fontSize: '0.76rem', fontFamily: 'inherit',
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
                      flex: 1, padding: '10px 14px',
                      borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                      display: 'flex', flexDirection: 'column', gap: '5px',
                    }}>
                      <span style={labelSt}>{f.lb}</span>
                      <input
                        type={f.t} placeholder={f.ph}
                        value={form[f.k as 'name' | 'contact']}
                        onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                        style={{
                          border: 'none', borderBottom: '1px solid #ddd',
                          outline: 'none', fontSize: '0.85rem',
                          background: 'transparent', fontFamily: 'inherit',
                          color: '#111', width: '100%', padding: '3px 0 5px',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 참석 인원 */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '20px', padding: '12px 0', ...hairline,
                }}>
                  {([-1, 1] as const).map(d => (
                    <button key={d} type="button" onClick={() => adjustGuests(d)}
                      disabled={form.attendance === 'no'}
                      style={{
                        width: '28px', height: '28px',
                        border: '1px solid #e0e0e0', borderRadius: '50%',
                        background: 'none', cursor: form.attendance === 'no' ? 'not-allowed' : 'pointer',
                        fontSize: '1rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#999', fontFamily: 'inherit',
                        opacity: form.attendance === 'no' ? 0.3 : 1, transition: 'opacity 0.2s',
                      }}
                    >{d < 0 ? '−' : '+'}</button>
                  ))}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.95rem', color: '#111', display: 'block' }}>
                      {form.totalGuests}명
                    </span>
                    <span style={labelSt}>참석 인원</span>
                  </div>
                </div>

                {/* 전달하기 */}
                <div style={{ padding: '12px 18px 16px', marginTop: 'auto' }}>
                  <button type="submit" disabled={!canSubmit} style={{
                    width: '100%', padding: '13px',
                    background: '#111', color: 'white', border: 'none',
                    fontSize: '0.78rem', fontFamily: 'inherit',
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

        {/* ── z:5  ENVELOPE FRONT (V-notch) — covers card bottom, shows envelope ── */}
        {/* Sits at ENV_TOP, clipped to keep just the outer shell (V opening at top) */}
        <div style={{
          position: 'absolute', top: `${ENV_TOP}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 5,
          clipPath: 'polygon(0% 100%, 0% 28%, 50% 68%, 100% 28%, 100% 100%)',
          boxShadow: '0 8px 36px rgba(0,0,0,0.22)',
          ...pngBg(envelopeBodySrc),
        }} />

        {/* ── z:6  PENTAGON FLAP — hinged at bottom (y = ENV_TOP = 300) ─────────── */}
        {/* Element placed at FLAP_TOP (y=195), height FLAP_H (105px).              */}
        {/* transformOrigin '50% 100%' = hinge at the element's BOTTOM edge (y=300). */}
        {/* Initially flat (rotateX 0), opens to -180deg when revealed.             */}
        <div style={{
          position: 'absolute', top: `${FLAP_TOP}px`, left: 0, right: 0,
          height: `${FLAP_H}px`,
          perspective: '800px',
          zIndex: 6,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: '50% 100%',
            transform: revealed ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
          }}>
            {/* Pentagon shape: full-width top → narrows at 60% → point at bottom */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.22))',
              ...pngBg(envelopeTopSrc),
            }}>
              {/* Monogram */}
              <div style={{
                position: 'absolute', top: '32%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: '0.82rem',
                color: 'rgba(110,98,84,0.65)',
                letterSpacing: '3px', whiteSpace: 'nowrap', userSelect: 'none',
              }}>J &amp; J</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
