export default function Share() {
  const handleKakaoShare = () => {
    const kakao = (window as any).Kakao
    if (!kakao?.isInitialized()) return
    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '지선 ❤️ 재준 결혼합니다',
        description: '2026년 9월 19일 토요일 오후 1시 · 삼성전자 서초사옥 5층',
        imageUrl: 'https://jiseon-jaejoon.github.io/Image/webp/Mobile_Main_260503.webp',
        link: {
          mobileWebUrl: 'https://jiseon-jaejoon.github.io',
          webUrl: 'https://jiseon-jaejoon.github.io',
        },
      },
    })
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://jiseon-jaejoon.github.io')
      alert('링크가 복사되었습니다.')
    } catch {
      alert('복사에 실패했습니다.')
    }
  }

  return (
    <section>
      <h2 className="section-title">공유하기</h2>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleKakaoShare}
          style={{
            flex: 1,
            maxWidth: '160px',
            padding: '14px 0',
            background: '#FEE500',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: '#3C1E1E',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <KakaoIcon />
          카카오톡
        </button>

        <button
          onClick={handleCopyLink}
          style={{
            flex: 1,
            maxWidth: '160px',
            padding: '14px 0',
            background: '#333',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <LinkIcon />
          링크 복사
        </button>
      </div>
    </section>
  )
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="10" fill="#FEE500" />
      <path d="M10 4.5C6.96 4.5 4.5 6.46 4.5 8.87c0 1.56.97 2.93 2.44 3.75l-.62 2.3 2.7-1.8c.31.05.63.07.98.07 3.04 0 5.5-1.96 5.5-4.37S13.04 4.5 10 4.5z" fill="#3C1E1E" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}
