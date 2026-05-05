import { useState } from 'react'
import { createPortal } from 'react-dom'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

const COLLECTION = import.meta.env.DEV ? 'rsvp_dev' : 'rsvp'

interface FormData {
  attendance: 'yes' | 'no'
  name: string
  side: 'groom' | 'bride'
  contact: string
  additionalGuests: number
  meal: boolean
  bus: boolean
}

const initialForm: FormData = {
  attendance: 'yes',
  name: '',
  side: 'groom',
  contact: '',
  additionalGuests: 0,
  meal: true,
  bus: true,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0 0 10px',
  border: 'none',
  borderBottom: '1px solid #e0e0e0',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  color: 'var(--text-main)',
  outline: 'none',
  background: 'transparent',
}

const counterBtnStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '1px solid #ddd',
  borderRadius: '50%',
  background: 'white',
  fontSize: '1.1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-light)',
  fontFamily: 'inherit',
}

function toggleBtnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '14px',
    border: `1.5px solid ${active ? 'var(--point-color)' : '#e0e0e0'}`,
    borderRadius: '12px',
    background: active ? 'white' : '#fafafa',
    color: active ? 'var(--text-main)' : '#aaa',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.15s',
  }
}

function Checkmark({ active }: { active: boolean }) {
  return (
    <span style={{
      width: '22px', height: '22px', borderRadius: '50%',
      background: active ? 'var(--text-main)' : 'transparent',
      border: active ? 'none' : '1.5px solid #ddd',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {active && <span style={{ color: 'white', fontSize: '0.7rem', lineHeight: 1 }}>✓</span>}
    </span>
  )
}

export default function Rsvp() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const close = () => {
    setOpen(false)
    setForm(initialForm)
    setSubmitted(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, COLLECTION), {
        ...form,
        name: form.name.trim(),
        contact: form.contact.trim(),
        createdAt: Timestamp.now(),
      })
      setSubmitted(true)
      setTimeout(() => close(), 1800)
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = form.name.trim() && form.contact.trim() && !submitting

  return (
    <section>
      <h2 className="section-title">참석 의사 전달</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.9, marginBottom: '28px' }}>
        원활한 예식 진행을 위해 참석 정보를<br />
        미리 알려주시면 감사하겠습니다.
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 36px',
          border: '1px solid var(--point-color)',
          borderRadius: '12px',
          background: 'white',
          color: 'var(--point-color)',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        참석 의사 전달하기
      </button>

      {open && createPortal(
        <>
          <div
            onClick={close}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 200,
            }}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            background: 'white',
            borderRadius: '20px 20px 0 0',
            zIndex: 201,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 24px 48px',
          }}>
            {/* 헤더 */}
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'Gowun Dodum', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                참석 의사 전달
              </span>
              <button
                onClick={close}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#999', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.9, marginBottom: '28px' }}>
              원활한 예식 진행을 위해 참석 정보를<br />
              미리 알려주시면 감사하겠습니다.
            </p>

            {submitted ? (
              <p style={{ textAlign: 'center', color: 'var(--point-color)', padding: '48px 0', fontSize: '1rem' }}>
                전달해 주셔서 감사합니다 ✓
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 참석 여부 */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" style={toggleBtnStyle(form.attendance === 'yes')} onClick={() => setForm(f => ({ ...f, attendance: 'yes' }))}>
                    <span>🪑 가능</span>
                    <Checkmark active={form.attendance === 'yes'} />
                  </button>
                  <button type="button" style={toggleBtnStyle(form.attendance === 'no')} onClick={() => setForm(f => ({ ...f, attendance: 'no' }))}>
                    <span>🚫 불가</span>
                    <Checkmark active={form.attendance === 'no'} />
                  </button>
                </div>

                {/* 성함 */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>성함</span>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {(['groom', 'bride'] as const).map(s => (
                        <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: form.side === s ? 'var(--point-color)' : 'var(--text-light)', cursor: 'pointer' }}>
                          <span style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: `2px solid ${form.side === s ? 'var(--point-color)' : '#ddd'}`,
                            background: form.side === s ? 'var(--point-color)' : 'white',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {form.side === s && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', display: 'block' }} />}
                          </span>
                          {s === 'groom' ? '신랑측' : '신부측'}
                          <input type="radio" name="side" value={s} checked={form.side === s} onChange={() => setForm(f => ({ ...f, side: s }))} style={{ display: 'none' }} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="성함을 입력해 주세요."
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* 연락처 */}
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>연락처</span>
                  <input
                    type="tel"
                    placeholder="참석자 대표 연락처를 입력해 주세요."
                    value={form.contact}
                    onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* 추가 인원 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <span style={{ color: 'var(--point-color)', marginRight: '3px' }}>*</span>추가인원
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                      type="button"
                      style={counterBtnStyle}
                      onClick={() => setForm(f => ({ ...f, additionalGuests: Math.max(0, f.additionalGuests - 1) }))}
                    >−</button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '1rem', color: 'var(--text-main)' }}>
                      {form.additionalGuests}
                    </span>
                    <button
                      type="button"
                      style={counterBtnStyle}
                      onClick={() => setForm(f => ({ ...f, additionalGuests: f.additionalGuests + 1 }))}
                    >+</button>
                  </div>
                </div>

                {/* 식사 여부 */}
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--point-color)', marginRight: '3px' }}>*</span>식사여부
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" style={toggleBtnStyle(form.meal)} onClick={() => setForm(f => ({ ...f, meal: true }))}>
                      <span>식사함</span><Checkmark active={form.meal} />
                    </button>
                    <button type="button" style={toggleBtnStyle(!form.meal)} onClick={() => setForm(f => ({ ...f, meal: false }))}>
                      <span>식사안함</span><Checkmark active={!form.meal} />
                    </button>
                  </div>
                </div>
        
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--point-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    opacity: canSubmit ? 1 : 0.5,
                    transition: 'opacity 0.15s',
                    marginTop: '4px',
                  }}
                >
                  {submitting ? '전송 중...' : '전달하기'}
                </button>
              </form>
            )}
          </div>
        </>,
        document.body
      )}
    </section>
  )
}
