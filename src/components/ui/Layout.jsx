import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  X,
} from 'lucide-react'
import { cloneElement, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'

export function PageHeader({ title, subtitle, actions, breadcrumb, className = '' }) {
  return (
    <header className={cx('page-header', className)}>
      <div className="min-w-0">
        {breadcrumb?.length ? (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.to && index < breadcrumb.length - 1 ? (
                  <Link to={item.to}>{item.label}</Link>
                ) : (
                  <span className={index === breadcrumb.length - 1 ? 'current' : ''}>
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  )
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
  flush = false,
  id,
}) {
  return (
    <section className={cx('panel', flush ? 'panel-flush' : '', className)} id={id}>
      {title || action ? (
        <header className={cx('panel-header', flush ? 'px-6 pt-5' : '')}>
          <div className="min-w-0">
            {title ? <h2 className="panel-title">{title}</h2> : null}
            {subtitle ? <p className="panel-sub">{subtitle}</p> : null}
          </div>
          {action ? <div className="flex flex-none items-center gap-2">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function RailSection({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={cx('rail-section', className)}>
      <header className="rail-section-header">
        <div className="min-w-0">
          {title ? <h2 className="rail-section-title">{title}</h2> : null}
          {subtitle ? <p className="rail-section-sub">{subtitle}</p> : null}
        </div>
        {action ? <div className="flex flex-none items-center gap-2">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}

export function StatStrip({ items, ariaLabel = 'Key figures' }) {
  return (
    <section className="stat-strip" aria-label={ariaLabel}>
      {items.map((item) => {
        const content = (
          <>
            <div className="stat-label">{item.label}</div>
            <div className="stat-value">{item.value}</div>
            {item.caption ? <div className="stat-caption">{item.caption}</div> : null}
          </>
        )
        return item.to ? (
          <Link className="stat-cell stat-link" to={item.to} key={item.label}>
            {content}
          </Link>
        ) : (
          <div className="stat-cell" key={item.label}>
            {content}
          </div>
        )
      })}
    </section>
  )
}

export function Tabs({ tabs, value, onChange, ariaLabel = 'Views' }) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className="tab"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count != null ? <span className="tab-count">{tab.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search',
  className = '',
}) {
  return (
    <div className={cx('search-field relative', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-[1] size-4 -translate-y-1/2 text-faint"
        aria-hidden="true"
      />
      <input
        type="search"
        className="input pl-9 pr-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {value ? (
        <button
          type="button"
          className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[4px] text-faint hover:bg-raised hover:text-ink"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

export function InlineSelect({ label, value, onChange, options, className = '' }) {
  return (
    <div className={cx('select-wrap', className)}>
      <select
        className="select filter-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" />
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, text, action, className = '' }) {
  return (
    <div className={cx('empty-state', className)}>
      <span className="empty-icon">
        <Icon aria-hidden="true" />
      </span>
      <p className="empty-title">{title}</p>
      {text ? <p className="empty-text">{text}</p> : null}
      {action ? <div className="empty-actions">{action}</div> : null}
    </div>
  )
}

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  const values = new Set([1, pages, page - 1, page, page + 1])
  const list = [...values].filter((value) => value > 0 && value <= pages).sort((a, b) => a - b)
  const withBreaks = []
  list.forEach((value, index) => {
    if (index > 0 && value - list[index - 1] > 1) withBreaks.push('…')
    withBreaks.push(value)
  })
  return withBreaks
}

export function Pagination({ page, pages, from, to, total, onPageChange, label = 'results' }) {
  if (pages <= 1) {
    return (
      <div className="pagination">
        <span className="pagination-info">
          {total} {label}
        </span>
      </div>
    )
  }
  return (
    <div className="pagination">
      <span className="pagination-info">
        {from}–{to} of {total} {label}
      </span>
      <div className="pagination-buttons">
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        {pageList(page, pages).map((item) =>
          item === '…' ? (
            <span key={`break-${item}-${page}`} className="page-btn" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className="page-btn"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export function Menu({ trigger, items, align = 'right', label = 'Menu' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const triggerNode = cloneElement(trigger, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-label': trigger.props['aria-label'] || label,
    onClick: (event) => {
      trigger.props.onClick?.(event)
      if (!event.defaultPrevented) setOpen((current) => !current)
    },
  })

  return (
    <div className="menu" ref={rootRef}>
      {triggerNode}
      {open ? (
        <div className={cx('menu-pop', align === 'left' ? 'left' : '')} role="menu">
          {items.map((item, index) =>
            item.separator ? (
              <div className="menu-sep" key={`sep-${index}`} />
            ) : item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className={cx('menu-item', item.danger ? 'danger' : '')}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={cx('menu-item', item.danger ? 'danger' : '')}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false)
                  item.onClick?.()
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

export function Notice({ tone = 'neutral', icon: Icon, children, action, className = '' }) {
  return (
    <div
      className={cx(
        'notice',
        tone === 'warning' ? 'notice-warning' : '',
        tone === 'error' ? 'notice-error' : '',
        className,
      )}
      role={tone === 'error' ? 'alert' : undefined}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="notice-action">{action}</div> : null}
    </div>
  )
}

export function SkeletonPage() {
  return (
    <div className="stack-24" aria-label="Loading workspace" aria-busy="true">
      <div className="space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-64 max-w-full" />
        <div className="skeleton h-3 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="bg-surface p-5" key={index}>
            <div className="skeleton h-3 w-20" />
            <div className="skeleton mt-3 h-7 w-14" />
            <div className="skeleton mt-3 h-2.5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid-12">
        <div className="col-8 panel">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton mt-6 h-52 w-full" />
        </div>
        <div className="col-4 panel">
          <div className="skeleton h-5 w-36" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex items-center gap-3" key={index}>
                <div className="skeleton size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-4/5" />
                  <div className="skeleton h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
