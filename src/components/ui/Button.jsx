import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'
import { buttonStyles } from './buttonStyles'

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon = false,
  block = false,
  className = '',
  loading = false,
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(buttonStyles({ variant, size, icon, block, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  children,
  variant = 'secondary',
  size = 'md',
  icon = false,
  block = false,
  className = '',
  ...props
}) {
  return (
    <Link
      to={to}
      className={cx(buttonStyles({ variant, size, icon, block, className }))}
      {...props}
    >
      {children}
    </Link>
  )
}

export function ButtonAnchor({
  href,
  children,
  variant = 'secondary',
  size = 'md',
  icon = false,
  block = false,
  className = '',
  ...props
}) {
  return (
    <a
      href={href}
      className={cx(buttonStyles({ variant, size, icon, block, className }))}
      {...props}
    >
      {children}
    </a>
  )
}

export function IconButton({ label, children, className = '', size = 'md', ...props }) {
  return (
    <button
      type="button"
      className={cx('icon-btn', size === 'sm' ? 'size-7' : '', className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  )
}

export function Spinner({ className = '' }) {
  return <LoaderCircle className={cx('spin', className)} aria-hidden="true" />
}
