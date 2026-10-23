import {
  ArrowUpRight,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { deadlineLabel, formatSalary, timeAgo } from '../../lib/format'
import { CompanyMark } from '../CompanyMark'
import { JobStatusPill, Pill } from '../StatusPill'
import { Menu } from '../ui/Layout'

export function JobRow({
  job,
  saved = false,
  onToggleSave,
  onEdit,
  onDelete,
  manage = false,
  variant = 'default',
  showApplicants = false,
  compact = false,
}) {
  const company = job.company
  const actions = [
    { label: 'View role', to: `/jobs/${job.id}`, icon: <ArrowUpRight /> },
    onToggleSave
      ? {
          label: saved ? 'Remove from saved' : 'Save this role',
          onClick: () => onToggleSave(job),
          icon: <Bookmark />,
        }
      : null,
    manage ? { separator: true } : null,
    manage
      ? { label: 'Edit role', onClick: () => onEdit?.(job), icon: <Pencil /> }
      : null,
    manage
      ? {
          label: 'Delete role',
          onClick: () => onDelete?.(job),
          icon: <Trash2 />,
          danger: true,
        }
      : null,
  ].filter(Boolean)

  return (
    <article className={`job-row ${compact ? 'job-row-compact' : ''}`}>
      <div className="job-main">
        <CompanyMark company={company} size="md" />
        <div className="min-w-0">
          <Link className="job-title" to={`/jobs/${job.id}`}>
            {job.title}
          </Link>
          <div className="job-company">
            <span>{company?.name || 'Hireline company'}</span>
            <span aria-hidden="true">·</span>
            <span>{job.location}</span>
            <span className="job-posted-sep" aria-hidden="true">·</span>
            <span className="job-posted">{timeAgo(job.postedAt)}</span>
          </div>
          <div className="job-meta-line">
            <span className="job-tag">{job.type}</span>
            <span className="job-tag">{job.experience}</span>
            <span className="job-tag">{job.workMode}</span>
          </div>
        </div>
      </div>

      <div className="job-side">
        <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
        <span className="sub">
          {showApplicants
            ? `${job.applicantCount || 0} applicants`
            : deadlineLabel(job.deadline, job.status)}
        </span>
      </div>

      <div className="job-status">
        {variant === 'match' && job.match ? (
          <Pill tone="accent">{job.match.percent}% match</Pill>
        ) : (
          <JobStatusPill status={job.status} />
        )}
      </div>

      <div className="row-actions justify-end">
        {onToggleSave ? (
          <button
            type="button"
            className={`job-bookmark ${saved ? 'is-saved' : ''}`}
            onClick={() => onToggleSave(job)}
            aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            aria-pressed={saved}
          >
            <Bookmark fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ) : null}
        {actions.length ? (
          <Menu
            label={`More actions for ${job.title}`}
            trigger={
              <button
                type="button"
                className="kebab"
                aria-label={`More actions for ${job.title}`}
              >
                <MoreHorizontal aria-hidden="true" />
              </button>
            }
            items={actions}
          />
        ) : null}
      </div>
    </article>
  )
}
