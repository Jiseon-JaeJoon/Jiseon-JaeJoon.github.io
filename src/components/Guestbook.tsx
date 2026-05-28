import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, Timestamp, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useReveal } from '../hooks/useReveal'
import CakeTowerModal, { type GameScore } from './CakeTowerModal'
import CakeTowerLeaderboard from './CakeTowerLeaderboard'

interface Entry {
  id: string
  name: string
  message: string
  createdAt: Timestamp
}

const COLLECTION = import.meta.env.DEV ? 'guestbook_dev' : 'guestbook'
const SCORES_COLLECTION = import.meta.env.DEV ? 'cakeTowerScores_dev' : 'cakeTowerScores'
const PAGE_SIZE = 5
const MY_ENTRIES_KEY = 'my_guestbook_entries'
const HAS_PLAYED_KEY = 'has_played_cake_tower'

function getMyEntries(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_ENTRIES_KEY) || '[]')
  } catch {
    return []
  }
}

export default function Guestbook() {
  const { ref, revealed } = useReveal(0.15)
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [gameOpen, setGameOpen] = useState(false)
  const [hasPlayedGame, setHasPlayedGame] = useState(() => localStorage.getItem(HAS_PLAYED_KEY) === 'true')
  const [myEntries, setMyEntries] = useState<string[]>(() => getMyEntries())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Entry[]
      setEntries(data)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    setFormError('')
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        name: name.trim(),
        message: message.trim(),
        createdAt: Timestamp.now(),
      })
      const updated = [...getMyEntries(), docRef.id]
      localStorage.setItem(MY_ENTRIES_KEY, JSON.stringify(updated))
      setMyEntries(updated)
      setName('')
      setMessage('')
      setSubmitted(true)
      setGameOpen(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      console.error('방명록 저장 실패:', err)
      setFormError('저장에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setDeleteError('')
    try {
      await deleteDoc(doc(db, COLLECTION, id))
      const updated = getMyEntries().filter(e => e !== id)
      localStorage.setItem(MY_ENTRIES_KEY, JSON.stringify(updated))
      setMyEntries(updated)
      const remaining = entries.length - 1
      const totalPages = Math.ceil(remaining / PAGE_SIZE)
      if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages)
    } catch (err) {
      console.error('삭제 실패:', err)
      setDeleteError('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  const closeGame = useCallback(() => setGameOpen(false), [])

  const handleScore = useCallback(async (data: GameScore) => {
    localStorage.setItem(HAS_PLAYED_KEY, 'true')
    setHasPlayedGame(true)
    try {
      await addDoc(collection(db, SCORES_COLLECTION), {
        nickname: data.nickname,
        name: data.name,
        phone: data.phone,
        score: data.score,
        maxCombo: data.maxCombo,
        layers: data.layers,
        createdAt: Timestamp.now(),
      })
    } catch (err) {
      console.error('점수 저장 실패:', err)
    }
  }, [])

  const a = (delay: number) => ({
    opacity: revealed ? undefined : 0,
    animation: revealed ? `slideUpFade 0.6s ease ${delay}ms both` : 'none',
  })

  return (
    <>
    <section
      id="guestbook"
      ref={ref}
      className={revealed ? 'revealed' : ''}
      style={{
        background: '#0d0d0d',
        ['--text-main' as string]: '#f0f0f0',
        ['--text-light' as string]: '#888888',
        ['--point-color' as string]: '#f0f0f0',
      }}
    >
      <h2 className="section-title" style={{ marginBottom: '6px', ...a(0) }}>Guestbook</h2>
      <p style={{ fontFamily: "'Gowun Batang', serif", fontSize: '1.25rem', letterSpacing: '3px', color: 'var(--text-light)', marginBottom: '32px', ...a(80) }}>축하의 말</p>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.8, marginBottom: '32px', ...a(100) }}>
        두 사람의 새 출발을 축하하는<br />
        따뜻한 말 한마디 남겨주세요.
      </p>

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px', textAlign: 'left', ...a(200) }}>
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
          style={{
            width: '100%',
            padding: '12px 16px',
            marginBottom: '10px',
            border: '1px solid #333',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: '#f0f0f0',
            background: '#1a1a1a',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <textarea
          placeholder="축하 메시지를 남겨주세요 (200자 이내)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={200}
          rows={4}
          style={{
            width: '100%',
            padding: '12px 16px',
            marginBottom: '14px',
            border: '1px solid #333',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: '#f0f0f0',
            background: '#1a1a1a',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={submitting || !name.trim() || !message.trim()}
          style={{
            width: '100%',
            padding: '13px',
            background: submitted ? '#f0f0f0' : 'transparent',
            color: submitted ? '#111' : '#f0f0f0',
            border: '1px solid #f0f0f0',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: (!name.trim() || !message.trim()) ? 0.5 : 1,
          }}
        >
          {submitted ? '작성 완료 ✓' : submitting ? '전송 중...' : '축하 남기기'}
        </button>
        {formError && (
          <p style={{ fontSize: '0.85rem', color: '#f87171', marginTop: '10px', textAlign: 'center' }}>{formError}</p>
        )}
      </form>

      {/* 방명록 목록 */}
      <div style={{ textAlign: 'left' }}>
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            아직 작성된 방명록이 없습니다.
          </p>
        ) : (() => {
          const totalPages = Math.ceil(entries.length / PAGE_SIZE)
          const pageEntries = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
          return (
            <>
              {pageEntries.map((entry) => {
                const d = entry.createdAt?.toDate()
                const dateStr = d
                  ? `${String(d.getFullYear()).slice(-2)}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                  : ''
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2e2e2e',
                      borderRadius: '8px',
                      padding: '18px 20px 20px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #2e2e2e', paddingBottom: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0f0f0' }}>
                        {entry.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#666', letterSpacing: '0.02em' }}>
                        {dateStr}
                      </span>
                      {myEntries.includes(entry.id) && (
                        confirmDeleteId === entry.id ? (
                          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              onClick={() => { setConfirmDeleteId(null); handleDelete(entry.id) }}
                              disabled={deletingId === entry.id}
                              style={{ background: 'none', border: '1px solid #666', borderRadius: '6px', cursor: 'pointer', color: '#f0f0f0', fontSize: '0.75rem', padding: '2px 8px' }}
                            >
                              삭제
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.75rem', padding: '2px 4px' }}
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(entry.id)}
                            disabled={deletingId === entry.id}
                            style={{
                              marginLeft: 'auto',
                              background: 'none',
                              border: 'none',
                              cursor: deletingId === entry.id ? 'not-allowed' : 'pointer',
                              color: '#666',
                              fontSize: '1rem',
                              padding: '0 2px',
                              lineHeight: 1,
                              opacity: deletingId === entry.id ? 0.3 : 0.7,
                            }}
                          >
                            ×
                          </button>
                        )
                      )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#d0d0d0', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {entry.message}
                    </p>
                  </div>
                )
              })}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        background: currentPage === page ? '#f0f0f0' : 'transparent',
                        color: currentPage === page ? '#111' : '#f0f0f0',
                        transition: 'all 0.2s',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )
        })()}
      </div>

      {deleteError && (
        <p style={{ fontSize: '0.85rem', color: '#f87171', textAlign: 'center', marginBottom: '8px' }}>{deleteError}</p>
      )}
      {hasPlayedGame && <CakeTowerLeaderboard />}
    </section>
    <CakeTowerModal isOpen={gameOpen} onClose={closeGame} onScore={handleScore} />
    </>
  )
}
