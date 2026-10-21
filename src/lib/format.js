export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const numberFormatter = new Intl.NumberFormat('en-US')
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatCompact(value) {
  return compactFormatter.format(Number(value) || 0)
}

export function formatCurrency(value, { compact = false } = {}) {
  const amount = Number(value) || 0
  if (compact) {
    return `$${compactFormatter.format(amount)}`
  }
  return `$${numberFormatter.format(amount)}`
}

export function formatSalary(min, max, { compact = false } = {}) {
  if (min == null && max == null) return 'Not listed'
  if (compact) {
    return `${formatCurrency(min, { compact: true })} – ${formatCurrency(max, { compact: true })}`
  }
  return `${formatCurrency(min)} – ${formatCurrency(max)}`
}

export function parseDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = {}) {
  const date = parseDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateInput(value) {
  const date = parseDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatMonth(value, options = {}) {
  const date = parseDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', ...options }).format(date)
}

export function formatWeekday(value) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    parseDate(value) || new Date(),
  )
}

export function timeAgo(value) {
  const date = parseDate(value)
  if (!date) return '—'
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(date)
}

export function daysBetween(from, to = new Date()) {
  const start = parseDate(from)
  const end = parseDate(to)
  if (!start || !end) return 0
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((b - a) / 86400000)
}

export function daysSince(value) {
  return Math.max(0, daysBetween(value, new Date()))
}

export function daysUntil(value) {
  return daysBetween(new Date(), value)
}

export function deadlineLabel(value, status) {
  if (status === 'Closed') return 'Closed'
  const days = daysUntil(value)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Closes today'
  if (days === 1) return '1 day left'
  if (days <= 14) return `${days} days left`
  return `Closes ${formatDate(value, { year: undefined })}`
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase()
}

export function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function niceMax(value, steps = 4) {
  const max = Math.max(1, Number(value) || 1)
  const rough = max / steps
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude
  let step
  if (normalized <= 1) step = 1
  else if (normalized <= 2) step = 2
  else if (normalized <= 2.5) step = 2.5
  else if (normalized <= 5) step = 5
  else step = 10
  return Math.ceil(max / (step * magnitude)) * step * magnitude
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return Number(count) === 1 ? singular : plural
}

export function normalize(value = '') {
  return String(value).trim().toLowerCase()
}

export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())
}

export function avatarTone(seed = '') {
  let hash = 0
  const string = String(seed)
  for (let i = 0; i < string.length; i += 1) {
    hash = (hash * 31 + string.charCodeAt(i)) % 997
  }
  return (hash % 4) + 1
}

export function profileStrength(profile = {}) {
  const checks = [
    Boolean(profile.name),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(profile.address),
    Boolean(profile.title),
    Array.isArray(profile.skills) && profile.skills.length >= 3,
    Boolean(profile.experience),
    Boolean(profile.education),
    Boolean(profile.bio),
    Boolean(profile.photo),
    Boolean(profile.resume?.name),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function relativeDeadlineTone(value, status) {
  if (status === 'Closed') return 'neutral'
  const days = daysUntil(value)
  if (days < 0) return 'neutral'
  if (days <= 7) return 'warning'
  return 'positive'
}

export function toMillis(value) {
  const date = parseDate(value)
  return date ? date.getTime() : 0
}

export function sortByDateDesc(a, b, key) {
  return toMillis(b[key]) - toMillis(a[key])
}
