import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'

// ── 레퍼런스 사이트(명진·혜원) 봉투 PNG 3장 ────────────────────────────────
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

// ── 레이아웃 상수 ─────────────────────────────────────────────────────────────
//
//  ┌──────────────────────────────────┐  ← 컨테이너 top (0)
//  │            CARD                  │  z:3  (CARD_H = 380px)
//  │                                  │
//  │   ← 카드 하단 60px은 봉투 안으로 →  │
//  ├──────────────────────────────────┤  ← ENV_Y = 320px
//  │  ╲      PENTAGON FLAP      ╱    │  z:5  (오각형, transformOrigin: top)
//  │   ╲___________________________╱  │
//  │         ENVELOPE BODY            │  z:10 (inverted-V clip)
//  │         INVITATION 2026.09.19    │
//  └──────────────────────────────────┘  ← CONTAINER_H = 520px
//
//  닫힘: 카드 translateY(320) → 봉투 안에 숨김 / 플랩 rotateX(0)  → 오각형 덮음
//  열림: 카드 translateY(0)   → 위로 슬라이드    / 플랩 rotateX(-180deg) → top-pivot 회전 후 숨김
//
const CARD_H      = 380  // 카드 높이
const ENV_H       = 200  // 봉투 영역 높이 (레퍼런스와 동일 비율)
const OVERLAP     =  60  // 카드 하단이 봉투 안으로 들어가는 깊이
const ENV_Y       = CARD_H - OVERLAP   // 320px — 봉투 영역 시작
const CONTAINER_H = ENV_Y + ENV_H      // 520px — 씬 전체 높이
const SLIDE_AMOUNT = ENV_Y             // 320px — 닫힘 시 카드 translateY

