import { useState } from 'react'

export default function VideoIntro({ onEnd }: { onEnd: () => void }) {
  const [fading, setFading] = useState(false)
  const [videoVisible, setVideoVisible] = useState(false)

  const handleEnd = () => {
    setFading(true)
    setTimeout(onEnd, 1000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity 1.0s ease-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <video
        src="/cat_3.mp4"
        autoPlay
        muted
        playsInline
        onPlay={() => setVideoVisible(true)}
        onEnded={handleEnd}
        onClick={handleEnd}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          display: 'block',
          opacity: videoVisible ? 1 : 0,
          transition: 'opacity 0.2s ease-in',
        }}
      />

      {/* 스킵 버튼 */}
      <button
        onClick={handleEnd}
        style={{
          position: 'absolute',
          bottom: '32px',
          right: '24px',
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff',
          fontSize: '0.85rem',
          padding: '8px 18px',
          borderRadius: '20px',
          cursor: 'pointer',
          letterSpacing: '1px',
          backdropFilter: 'blur(4px)',
        }}
      >
        건너뛰기
      </button>
    </div>
  )
}
