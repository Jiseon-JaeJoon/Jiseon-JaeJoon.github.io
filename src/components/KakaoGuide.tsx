export default function KakaoGuide() {
  const url = window.location.href

  const openInBrowser = () => {
    window.open(url, '_blank')
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL이 복사되었습니다.\n브라우저 주소창에 붙여넣기 해주세요.')
    }).catch(() => {
      prompt('아래 URL을 복사해 브라우저에서 열어주세요.', url)
    })
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 40px',
      gap: '0',
      fontFamily: 'inherit',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(0.65rem, 1.5vw, 0.78rem)',
        letterSpacing: '4px',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: '20px',
      }}>
        You're invited to the wedding of
      </p>

      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.8rem, 6vw, 3rem)',
        fontWeight: 300,
        fontStyle: 'italic',
        letterSpacing: '2px',
        color: '#111',
        lineHeight: 1.15,
        marginBottom: '28px',
      }}>
        Son Jaejun<br />
        <span style={{ fontSize: '0.52em', fontWeight: 400, color: '#888' }}>& </span>
        Jang Jiseon
      </h1>

      <div style={{ width: '28px', height: '1px', background: '#ddd', marginBottom: '28px' }} />

      <p style={{
        fontSize: '0.88rem',
        color: '#888',
        lineHeight: 1.9,
        marginBottom: '36px',
      }}>
        카카오톡 내부 브라우저에서는<br />
        일부 기능이 제한됩니다.<br />
        외부 브라우저에서 청첩장을 확인해 주세요.
      </p>

      <button
        onClick={openInBrowser}
        style={{
          width: '100%',
          maxWidth: '280px',
          padding: '14px 24px',
          background: '#111',
          color: '#fff',
          border: 'none',
          borderRadius: '3px',
          fontSize: '0.85rem',
          letterSpacing: '1.5px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: '12px',
        }}
      >
        외부 브라우저로 열기
      </button>

      <button
        onClick={copyUrl}
        style={{
          width: '100%',
          maxWidth: '280px',
          padding: '14px 24px',
          background: 'transparent',
          color: '#111',
          border: '1px solid #111',
          borderRadius: '3px',
          fontSize: '0.85rem',
          letterSpacing: '1.5px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        URL 복사하기
      </button>
    </div>
  )
}
