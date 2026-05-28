import { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

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
  const savedScrollY = useRef(0)
  const savedBodyStyles = useRef({ overflow: '', position: '', top: '', width: '' })

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'CAKE_TOWER_SCORE') {
        onScore(e.data as GameScore)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onScore])

  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY
      const b = document.body.style
      savedBodyStyles.current = { overflow: b.overflow, position: b.position, top: b.top, width: b.width }
      b.overflow = 'hidden'
      b.position = 'fixed'
      b.top = `-${savedScrollY.current}px`
      b.width = '100%'
    } else {
      const b = document.body.style
      const s = savedBodyStyles.current
      b.overflow = s.overflow
      b.position = s.position
      b.top = s.top
      b.width = s.width
      window.scrollTo(0, savedScrollY.current)
    }
    return () => {
      const b = document.body.style
      const s = savedBodyStyles.current
      b.overflow = s.overflow
      b.position = s.position
      b.top = s.top
      b.width = s.width
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  return createPortal(
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
          sandbox="allow-same-origin allow-scripts allow-forms"
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: '16px', display: 'block' }}
          title="웨딩케이크 타워"
        />
      </div>
    </div>,
    document.body
  )
}
