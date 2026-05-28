import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, limit, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface ScoreEntry {
  id: string
  nickname: string
  score: number
  layers: number
  maxCombo: number
  createdAt: Timestamp
}

const SCORES_COLLECTION = import.meta.env.DEV ? 'cakeTowerScores_dev' : 'cakeTowerScores'
const MEDALS = ['🥇', '🥈', '🥉']

export default function CakeTowerLeaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, SCORES_COLLECTION),
      orderBy('score', 'desc'),
      limit(10)
    )
    const unsub = onSnapshot(q, snap => {
      setScores(snap.docs.map(d => ({ id: d.id, ...d.data() } as ScoreEntry)))
      setLoaded(true)
    }, err => {
      console.error('리더보드 로드 실패:', err)
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  if (!loaded || !scores.length) return null

  return (
    <div style={{ marginTop: '48px' }}>
      <p style={{
        textAlign: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#555',
        marginBottom: '16px',
      }}>
        🎂 Cake Tower Ranking
      </p>
      {scores.map((entry, i) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '6px',
            background: i === 0 ? '#1a1500' : 'transparent',
            border: `1px solid ${i === 0 ? '#3a2e00' : '#2e2e2e'}`,
            fontSize: '0.88rem',
            color: '#f0f0f0',
          }}
        >
          <span style={{ width: '22px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}>
            {MEDALS[i] ?? i + 1}
          </span>
          <span style={{ flex: 1, fontWeight: 600 }}>{entry.nickname || '익명'}</span>
          <span style={{
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: i === 0 ? '#E8A020' : '#f0f0f0',
          }}>
            {entry.score.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}
