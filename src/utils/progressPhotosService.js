import { getCurrentUser } from './auth'

const MAX_PHOTOS = 24

async function getUserId() {
  const user = await getCurrentUser()
  return user?.id ?? null
}

function storageKey(userId) {
  return `forma_progress_photos_${userId}`
}

function loadRaw(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRaw(userId, list) {
  if (!userId) return
  localStorage.setItem(storageKey(userId), JSON.stringify(list))
}

export async function getProgressPhotos() {
  const userId = await getUserId()
  if (!userId) return []

  const raw = loadRaw(userId)
  return raw.map((row) => ({
    id: row.id,
    date: row.date,
    dataUrl: row.photo_url,
    photo_url: row.photo_url,
    notes: row.notes,
  })).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, MAX_PHOTOS)
}

export function fileToResizedDataUrl(file, maxDim = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      } catch {
        resolve(canvas.toDataURL('image/png'))
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('load'))
    }
    img.src = url
  })
}

export async function addProgressPhoto(dataUrl, dateIso) {
  const userId = await getUserId()
  if (!userId) return

  const dateStr = dateIso || new Date().toISOString().slice(0, 10)
  const id = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  const raw = loadRaw(userId)
  raw.unshift({ id, user_id: userId, date: dateStr, photo_url: dataUrl })
  saveRaw(userId, raw)
}

export async function deleteProgressPhoto(id) {
  const userId = await getUserId()
  if (!userId) return

  const raw = loadRaw(userId).filter((r) => r.id !== id)
  saveRaw(userId, raw)
}
