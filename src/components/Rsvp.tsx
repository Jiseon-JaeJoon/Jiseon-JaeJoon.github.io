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

// Layout
// CARD_H=300, ENV_H=240, OVERLAP=50
// ENV_Y=250, CONTAINER_H=490, SLIDE_AMOUNT=250
const CARD_H      = 300
const ENV_H       = 240
const OVERLAP     =  50
const ENV_Y       = CARD_H - OVERLAP
const CONTAINER_H = ENV_Y + ENV_H
const SLIDE_AMOUNT = ENV_Y

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
        maxWidth: '420px',
        margin: '0 auto',
        height: `${CONTAINER_H}px`,
        overflow: 'hidden',
      }}>

        {/* CARD z:3 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${CARD_H}px`,
          background: '#fff',
          zIndex: 3,
          boxShadow: '0 12px 48px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.10)',
          transform:  revealed ? 'translateY(0)' : `translateY(${SLIDE_AMOUNT}px)`,
          transition: revealed ? 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.35s' : 'none',
          willChange: 'transform',
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

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

                <div style={{ display: 'flex', ...hairline }}>
                  {(['yes', 'no'] as const).map((v, i) => (
                    <button key={v} type="button" onClick={() => setAttendance(v)} style={{
                      flex: 1, padding: '12px 0', border: 'none',
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

                <div style={{ display: 'flex', ...hairline }}>
                  {[
                    { k: 'name',    lb: 'Name',  ph: '성함',    t: 'text' },
                    { k: 'contact', lb: 'Phone', ph: '전화번호', t: 'tel'  },
                  ].map((f, i) => (
                    <div key={f.k} style={{
                      flex: 1, padding: '10px 16px',
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

        {/* ENVELOPE LAYERS — top: ENV_Y, height: ENV_H */}

        {/* z:1 — Inner lining */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 1,
          ...pngBg(envelopeInnerSrc),
        }} />

        {/* z:5 — Pentagon flap, transformOrigin: TOP CENTER */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 5,
          perspective: '900px', pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: '50% 0%',
            transform: revealed ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.20))',
              ...pngBg(envelopeTopSrc),
            }}>
              <div style={{
                position: 'absolute', top: '22%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: '0.82rem',
                color: 'rgba(110,98,84,0.60)',
                letterSpacing: '3px', whiteSpace: 'nowrap', userSelect: 'none',
              }}>J &amp; J</div>
            </div>
          </div>
        </div>

        {/* z:10 — Body back */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 10,
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 20%, 50% 80%, 0% 20%)',
          boxShadow: '0 8px 36px rgba(0,0,0,0.22)',
          ...pngBg(envelopeBodySrc),
        }} />

        {/* z:11 — Bottom lip */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 11,
          clipPath: 'polygon(20% 45%, 80% 45%, 100% 100%, 0% 100%)',
          ...pngBg(envelopeBodySrc),
        }} />

      </div>
    </section>
  )
}
