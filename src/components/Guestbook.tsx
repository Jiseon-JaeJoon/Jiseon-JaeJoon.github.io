import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, orderBy, query, Timestamp, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Entry {
  id: string
  name: string
  message: string
  createdAt: Timestamp
}

const COLLECTION = import.meta.env.DEV ? 'guestbook_dev' : 'guestbook'
const PAGE_SIZE = 5
const MY_ENTRIES_KEY = 'my_guestbook_entries'

function getMyEntries(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_ENTRIES_KEY) || '[]')
  } catch {
    return []
  }
}

export default function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [myEntries, setMyEntries] = useState<string[]>(() => getMyEntries())
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      setTimeout(() => setSubmitted(false), 2000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('작성하신 방명록을 삭제하시겠습니까?')) return
    setDeletingId(id)
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
      alert('삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section>
      <h2 className="section-title">방명록</h2>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.8, marginBottom: '32px' }}>
        두 사람의 새 출발을 축하하는<br />
        따뜻한 말 한마디 남겨주세요.
      </p>

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '40px', textAlign: 'left' }}>
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
            border: '1px solid var(--point-color)',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: 'var(--text-main)',
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
            border: '1px solid var(--point-color)',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            color: 'var(--text-main)',
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
            background: submitted ? 'var(--point-color)' : 'white',
            color: submitted ? 'white' : 'var(--point-color)',
            border: '1px solid var(--point-color)',
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
                      background: '#fdfaf8',
                      border: '1px solid #ecddd6',
                      borderRadius: '8px',
                      padding: '18px 20px 20px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #ecddd6', paddingBottom: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {entry.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#bbb', letterSpacing: '0.02em' }}>
                        {dateStr}
                      </span>
                      {myEntries.includes(entry.id) && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            cursor: deletingId === entry.id ? 'not-allowed' : 'pointer',
                            color: '#ccc',
                            fontSize: '1rem',
                            padding: '0 2px',
                            lineHeight: 1,
                            opacity: deletingId === entry.id ? 0.3 : 0.7,
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
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
                        border: '1px solid var(--point-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        background: currentPage === page ? 'var(--point-color)' : 'white',
                        color: currentPage === page ? 'white' : 'var(--point-color)',
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
    </section>
  )
}
