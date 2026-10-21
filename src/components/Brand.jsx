import { cx } from '../lib/format'

export function LogoMark({ className = '', size = 28 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 23.5 12.4 16.2 19.1 19.2 26.5 8.3"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26.5" cy="8.3" r="2.8" fill="currentColor" />
    </svg>
  )
}

export function Logo({ subtitle = null, className = '', compact = false }) {
  return (
    <span className={cx('inline-flex min-w-0 items-center gap-2.5', className)}>
      <span className="grid size-8 flex-none place-items-center rounded-[7px] bg-accent text-white">
        <LogoMark size={21} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[18px] font-bold leading-none tracking-[-0.045em]">
          hireline
        </span>
        {!compact && subtitle ? (
          <span className="mt-1 block truncate text-[10.5px] font-medium leading-none text-faint">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  )
}
