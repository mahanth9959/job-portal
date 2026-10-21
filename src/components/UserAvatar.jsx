import { useEffect, useState } from 'react'
import { avatarTone, cx, initials } from '../lib/format'

const sizeClass = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
  xl: 'avatar-xl',
}

export function UserAvatar({
  name = '',
  src = null,
  size = 'md',
  tone,
  alt = '',
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  const toneNumber = tone || avatarTone(name)
  const showImage = src && !failed

  return (
    <span
      className={cx('avatar', sizeClass[size], `avatar-${toneNumber}`, className)}
      title={name || undefined}
    >
      {showImage ? (
        <img src={src} alt={alt || name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden={!alt}>{initials(name) || '—'}</span>
      )}
    </span>
  )
}
