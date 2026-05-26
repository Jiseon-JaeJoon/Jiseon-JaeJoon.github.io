import { useEffect } from 'react'

export interface GameScore {
  nickname: string
  name: string
  phone: string
  score: number
  maxCombo: number
  layers: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onScore: (data: GameScore) => void
}

export default function CakeTowerModal({ isOpen, onClose, onScore }: Props) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'CAKE_TOWER_SCORE') {
        onScore(e.data as GameScore)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onScore])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '375px', height: '100dvh', maxHeight: '680px' }}>
        <button
          onClick={onClose}
          aria-label="게임 닫기"
          style={{
            position: 'absolute',
            top: '-40px',
            right: '4px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '6px 10px',
            lineHeight: 1,
            zIndex: 1001,
          }}
        >
          ✕
        </button>
        <iframe
          src="/games/cake_tower.html"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px', display: 'block' }}
          title="웨딩케이크 타워"
        />
      </div>
    </div>
  )
}
