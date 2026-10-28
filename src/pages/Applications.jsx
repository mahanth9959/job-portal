import {
  ArrowUpRight,
  Briefcase,
  FileText,
  Inbox,
  Mail,
  MoreHorizontal,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  filterApplications,
  getJobById,
  getUserApplications,
  paginate,
} from '../data/selectors'
import { PAGE_SIZE, STAGES } from '../lib/constants'
import { formatDate, formatNumber, timeAgo } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { UserAvatar } from '../components/UserAvatar'
import { ApplicationProgress } from '../components/charts/Charts'
import { StatusPill } from '../components/StatusPill'
import { Button, ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { SelectField } from '../components/ui/Fields'
import {
  EmptyState,
  Menu,
  PageHeader,
  Pagination,
  SearchInput,
  Tabs,
} from '../components/ui/Layout'
import { ConfirmDialog, Sheet } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'

const tabLabels = {
  all: 'All',
  Applied: 'Applied',
  Screening: 'Screening',
  Interview: 'Interview',
  Offer: 'Offer',
  Closed: 'Closed',
}

function matchesClosed(application) {
  return application.status === 'Rejected' || application.status === 'Withdrawn'
}

export function Applications() {
  const { user } = useAuth()
  const {
    data,
    withdrawApplication,
    updateApplicationStage,
    directorySource,
    directoryUpdatedAt,
  } = usePortal()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(searchParams.get('application') || '')
  const [withdrawTarget, setWithdrawTarget] = useState(null)

  const applications = useMemo(
    () => (data ? getUserApplications(data, user) : []),
    [data, user],
  )
  const jobFilterId = searchParams.get('job')
  const jobFilter = data && jobFilterId ? getJobById(data.jobs, jobFilterId) : null

  const baseApplications = useMemo(() => {
    if (!jobFilterId) return applications
    return applications.filter((application) => application.jobId === jobFilterId)
  }, [applications, jobFilterId])

  useEffect(() => {
    const next = searchParams.get('application')
    if (next) {
      setSelectedId(next)
      setPage(1)
    }
  }, [searchParams])

  const counts = useMemo(
    () => ({
      all: baseApplications.length,
      Applied: baseApplications.filter((item) => item.status === 'Applied').length,
      Screening: baseApplications.filter((item) => item.status === 'Screening').length,
      Interview: baseApplications.filter((item) => item.status === 'Interview').length,
      Offer: baseApplications.filter((item) => item.status === 'Offer').length,
      Closed: baseApplications.filter(matchesClosed).length,
    }),
    [baseApplications],
  )

  const filtered = useMemo(() => {
    let rows = baseApplications
    if (tab !== 'all' && tab !== 'Closed') {
      rows = rows.filter((item) => item.status === tab)
    } else if (tab === 'Closed') {
      rows = rows.filter(matchesClosed)
    }
    return filterApplications(rows, { query, status: 'all' })
  }, [baseApplications, tab, query])

  const paged = paginate(filtered, page, PAGE_SIZE.applications)
  const selected = applications.find((item) => item.id === selectedId) || null

  useEffect(() => {
    setPage(1)
  }, [tab, query, jobFilterId])

  useEffect(() => {
    if (page > paged.pages) setPage(paged.pages)
  }, [page, paged.pages])

  if (!data) return null

  const closeSheet = () => {
    setSelectedId('')
    if (searchParams.get('application')) {
      const next = new URLSearchParams(searchParams)
      next.delete('application')
      setSearchParams(next, { replace: true })
    }
  }

  const clearJobFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('job')
    setSearchParams(next, { replace: true })
  }

  const confirmWithdraw = () => {
    if (!withdrawTarget) return
    try {
      withdrawApplication(withdrawTarget.id)
      toast.info('Application withdrawn. It stays in your history.')
      setWithdrawTarget(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const moveStage = (application, status) => {
    try {
      updateApplicationStage(application.id, status)
      toast.success(`${application.candidateName} moved to ${status}.`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const tabs = ['all', ...STAGES.filter((stage) => stage !== 'Rejected' && stage !== 'Withdrawn').slice(0, 5)]
  const filteredTabs = tabs.map((value) => ({
    value,
    label: tabLabels[value],
    count: counts[value],
  }))
  if (counts.Closed) {
    filteredTabs.push({ value: 'Closed', label: 'Closed', count: counts.Closed })
  }

  const isRecruiter = user.role === 'recruiter'

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle={
          isRecruiter
            ? `${counts.all} applications across the line. Search a person, a role or a company.`
            : 'Every application, one clear line. The next step is always visible.'
        }
        actions={
          isRecruiter ? (
            <>
              <ButtonLink to="/reports" variant="secondary">
                Hiring report
              </ButtonLink>
              <ButtonLink to="/jobs" variant="primary">
                Open roles
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/jobs" variant="secondary">
                Find jobs
              </ButtonLink>
              <ButtonLink to="/saved-jobs" variant="primary">
                Saved jobs
              </ButtonLink>
            </>
          )
        }
      />

      {jobFilter ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[6px] bg-accent-soft px-3 py-2 text-xs text-accent-ink">
          <Briefcase className="size-3.5" aria-hidden="true" />
          Showing applications for <strong>{jobFilter.title}</strong>
          <button type="button" className="ml-auto font-semibold underline underline-offset-2" onClick={clearJobFilter}>
            Clear role filter
          </button>
        </div>
      ) : null}

      <Tabs tabs={filteredTabs} value={tab} onChange={setTab} ariaLabel="Application stages" />

      <div className="toolbar">
        <SearchInput
          className="filter-search"
          value={query}
          onChange={setQuery}
          placeholder={isRecruiter ? 'Search candidate, role or company' : 'Search role or company'}
          label="Search applications"
        />
        <div className="toolbar-spacer" />
        <span className="result-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'application' : 'applications'}
        </span>
      </div>

      <section className="panel panel-flush">
        {paged.items.length ? (
          <div className="table-wrap">
            <table className="data-table table-applications">
              <thead>
                <tr>
                  <th>{isRecruiter ? 'Candidate' : 'Role'}</th>
                  <th className="hidden lg:table-cell">{isRecruiter ? 'Role' : 'Company'}</th>
                  <th className="hidden md:table-cell">Applied</th>
                  <th>Stage</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {paged.items.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <button
                        type="button"
                        className="row-link flex items-center gap-3 text-left"
                        onClick={() => setSelectedId(application.id)}
                      >
                        {isRecruiter ? (
                          <UserAvatar
                            name={application.candidateName}
                            src={application.candidateAvatar}
                            size="md"
                          />
                        ) : (
                          <CompanyMark company={application.company} size="md" />
                        )}
                        <span className="min-w-0">
                          <span className="cell-title block">
                            {isRecruiter ? application.candidateName : application.job?.title}
                          </span>
                          <span className="cell-sub cell-sub-email block max-w-[42ch] truncate">
                            {isRecruiter
                              ? `${application.candidateTitle || 'Candidate'} · ${application.candidateEmail}`
                              : `${application.company?.name || 'Company'} · applied ${timeAgo(application.appliedAt)}`}
                          </span>
                          <span className="cell-sub cell-sub-mobile">
                            {isRecruiter
                              ? application.job?.title
                              : `Applied ${formatDate(application.appliedAt)}`}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="hidden lg:table-cell">
                      {isRecruiter ? (
                        <>
                          <span className="block text-[12.5px] font-medium text-ink">
                            {application.job?.title || 'Role'}
                          </span>
                          <span className="cell-sub">{application.company?.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="block text-[12.5px] font-medium text-ink">
                            {application.company?.name || 'Company'}
                          </span>
                          <span className="cell-sub">{application.job?.location}</span>
                        </>
                      )}
                    </td>
                    <td className="hidden md:table-cell text-muted">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td>
                      <StatusPill status={application.status} />
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <Menu
                          label={`Actions for ${application.candidateName}`}
                          trigger={
                            <button
                              type="button"
                              className="kebab"
                              aria-label={`Actions for ${application.candidateName}`}
                            >
                              <MoreHorizontal aria-hidden="true" />
                            </button>
                          }
                          items={
                            isRecruiter
                              ? [
                                  {
                                    label: 'View application',
                                    onClick: () => setSelectedId(application.id),
                                    icon: <FileText />,
                                  },
                                  {
                                    label: 'View candidate',
                                    onClick: () => setSelectedId(application.id),
                                    icon: <UserRound />,
                                  },
                                  { separator: true },
                                  ...STAGES.filter((stage) => stage !== application.status).map(
                                    (stage) => ({
                                      label: `Move to ${stage}`,
                                      onClick: () => moveStage(application, stage),
                                      icon: <ArrowUpRight />,
                                    }),
                                  ),
                                ]
                              : [
                                  {
                                    label: 'View application',
                                    onClick: () => setSelectedId(application.id),
                                    icon: <FileText />,
                                  },
                                  {
                                    label: 'View role',
                                    to: `/jobs/${application.jobId}`,
                                    icon: <Briefcase />,
                                  },
                                  { separator: true },
                                  {
                                    label: 'Withdraw application',
                                    onClick: () => setWithdrawTarget(application),
                                    icon: <Inbox />,
                                    danger: true,
                                    disabled:
                                      application.status === 'Withdrawn' ||
                                      application.status === 'Rejected',
                                  },
                                ]
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title="No applications match this view"
              text={
                query
                  ? 'Try a shorter search or a different stage.'
                  : 'When an application lands, it will appear here with its next step.'
              }
              action={
                query ? (
                  <Button variant="secondary" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                ) : !isRecruiter ? (
                  <ButtonLink to="/jobs" variant="primary" size="sm">
                    Find a role
                  </ButtonLink>
                ) : null
              }
            />
          </div>
        )}
        <div className="px-5 pb-2">
          <Pagination
            page={paged.page}
            pages={paged.pages}
            from={paged.from}
            to={paged.to}
            total={paged.total}
            onPageChange={setPage}
            label="applications"
          />
        </div>
      </section>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />

      <Sheet
        open={Boolean(selected)}
        onClose={closeSheet}
        title="Application"
        width="lg"
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink to={`/jobs/${selected.jobId}`} variant="secondary">
                View role
              </ButtonLink>
              {isRecruiter ? (
                <ButtonAnchor
                  href={`mailto:${selected.candidateEmail}?subject=${encodeURIComponent(
                    `Your application for ${selected.job?.title || 'the role'}`,
                  )}`}
                  variant="primary"
                >
                  <Mail aria-hidden="true" />
                  Write to candidate
                </ButtonAnchor>
              ) : selected.status !== 'Withdrawn' && selected.status !== 'Rejected' ? (
                <Button variant="danger" onClick={() => setWithdrawTarget(selected)}>
                  Withdraw application
                </Button>
              ) : null}
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              {isRecruiter ? (
                <UserAvatar name={selected.candidateName} src={selected.candidateAvatar} size="lg" />
              ) : (
                <CompanyMark company={selected.company} size="lg" />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-6 tracking-[-0.02em] text-ink">
                  {isRecruiter ? selected.candidateName : selected.job?.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {isRecruiter
                    ? `${selected.candidateTitle || 'Candidate'} · ${selected.job?.title}`
                    : `${selected.company?.name} · ${selected.job?.location}`}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-faint">
                  <StatusPill status={selected.status} />
                  <span>Applied {formatDate(selected.appliedAt)}</span>
                  <span>·</span>
                  <span>Updated {timeAgo(selected.stageUpdatedAt)}</span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Application line</h3>
              <ApplicationProgress application={selected} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[6px] bg-raised p-4">
                <div className="text-[11px] text-faint">Salary</div>
                <div className="mt-1 text-sm font-medium text-ink">
                  {selected.job
                    ? `$${formatNumber(selected.job.salaryMin)} – $${formatNumber(
                        selected.job.salaryMax,
                      )}`
                    : '—'}
                </div>
              </div>
              <div className="rounded-[6px] bg-raised p-4">
                <div className="text-[11px] text-faint">Deadline</div>
                <div className="mt-1 text-sm font-medium text-ink">
                  {selected.job ? formatDate(selected.job.deadline) : '—'}
                </div>
              </div>
            </div>

            {selected.note ? (
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {isRecruiter ? 'Candidate note' : 'Your note'}
                </h3>
                <p className="mt-2 rounded-[6px] bg-raised p-4 text-sm leading-6 text-muted">
                  {selected.note}
                </p>
              </div>
            ) : null}

            {isRecruiter ? (
              <div className="grid gap-2 border-t border-rule pt-5">
                <SelectField
                  label="Move application to"
                  value={selected.status}
                  onChange={(event) => moveStage(selected, event.target.value)}
                  options={STAGES.map((stage) => ({ value: stage, label: stage }))}
                />
                <p className="text-[11px] leading-5 text-faint">
                  Changing the stage updates the recruiter pipeline and the candidate’s view.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 border-t border-rule pt-5 text-xs text-muted">
                <a className="flex items-center gap-2 hover:text-ink" href={`mailto:${selected.company?.contact?.email || selected.company?.email || ''}`}>
                  <Mail className="size-4 text-faint" aria-hidden="true" />
                  Write to {selected.company?.contact?.name || 'the hiring team'}
                </a>
                <Link className="flex items-center gap-2 hover:text-ink" to={`/companies/${selected.company?.id}`} onClick={closeSheet}>
                  <CompanyMark company={selected.company} size="sm" />
                  {selected.company?.name}
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </Sheet>

      <ConfirmDialog
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={confirmWithdraw}
        title="Withdraw this application?"
        description={
          withdrawTarget
            ? `Your application to ${withdrawTarget.job?.title || 'the role'} will move to withdrawn. The record stays in your history.`
            : ''
        }
        confirmLabel="Withdraw application"
        tone="primary"
      />
    </>
  )
}