export default function Rsvp() {
  const [form, setForm]             = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const { ref, revealed }           = useReveal(0.25)

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

  const label: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '0.58rem',
    letterSpacing: '3px', color: '#aaa', display: 'block', textTransform: 'uppercase',
  }
  const hairline: React.CSSProperties = { borderBottom: '1px solid #ebebeb' }

  // PNG 배경 공통 스타일
  const pngBg = (src: string): React.CSSProperties => ({
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  })

  return (
    <section
      id="rsvp"
      ref={ref as React.RefObject<HTMLElement>}
      className={`dark-section${revealed ? ' revealed' : ''}`}
    >
      <p style={{
        fontFamily: "'Gowun Batang', serif", fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.42)', letterSpacing: '1.5px',
        lineHeight: 2, marginBottom: '32px',
      }}>
        원활한 식사 제공을 위해 참석 인원 확인이 필요합니다
      </p>

      {/* ── 씬 컨테이너 ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: '480px',
        margin: '0 auto', height: `${CONTAINER_H}px`, overflow: 'hidden',
      }}>

        {/* ── CARD (z:3) — ENV_Y 아래에 숨어있다가 위로 슬라이드 ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${CARD_H}px`,
          background: '#fff',
          zIndex: 3,
          boxShadow: '0 16px 56px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)',
          transform:  revealed ? 'translateY(0)' : `translateY(${SLIDE_AMOUNT}px)`,
          transition: revealed ? 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.38s' : 'none',
          willChange: 'transform',
        }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* RSVP 제목 */}
            <div style={{ textAlign: 'center', padding: '22px 0 18px', ...hairline }}>
              <h2 style={{
                fontFamily: "'PP Editorial Old', 'Cormorant Garamond', serif",
                fontStyle: 'italic', fontWeight: 200, fontSize: '2rem',
                color: '#111', margin: 0, lineHeight: 1, letterSpacing: '2px',
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
                    <button key={v} type="button" onClick={() => setAttendance(v)} style={{
                      flex: 1, padding: '15px 0', border: 'none',
                      borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                      background: form.attendance === v ? '#111' : '#f8f8f8',
                      color: form.attendance === v ? 'white' : '#bbb',
                      fontSize: '0.8rem', fontFamily: 'inherit',
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '1.5px',
                    }}>
                      {v === 'yes' ? '참석' : '불참'}
                    </button>
                  ))}
                </div>

                {/* 성함 | 전화번호 */}
                <div style={{ display: 'flex', ...hairline }}>
                  {[
                    { key: 'name',    label2: 'Name',  ph: '성함',    type: 'text' },
                    { key: 'contact', label2: 'Phone', ph: '전화번호', type: 'tel'  },
                  ].map((f, i) => (
                    <div key={f.key} style={{
                      flex: 1, padding: '12px 18px',
                      borderRight: i === 0 ? '1px solid #ebebeb' : 'none',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                    }}>
                      <span style={label}>{f.label2}</span>
                      <input
                        type={f.type}
                        placeholder={f.ph}
                        value={form[f.key as 'name' | 'contact']}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        style={{
                          border: 'none', borderBottom: '1px solid #d8d8d8',
                          outline: 'none', fontSize: '0.88rem',
                          background: 'transparent', fontFamily: 'inherit',
                          color: '#111', width: '100%', padding: '4px 0 6px',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* 참석 인원 */}
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', padding: '16px 0 14px', ...hairline,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '6px' }}>
                    {([-1, 1] as const).map(d => (
                      <button key={d} type="button" onClick={() => adjustGuests(d)}
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
                      >{d < 0 ? '−' : '+'}</button>
                    ))}
                  </div>
                  <span style={{ fontSize: '1rem', color: '#111', marginBottom: '6px' }}>
                    {form.totalGuests}명
                  </span>
                  <span style={label}>참석 인원</span>
                </div>

                {/* 전달하기 */}
                <div style={{ padding: '14px 20px 18px' }}>
                  <button type="submit" disabled={!canSubmit} style={{
                    width: '100%', padding: '14px',
                    background: '#111', color: 'white', border: 'none',
                    fontSize: '0.82rem', fontFamily: 'inherit',
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

        {/* ── 봉투 영역 (ENV_Y ~ CONTAINER_H) — 카드 슬라이드의 무대 ── */}
        {/* 모든 봉투 레이어는 같은 위치(top: ENV_Y, height: ENV_H)에 겹쳐서 배치 */}
        {/* 레퍼런스와 동일한 구조: inner(z1) / top/flap(z5) / body-back(z10) / bottom-lip(z11) */}

        {/* z:1 — envelopeInner: 봉투 안쪽 질감 (플랩과 동일 위치, 열릴 때 보임) */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 1,
          ...pngBg(envelopeInnerSrc),
        }} />

        {/* z:5 — envelopeTop: 오각형 플랩 (레퍼런스 clip 그대로) */}
        {/*   transformOrigin: '50% 0%'  ← TOP-CENTER (레퍼런스와 동일)         */}
        {/*   closed → rotateX(0deg)  : 오각형이 앞에 펼쳐져 봉투 입구를 막음     */}
        {/*   open   → rotateX(-180deg): 위쪽 축으로 뒤집혀 사라짐                */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`,
          zIndex: 5,
          perspective: '800px',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transformOrigin: '50% 0%',          // ← TOP center (레퍼런스: 175px 0px)
            transform: revealed ? 'rotateX(-180deg)' : 'rotateX(0deg)',
            transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
            backfaceVisibility: 'hidden',
          }}>
            {/* 오각형: 레퍼런스와 동일 polygon(0 0, 100% 0, 100% 50%, 50% 100%, 0 50%) */}
            <div style={{
              position: 'absolute', inset: 0,
              clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)',
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.18))',
              ...pngBg(envelopeTopSrc),
            }}>
              {/* J & J 모노그램 */}
              <div style={{
                position: 'absolute', top: '22%', left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: '0.85rem',
                color: 'rgba(120,108,94,0.65)',
                letterSpacing: '3px', whiteSpace: 'nowrap', userSelect: 'none',
              }}>J &amp; J</div>
            </div>
          </div>
        </div>

        {/* z:10 — envelope body back: 레퍼런스 clip 그대로 (역V자 + 하단 전체) */}
        <div style={{
          position: 'absolute', top: `${ENV_Y}px`, left: 0, right: 0,
          height: `${ENV_H}px`, zIndex: 10,
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 20%, 50% 80%, 0% 20%)',
          boxShadow: '0 8px 36px rgba(0,0,0,0.22)',
          ...pngBg(envelopeBodySrc),
        }} />

        {/* z:11 — envelope bottom lip: 레퍼런스 clip 그대로 (사다리꼴) */}
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
