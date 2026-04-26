import { useState } from 'react'

const groups = [
  {
    label: '신랑측',
    accounts: [
      { role: '신랑', name: '손재준', bank: '신한은행', number: '000-0000-0000' },
      { role: '아버지', name: '손성규', bank: 'XX은행', number: '000-0000-0000' },
      { role: '어머니', name: '김채안', bank: '카카오뱅크', number: '3333-19-7014448' },
    ],
  },
  {
    label: '신부측',
    accounts: [
      { role: '신부', name: '장지선', bank: 'XX은행', number: '000-0000-0000' },
      { role: '아버지', name: '장경오', bank: 'XX은행', number: '000-0000-0000' },
      { role: '어머니', name: '남궁선미', bank: 'XX은행', number: '000-0000-0000' },
    ],
  },
]

export default function AccountInfo() {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

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

  return (
    <section>
      <h2 className="section-title">마음전하기</h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.8, marginBottom: '32px' }}>
        참석이 어려우신 분들을 위해<br />
        계좌번호를 기재하였습니다.
      </p>

      {groups.map(({ label, accounts }) => (
        <div key={label} style={{ marginBottom: '24px' }}>
          {/* 그룹 헤더 */}
          <p style={{
            fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)',
            letterSpacing: '2px', marginBottom: '10px'
          }}>
            {label}
          </p>

          {/* 개별 토글 항목 */}
          {accounts.map(({ role, name, bank, number }) => {
            const key = `${label}-${name}`
            const isOpen = openKeys.has(key)

            return (
              <div
                key={key}
                style={{
                  border: '1px solid var(--point-color)',
                  borderRadius: isOpen ? '12px 12px 12px 12px' : '12px',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  background: 'white',
                }}
              >
                {/* 토글 버튼 행 */}
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

                {/* 펼쳐지는 계좌 영역 */}
                {isOpen && (
                  <div style={{
                    borderTop: '1px solid var(--point-color)',
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
