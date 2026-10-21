import { cx } from '../lib/format'

const toneClass = {
  neutral: '',
  positive: 'pill-positive',
  negative: 'pill-negative',
  warning: 'pill-warning',
  accent: 'pill-accent',
}

export function Pill({ tone = 'neutral', children, dot = true, size = 'sm', className = '' }) {
  return (
    <span
      className={cx(
        'pill',
        toneClass[tone] || '',
        dot ? '' : 'pill-plain',
        size === 'lg' ? 'pill-lg' : '',
        className,
      )}
    >
      {children}
    </span>
  )
}

const stageTone = {
  Applied: 'neutral',
  Screening: 'warning',
  Interview: 'accent',
  Offer: 'positive',
  Rejected: 'negative',
  Withdrawn: 'neutral',
}

export function StatusPill({ status, size = 'sm' }) {
  return (
    <Pill tone={stageTone[status] || 'neutral'} size={size}>
      {status}
    </Pill>
  )
}

export function JobStatusPill({ status, size = 'sm' }) {
  return (
    <Pill tone={status === 'Open' ? 'positive' : 'neutral'} size={size}>
      {status}
    </Pill>
  )
}


