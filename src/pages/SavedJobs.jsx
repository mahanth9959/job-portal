import { ArrowUpRight, Bookmark, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  getRecommendedJobs,
  getSavedJobIds,
  getSavedJobs,
  jobsWithCompanies,
} from '../data/selectors'
import { formatSalary, normalize } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState, PageHeader, Panel, SearchInput } from '../components/ui/Layout'
import { PageFooter } from '../components/ui/PageFooter'
import { JobRow } from '../components/jobs/JobRow'

export function SavedJobs() {
  const { user } = useAuth()
  const { data, toggleSavedJob, directorySource, directoryUpdatedAt } = usePortal()
  const [query, setQuery] = useState('')

  const saved = useMemo(() => (data ? getSavedJobs(data, user) : []), [data, user])
  const filtered = useMemo(() => {
    const term = normalize(query)
    if (!term) return saved
    return saved.filter((job) =>
      normalize(
        [job.title, job.company?.name, job.location, job.category, ...(job.skills || [])]
          .filter(Boolean)
          .join(' '),
      ).includes(term),
    )
  }, [saved, query])

  const suggestions = useMemo(() => {
    if (!data) return []
    if (user.role === 'candidate') return getRecommendedJobs(data, user, 3)
    const savedIds = new Set(getSavedJobIds(data, user.id))
    return jobsWithCompanies(data.jobs, data.companies)
      .filter((job) => job.status === 'Open' && !savedIds.has(job.id))
      .slice(0, 3)
  }, [data, user])

  if (!data) return null

  const remove = (job) => {
    toggleSavedJob(job.id)
    toast.success(`Removed ${job.title} from saved jobs.`)
  }

  return (
    <>
      <PageHeader
        title="Saved jobs"
        subtitle="A short list to return to. Save the roles that need a second look; remove the ones that do not."
        actions={
          <ButtonLink to="/jobs" variant="primary">
            <Search aria-hidden="true" />
            Find more roles
          </ButtonLink>
        }
      />

      <div className="toolbar">
        <SearchInput
          className="filter-search"
          value={query}
          onChange={setQuery}
          placeholder="Search saved roles or skills"
          label="Search saved jobs"
        />
        <div className="toolbar-spacer" />
        <span className="result-count" aria-live="polite">
          {filtered.length} saved {filtered.length === 1 ? 'role' : 'roles'}
        </span>
      </div>

      <section className="panel px-5 py-2">
        {filtered.length ? (
          <div className="job-list">
            {filtered.map((job) => (
              <JobRow key={job.id} job={job} saved onToggleSave={remove} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title={saved.length ? 'No saved roles match that search' : 'Nothing saved yet'}
            text={
              saved.length
                ? 'Try a shorter search or clear it to see the full list.'
                : 'Bookmark a role and it will wait here. No pressure, no disappearing tab.'
            }
            action={
              <ButtonLink to="/jobs" variant="primary" size="sm">
                Browse jobs
              </ButtonLink>
            }
          />
        )}
      </section>

      {suggestions.length ? (
        <Panel
          className="mt-6"
          title="More roles worth a look"
          subtitle={
            user.role === 'candidate'
              ? 'Open roles that share the most ground with your profile.'
              : 'Recently posted roles from across the directory.'
          }
          action={
            <Link className="link-quiet" to="/jobs">
              All roles <ArrowUpRight aria-hidden="true" />
            </Link>
          }
        >
          <div className="list-rows">
            {suggestions.map((job) => (
              <Link className="list-row" to={`/jobs/${job.id}`} key={job.id}>
                <CompanyMark company={job.company} size="sm" />
                <span className="list-row-main">
                  <span className="list-row-title">{job.title}</span>
                  <span className="list-row-sub">
                    {job.company?.name} · {job.location} · {job.type}
                  </span>
                </span>
                <span className="list-row-side">
                  <span className="strong">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="sub">
                    {job.match ? `${job.match.percent}% match` : 'Open role'}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
