import { useState } from 'react'
import { useReveal } from '../hooks/useReveal'

const groups = [
  {
    label: '신랑측',
    accounts: [
      { role: '신랑', name: '손재준', bank: '신한은행', number: '110-592-528880' },
      { role: '아버지', name: '손성규', bank: '하나은행', number: '010-4057-3231-007' },
      { role: '어머니', name: '김채안', bank: '카카오뱅크', number: '3333-19-7014448' },
    ],
  },
  {
    label: '신부측',
    accounts: [
      { role: '신부', name: '장지선', bank: '신한은행', number: '110-453-300686' },
      { role: '아버지', name: '장경오', bank: '국민은행', number: '240-24-0176-509' },
      { role: '어머니', name: '남궁선미', bank: '국민은행', number: '612501-01-217593' },
    ],
  },
]

export default function AccountInfo() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const { ref, revealed } = useReveal(0.2)

  const toggle = (key: string) => {
    setOpenKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    })
  }

  const a = (delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  let itemIdx = 0

  return (
    <section ref={ref} className={revealed ? 'revealed' : ''}>
      <h2 className="section-title" style={a(0)}>마음전하기</h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.8, marginBottom: '32px', ...a(100) }}>
        참석이 어려우신 분들을 위해<br />
        계좌번호를 기재하였습니다.
      </p>

      {groups.map(({ label, accounts }, gi) => (
        <div key={label} style={{ marginBottom: '24px' }}>
          <p style={{
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)',
            letterSpacing: '2px', marginBottom: '10px',
            ...a(180 + gi * 160),
          }}>
            {label}
          </p>

          {accounts.map(({ role, name, bank, number }) => {
            const key = `${label}-${name}`
            const isOpen = openKeys.has(key)
            const delay = 240 + (itemIdx++) * 75

            return (
              <div
                key={key}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: isOpen ? '12px 12px 12px 12px' : '12px',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  background: 'white',
                  ...a(delay),
                }}
              >
                <button
                  onClick={() => toggle(key)}
                  style={{
                    width: '100%', padding: '14px 18px',
                    background: 'transparent', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.95rem', color: 'var(--text-main)',
                  }}
                >
                  <span>{role} {name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div style={{
                    borderTop: '1px solid #e8e8e8',
                    padding: '14px 18px',
                    background: '#fafafa',
                  }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                      {bank} {number}
                    </p>
                    <button
                      onClick={() => copy(key, `${bank} ${number}`)}
                      style={{
                        padding: '8px 20px',
                        background: copiedKey === key ? 'var(--point-color)' : 'white',
                        color: copiedKey === key ? 'white' : 'var(--point-color)',
                        border: '1px solid var(--point-color)',
                        borderRadius: '20px',
                        fontSize: '0.85rem', cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >
                      {copiedKey === key ? '복사됨 ✓' : '계좌 복사'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </section>
  )
}
