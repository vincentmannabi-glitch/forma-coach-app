import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildWelcomeMessage, newMessageId } from '../utils/chatCoach'
import { sendMessageToCoachSafe } from '../utils/claudeSafe'
import { loadChatMessages, saveChatMessages } from '../utils/chatService'
import { applyProgramEdit, buildSystemPrompt, loadProgramFromStorage, normalizeUserProfileForProgram } from '../utils/programBuilder'
import {
  markReengagementEngaged,
  getReengagementSessionPending,
} from '../utils/reengagement'
import { buildReengagementChatMessageSoft, buildReengagementChatMessageWeek } from '../utils/reengagementCopy'
import CoachExerciseMessage from '../components/CoachExerciseMessage'
import './Chat.css'

function SportDetailMessage({ text, learnMore }) {
  return (
    <div className="sport-detail-message">
      <p className="chat-bubble-text">{text}</p>
      {learnMore
        ? learnMore.split('\n\n').map((para, i) => (
            <p key={i} className="chat-bubble-text chat-bubble-text--follow">
              {para}
            </p>
          ))
        : null}
    </div>
  )
}

function extractProgramEditInstruction(text) {
  const source = String(text || '')
  const patterns = [
    /(?:^|[.!?\n])\s*(replace|swap|change|substitute)\s+.+?\s+(?:with|for)\s+.+?(?:[.!?\n]|$)/i,
    /(?:^|[.!?\n])\s*(remove|take out|delete|skip|no more)\s+.+?(?:[.!?\n]|$)/i,
    /(?:^|[.!?\n])\s*(add)\s+.+?(?:\s+to\s+\w+)?(?:[.!?\n]|$)/i,
  ]
  for (const pattern of patterns) {
    const match = source.match(pattern)
    if (match?.[0]) return match[0].trim()
  }
  return ''
}

export default function Chat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile: user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [ready, setReady] = useState(false)
  const bottomRef = useRef(null)
  const reengagementSoftHandled = useRef(false)
  const reengagementWeekHandled = useRef(false)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    loadChatMessages().then((list) => {
      if (cancelled) return
      if (list.length === 0) {
        const welcome = {
          id: newMessageId(),
          role: 'coach',
          text: buildWelcomeMessage(user),
          createdAt: new Date().toISOString(),
        }
        list = [welcome]
        saveChatMessages(list)
      }
      setMessages(list)
      setReady(true)
    })
    return () => { cancelled = true }
  }, [user, navigate])

  useEffect(() => {
    if (!ready) return
    if (location.state?.reengagementWeek) {
      if (reengagementWeekHandled.current) return
      reengagementWeekHandled.current = true
      const text = buildReengagementChatMessageWeek(user)
      setMessages((prev) => {
        if (prev.some((m) => m.id === 'reengagement-week')) return prev
        const coachMsg = {
          id: 'reengagement-week',
          role: 'coach',
          text,
          createdAt: new Date().toISOString(),
        }
        const next = [...prev, coachMsg]
        saveChatMessages(next)
        return next
      })
      navigate('/chat', { replace: true, state: {} })
      return
    }
    if (location.state?.reengagementSoft) {
      if (reengagementSoftHandled.current) return
      reengagementSoftHandled.current = true
      const text = buildReengagementChatMessageSoft(user)
      setMessages((prev) => {
        if (prev.some((m) => m.id === 'reengagement-soft')) return prev
        const coachMsg = {
          id: 'reengagement-soft',
          role: 'coach',
          text,
          createdAt: new Date().toISOString(),
        }
        const next = [...prev, coachMsg]
        saveChatMessages(next)
        return next
      })
      navigate('/chat', { replace: true, state: {} })
    }
  }, [ready, location.state, navigate, user])

  useEffect(() => {
    if (!ready) return
    scrollToBottom()
  }, [messages, ready, thinking, scrollToBottom])

  const persist = useCallback((next) => {
    setMessages(next)
    saveChatMessages(next)
  }, [])

  const readUserProfileFromStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem('forma_user_profile')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return

    if (getReengagementSessionPending()) {
      markReengagementEngaged()
    }

    const userMsg = {
      id: newMessageId(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    }
    const next = [...messages, userMsg]
    persist(next)
    setInput('')
    setThinking(true)

    try {
      const storedProfile = readUserProfileFromStorage()
      const fullUserProfile = normalizeUserProfileForProgram({ ...storedProfile, ...(user || {}) })
      const program = loadProgramFromStorage()
      const systemPrompt = buildSystemPrompt(user, program)
      const res = await sendMessageToCoachSafe(text, fullUserProfile, next.slice(-10), systemPrompt)
      const coachMsg = {
        id: newMessageId(),
        role: 'coach',
        text: res.ok ? res.text : res.errorMessage,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => {
        const merged = [...prev, coachMsg]
        saveChatMessages(merged)
        return merged
      })

      const editInstruction = extractProgramEditInstruction(res.text)
      if (res.ok && editInstruction) {
        const latestProgram = loadProgramFromStorage()
        if (latestProgram) {
          const shouldApply = window.confirm(
            `FORMA Coach suggested a program edit:\n\n"${editInstruction}"\n\nApply this change to your saved program?`,
          )
          if (shouldApply) {
            const { updatedProgram } = applyProgramEdit(latestProgram, editInstruction)
            localStorage.setItem('forma_user_program', JSON.stringify(updatedProgram))
          }
        }
      }
    } finally {
      setThinking(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!ready) {
    return (
      <div className="chat-page chat-page--loading">
        <div className="chat-loading" />
      </div>
    )
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-inner">
          <span className="chat-status-dot" aria-hidden />
          <h1 className="chat-coach-name">FORMA Coach</h1>
        </div>
      </header>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-row ${m.role === 'user' ? 'chat-row--user' : 'chat-row--coach'}`}
          >
            {m.role === 'coach' ? (
              <div className="chat-bubble chat-bubble--coach">
                {m.exerciseBlock ? (
                  <CoachExerciseMessage message={m} />
                ) : m.sportBlock ? (
                  <SportDetailMessage text={m.text} learnMore={m.sportBlock.learnMore} />
                ) : (
                  <p className="chat-bubble-text">{m.text}</p>
                )}
              </div>
            ) : (
              <div className="chat-bubble chat-bubble--user">
                <p className="chat-bubble-text">{m.text}</p>
              </div>
            )}
          </div>
        ))}
        {thinking && (
          <div className="chat-row chat-row--coach chat-row--thinking" aria-live="polite">
            <div className="chat-thinking">
              <span className="chat-thinking-dot" aria-hidden />
              <span className="chat-thinking-label">FORMA Coach is thinking</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrap">
        <label className="chat-input-label" htmlFor="chat-input">
          Message
        </label>
        <div className="chat-input-row">
          <textarea
            id="chat-input"
            className="chat-input"
            rows={1}
            placeholder="Message FORMA Coach"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={thinking}
          />
          <button type="button" className="chat-send" onClick={send} aria-label="Send" disabled={thinking}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
