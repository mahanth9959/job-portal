import { cx } from '../lib/format'

const SHAPES = {
  ascend: (
    <>
      <path d="M4 19V13M10 19V9M16 19V4" />
      <circle cx="16" cy="4" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  arch: (
    <>
      <path d="M5 19V11a7 7 0 0 1 14 0v8" />
      <path d="M9 19v-7a3 3 0 0 1 6 0v7" />
    </>
  ),
  beam: (
    <>
      <path d="M4 19 19 5" />
      <circle cx="19" cy="5" r="3.2" />
      <path d="M4 11v8" />
    </>
  ),
  bloom: (
    <>
      <circle cx="12" cy="7" r="3.2" />
      <circle cx="7" cy="15.5" r="3.2" />
      <circle cx="17" cy="15.5" r="3.2" />
    </>
  ),
  fold: (
    <>
      <path d="M4 5h10l6 7-6 7H4l6-7-6-7Z" />
    </>
  ),
  grid: (
    <>
      <rect x="4.5" y="4.5" width="6" height="6" rx="1" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="4.5" r="2" fill="currentColor" stroke="none" />
      <path d="M6 16.5 18 7.5" />
    </>
  ),
  peak: (
    <>
      <path d="M3.5 19 12 4l8.5 15H3.5Z" />
      <path d="M8 13h8" />
    </>
  ),
  split: (
    <>
      <path d="M4 19V5h16v14H4Z" />
      <path d="M4 19 20 5" />
    </>
  ),
  stack: (
    <>
      <path d="M5 7h14M5 12h10M5 17h6" />
    </>
  ),
  thread: (
    <>
      <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
      <path d="M4 16c4 0 4-8 8-8s4 8 8 8" />
    </>
  ),
  wave: (
    <>
      <path d="M3.5 14c2.5-6 4.5-6 7 0s4.5 6 7 0 2.5-6 3 0" />
    </>
  ),
}

const toneClass = {
  rose: '',
  ink: 'tone-ink',
  blush: 'tone-blush',
  stone: 'tone-stone',
}

const sizeClass = {
  sm: 'company-mark-sm',
  md: '',
  lg: 'company-mark-lg',
  xl: 'company-mark-xl',
}

export function CompanyMark({ company, size = 'md', className = '' }) {
  const shape = company?.logo?.shape || 'ascend'
  const tone = company?.logo?.tone || 'rose'
  const label = company?.name ? `${company.name} mark` : 'Company mark'
  return (
    <span
      className={cx('company-mark', toneClass[tone] || '', sizeClass[size] || '', className)}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {SHAPES[shape] || SHAPES.ascend}
      </svg>
    </span>
  )
}

export function LogoShapePreview({ shape, tone = 'rose', active = false }) {
  return (
    <span
      className={cx(
        'company-mark',
        toneClass[tone] || '',
        active ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : '',
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {SHAPES[shape] || SHAPES.ascend}
      </svg>
    </span>
  )
}


