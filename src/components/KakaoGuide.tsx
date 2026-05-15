import { useState } from 'react'

const isAndroid = /Android/i.test(navigator.userAgent)

export default function KakaoGuide() {
  const url = window.location.href
  const [opened, setOpened] = useState(false)

  const openInBrowser = () => {
    if (isAndroid) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`
    } else {
      window.open(url, '_blank')
    }
    setOpened(true)
  }

  const showOpened = opened

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      {/* 배경 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#f8f8f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(0.65rem, 1.5vw, 0.78rem)',
          letterSpacing: '4px',
          color: '#ccc',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          You're invited to the wedding of
        </p>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1.8rem, 6vw, 3rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#d0d0d0',
          lineHeight: 1.15,
          textAlign: 'center',
        }}>
          Son Jaejun<br />
          <span style={{ fontSize: '0.52em', fontWeight: 400 }}>& </span>
          Jang Jiseon
        </h1>
      </div>

      {/* 오버레이 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
      }} />

      {/* 모달 카드 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'white',
        borderRadius: '16px',
        padding: '36px 28px',
        width: 'calc(100% - 64px)',
        maxWidth: '300px',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        <span style={{
          display: 'block',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.4rem',
          marginBottom: '16px',
          color: '#111',
        }}>✦</span>

        {showOpened ? (
          <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.9, margin: 0 }}>
            외부 브라우저에서 이용이 가능합니다.<br />
            해당 페이지는 닫으시면 됩니다.
          </p>
        ) : (
          <>
            <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.9, marginBottom: '24px' }}>
              외부 브라우저에서<br />청첩장을 확인해 주세요.
            </p>
            <button
              onClick={openInBrowser}
              style={{
                width: '100%',
                padding: '13px',
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              외부 브라우저로 열기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
