import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildWelcomeMessage, newMessageId } from '../utils/chatCoach'
import { sendMessageToCoachSafe } from '../utils/claudeSafe'
import { loadChatMessages, saveChatMessages } from '../utils/chatService'
import { applyProgramEdit, buildProgram, buildSystemPrompt, formatGoal, formatSplit, loadProgramFromStorage, normalizeUserProfileForProgram, saveProgramToStorage } from '../utils/programBuilder'
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

/**
 * Detect if the AI is proposing a FULL PROGRAM REBUILD for a new goal.
 * Returns the new goal string if detected, null otherwise.
 */
function extractGoalSwitch(aiText, userText) {
  const combined = (aiText + ' ' + userText).toLowerCase()
  const goalMap = [
    { keywords: ['muscle building', 'build muscle', 'hypertrophy', 'mass', 'bulk'], goal: 'muscleBuilding' },
    { keywords: ['fat loss', 'lose weight', 'cut', 'shred', 'lose fat', 'weight loss'], goal: 'fatLoss' },
    { keywords: ['strength', 'get stronger', 'powerlifting', 'power', '1rm', 'one rep max'], goal: 'strength' },
    { keywords: ['general health', 'stay active', 'fitness', 'overall health', 'feel better', 'mobility'], goal: 'generalHealth' },
  ]
  // Only trigger if user is clearly requesting a program change / new focus
  const switchSignals = [
    'switch', 'change my program', 'new program', 'rebuild', 'start fresh',
    'focus on', 'want to focus', 'pivot', 'different goal', 'new goal',
    'revert', 'go back to', 'instead', 'try something different'
  ]
  const hasSwitchSignal = switchSignals.some(s => combined.includes(s))
  if (!hasSwitchSignal) return null
  for (const { keywords, goal } of goalMap) {
    if (keywords.some(k => combined.includes(k))) return goal
  }
  return null
}

/**
 * Rebuild the entire program for a new goal while preserving all other profile fields.
 */
function rebuildProgramForGoal(currentProgram, userProfile, newGoal) {
  const updatedProfile = normalizeUserProfileForProgram({
    ...userProfile,
    goal: newGoal,
    // Preserve experience, equipment, days, injuries — only goal changes
    experience_level: currentProgram?.experienceLevel || userProfile?.experience_level,
    days_per_week: currentProgram?.daysPerWeek || userProfile?.days_per_week,
    session_minutes: currentProgram?.sessionMinutes || userProfile?.session_minutes,
    equipment: userProfile?.equipment,
    injuries_details: currentProgram?.injuries || userProfile?.injuries_details,
    sport_or_activity: currentProgram?.sport || userProfile?.sport_or_activity,
    bodyweight: userProfile?.bodyweight,
  })
  const newProgram = buildProgram(updatedProfile)
  // Preserve session history from old program
  newProgram.sessionHistory = currentProgram?.sessionHistory || []
  return newProgram
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

  // Handle yes/no responses to pending program switches
  const handlePendingSwitch = useCallback((userText) => {
    const trimmed = userText.trim().toLowerCase()
    const isYes = ['yes', 'yeah', 'yep', 'sure', 'do it', 'apply', 'switch', 'go for it', 'let\'s do it'].some(w => trimmed.startsWith(w))
    const isNo = ['no', 'nope', 'keep', 'cancel', 'never mind', 'nevermind', 'don\'t'].some(w => trimmed.startsWith(w))
    if (!isYes && !isNo) return false

    // Find the most recent pending switch in messages
    const pending = [...messages].reverse().find(m => m.pendingProgramSwitch)
    if (!pending) return false

    if (isYes) {
      saveProgramToStorage(pending.pendingProgramSwitch)
      const goal = formatGoal(pending.pendingProgramSwitch.goal)
      const split = formatSplit(pending.pendingProgramSwitch.split)
      const confirmMsg = {
        id: newMessageId(),
        role: 'coach',
        text: `Done. Your program has been switched to ${goal} — ${split} split. Head to the Train tab to see your new sessions. Your history has been preserved.`,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => {
        const merged = [...prev, confirmMsg]
        saveChatMessages(merged)
        return merged
      })
    } else {
      const cancelMsg = {
        id: newMessageId(),
        role: 'coach',
        text: `No problem — sticking with your current program. Let me know if you want to tweak anything else.`,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => {
        const merged = [...prev, cancelMsg]
        saveChatMessages(merged)
        return merged
      })
    }
    return true
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || thinking) return

    // Check if this is a yes/no response to a pending program switch
    if (handlePendingSwitch(text)) {
      setInput('')
      return
    }

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

      // --- Program edit detection ---
      if (res.ok) {
        const latestProgram = loadProgramFromStorage()
        const storedProfileRaw = localStorage.getItem('forma_user_profile')
        const storedProfile = storedProfileRaw ? JSON.parse(storedProfileRaw) : {}
        const fullProfile = normalizeUserProfileForProgram({ ...storedProfile, ...(user || {}) })

        // 1. Check for full goal/program switch first (higher priority)
        const newGoal = extractGoalSwitch(res.text, text)
        if (newGoal && latestProgram && newGoal !== latestProgram.goal) {
          const newProgram = rebuildProgramForGoal(latestProgram, fullProfile, newGoal)
          const goalLabel = formatGoal(newGoal)
          const splitLabel = formatSplit(newProgram.split)
          const confirmMsg = {
            id: newMessageId(),
            role: 'coach',
            text: `I've built you a new ${goalLabel} program — ${splitLabel} split, ${newProgram.daysPerWeek} days/week, same equipment. Want me to apply it? Reply "yes" to switch or "no" to keep your current program.`,
            createdAt: new Date().toISOString(),
            pendingProgramSwitch: newProgram,
          }
          setMessages((prev) => {
            const merged = [...prev, confirmMsg]
            saveChatMessages(merged)
            return merged
          })
        } else {
          // 2. Check for single exercise edit
          const editInstruction = extractProgramEditInstruction(res.text)
          if (editInstruction && latestProgram) {
            const { updatedProgram, changesMade } = applyProgramEdit(latestProgram, editInstruction)
            saveProgramToStorage(updatedProgram)
            const confirmMsg = {
              id: newMessageId(),
              role: 'coach',
              text: changesMade.length
                ? `Done — ${changesMade.join('. ')}. Your program has been updated.`
                : `I've noted that. Let me know if you want me to make a specific swap in your program.`,
              createdAt: new Date().toISOString(),
            }
            setMessages((prev) => {
              const merged = [...prev, confirmMsg]
              saveChatMessages(merged)
              return merged
            })
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
