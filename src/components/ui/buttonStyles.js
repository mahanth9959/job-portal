export const buttonVariant = {
  primary: 'btn-primary',
  secondary: '',
  soft: 'btn-soft',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export const buttonSize = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

export function buttonStyles({ variant = 'secondary', size = 'md', icon = false, block = false, className = '' } = {}) {
  return [
    'btn',
    buttonVariant[variant] || '',
    buttonSize[size] || '',
    icon ? 'btn-icon' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}
