import { Eye, EyeOff, FileText, Upload, X } from 'lucide-react'
import { useId, useState } from 'react'
import { cx, formatFileSize } from '../../lib/format'

function describedBy(id, hint, error) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ')
}

function FieldMessages({ id, hint, error }) {
  return (
    <>
      {hint ? (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}

export function Field({ label, htmlFor, hint, error, optional, children, className = '' }) {
  return (
    <div className={cx('field', className)}>
      {label ? (
        <label className="field-label" htmlFor={htmlFor}>
          <span>{label}</span>
          {optional ? <span className="optional">Optional</span> : null}
        </label>
      ) : null}
      {children}
      {htmlFor ? <FieldMessages id={htmlFor} hint={hint} error={error} /> : null}
    </div>
  )
}

export function TextField({
  label,
  hint,
  error,
  optional = false,
  id,
  className = '',
  inputClassName = '',
  ...props
}) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <label className="field-label" htmlFor={fieldId}>
        <span>{label}</span>
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      <input
        id={fieldId}
        className={cx('input', inputClassName)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(fieldId, hint, error) || undefined}
        {...props}
      />
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function TextAreaField({
  label,
  hint,
  error,
  optional = false,
  id,
  className = '',
  rows = 4,
  ...props
}) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <label className="field-label" htmlFor={fieldId}>
        <span>{label}</span>
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        className="textarea"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(fieldId, hint, error) || undefined}
        {...props}
      />
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function SelectField({
  label,
  hint,
  error,
  optional = false,
  id,
  options = [],
  className = '',
  selectClassName = '',
  placeholder,
  ...props
}) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <label className="field-label" htmlFor={fieldId}>
        <span>{label}</span>
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      <div className="select-wrap">
        <select
          id={fieldId}
          className={cx('select', selectClassName)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(fieldId, hint, error) || undefined}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </div>
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function PasswordField({
  label = 'Password',
  hint,
  error,
  optional = false,
  id,
  className = '',
  ...props
}) {
  const autoId = useId()
  const fieldId = id || autoId
  const [visible, setVisible] = useState(false)
  return (
    <div className={cx('field', className)}>
      <label className="field-label" htmlFor={fieldId}>
        <span>{label}</span>
        {optional ? <span className="optional">Optional</span> : null}
      </label>
      <div className="password-field">
        <input
          id={fieldId}
          type={visible ? 'text' : 'password'}
          className="input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(fieldId, hint, error) || undefined}
          {...props}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function CheckboxField({ label, hint, error, id, className = '', ...props }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <label className="checkbox" htmlFor={fieldId}>
        <input
          id={fieldId}
          type="checkbox"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(fieldId, hint, error) || undefined}
          {...props}
        />
        <span>{label}</span>
      </label>
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function FileField({
  label,
  hint,
  error,
  accept = '.pdf,.doc,.docx',
  file,
  onChange,
  onRemove,
  id,
  className = '',
}) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <span className="field-label">{label}</span>
      {file ? (
        <div className="file-chip">
          <FileText aria-hidden="true" />
          <span>
            <strong>{file.name}</strong>
            {file.size ? <span> · {formatFileSize(file.size)}</span> : null}
          </span>
          <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>
            <X />
          </button>
        </div>
      ) : (
        <label className="file-drop" htmlFor={fieldId}>
          <span className="file-drop-icon">
            <Upload aria-hidden="true" />
          </span>
          <span>
            <strong>Choose a file</strong>
            <span>{accept.replaceAll(',', ' ')} · up to 5 MB</span>
          </span>
          <input
            id={fieldId}
            type="file"
            accept={accept}
            onChange={onChange}
            aria-describedby={describedBy(fieldId, hint, error) || undefined}
          />
        </label>
      )}
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function TagField({
  label,
  hint,
  error,
  value = [],
  onChange,
  placeholder = 'Type a skill and press Enter',
  id,
  className = '',
}) {
  const autoId = useId()
  const fieldId = id || autoId
  const [draft, setDraft] = useState('')

  const addSkill = (raw) => {
    const next = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (!next.length) return
    const merged = [...value]
    next.forEach((skill) => {
      if (!merged.some((existing) => existing.toLowerCase() === skill.toLowerCase())) {
        merged.push(skill)
      }
    })
    onChange(merged)
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addSkill(draft)
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={cx('field', className)}>
      <label className="field-label" htmlFor={fieldId}>
        <span>{label}</span>
        <span className="optional">{value.length} added</span>
      </label>
      <div
        className="tag-input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(fieldId, hint, error) || undefined}
      >
        {value.map((skill) => (
          <span className="tag" key={skill}>
            {skill}
            <button
              type="button"
              aria-label={`Remove ${skill}`}
              onClick={() => onChange(value.filter((item) => item !== skill))}
            >
              <X />
            </button>
          </span>
        ))}
        <input
          id={fieldId}
          value={draft}
          placeholder={value.length ? 'Add another' : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(draft)}
        />
      </div>
      <FieldMessages id={fieldId} hint={hint} error={error} />
    </div>
  )
}

export function SwitchField({ label, hint, id, className = '', ...props }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={cx('field', className)}>
      <label className="flex items-center justify-between gap-4" htmlFor={fieldId}>
        <span>
          <span className="block text-[13px] font-semibold text-ink">{label}</span>
          {hint ? <span className="mt-1 block text-xs text-faint">{hint}</span> : null}
        </span>
        <input id={fieldId} type="checkbox" className="switch" {...props} />
      </label>
    </div>
  )
}
