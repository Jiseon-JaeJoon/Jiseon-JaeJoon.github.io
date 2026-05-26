import { useEffect, useRef } from 'react'

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
  const savedOverflow = useRef('')

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'CAKE_TOWER_SCORE') {
        onScore(e.data as GameScore)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onScore])

  useEffect(() => {
    if (isOpen) {
      savedOverflow.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = savedOverflow.current
    }
    return () => {
      document.body.style.overflow = savedOverflow.current
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
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
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1.1rem',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            lineHeight: 1,
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
