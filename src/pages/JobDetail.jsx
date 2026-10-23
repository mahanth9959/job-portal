import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  CalendarClock,
  Check,
  Clock3,
  MapPin,
  Pencil,
  Send,
  Trash2,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  getApplicationForCandidate,
  getCandidateMatch,
  getCompanyById,
  getJobApplications,
  getJobWithCompany,
  getSavedJobIds,
  jobsWithCompanies,
} from '../data/selectors'
import { ACTIVE_STAGES } from '../lib/constants'
import { formatDate, formatNumber, formatSalary, timeAgo } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { UserAvatar } from '../components/UserAvatar'
import { ApplicationProgress } from '../components/charts/Charts'
import { JobStatusPill, Pill, StatusPill } from '../components/StatusPill'
import { Button, ButtonLink } from '../components/ui/Button'
import { TextAreaField } from '../components/ui/Fields'
import { EmptyState, PageHeader, Panel, RailSection } from '../components/ui/Layout'
import { ConfirmDialog, Modal } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'
import { JobRow } from '../components/jobs/JobRow'

export function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const {
    data,
    deleteJob,
    toggleSavedJob,
    applyToJob,
    withdrawApplication,
    directorySource,
    directoryUpdatedAt,
  } = usePortal()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [applyOpen, setApplyOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [note, setNote] = useState('')
  const [applyError, setApplyError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const job = data ? getJobWithCompany(data.jobs, data.companies, id) : null
  const company = job ? getCompanyById(data.companies, job.companyId) : null
  const savedIds = data ? getSavedJobIds(data, user.id) : []
  const saved = savedIds.includes(id)
  const application = data ? getApplicationForCandidate(data, user.id, id) : null
  const applicants = data ? getJobApplications(data, id) : []
  const match = getCandidateMatch(job, user)

  const stageCounts = useMemo(
    () =>
      ACTIVE_STAGES.map((stage) => ({
        stage,
        count: applicants.filter((item) => item.status === stage).length,
      })),
    [applicants],
  )

  const similar = useMemo(() => {
    if (!data || !job) return []
    return jobsWithCompanies(data.jobs, data.companies)
      .filter(
        (item) =>
          item.id !== job.id &&
          item.status === 'Open' &&
          (item.category === job.category || item.companyId === job.companyId),
      )
      .slice(0, 3)
  }, [data, job])

  if (!data) return null
  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="That role is no longer here"
        text="It may have been deleted or the link may be old. The rest of the directory is still open."
        action={
          <ButtonLink to="/jobs" variant="primary">
            Back to jobs
          </ButtonLink>
        }
      />
    )
  }

  const isRecruiter = user.role === 'recruiter'
  const closed = job.status === 'Closed'
  const toggleSave = (item = job) => {
    const wasSaved = savedIds.includes(item.id)
    toggleSavedJob(item.id)
    toast.success(wasSaved ? `Removed ${item.title} from saved jobs.` : `Saved ${item.title}.`)
  }

  const submitApplication = async () => {
    setSubmitting(true)
    setApplyError('')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      applyToJob(job.id, note)
      toast.success('Application sent. It is now in your applications.')
      setApplyOpen(false)
      setNote('')
    } catch (error) {
      setApplyError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmWithdraw = () => {
    try {
      withdrawApplication(application.id)
      toast.info('Application withdrawn. The role stays in your history.')
      setWithdrawOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const confirmDelete = () => {
    deleteJob(job.id)
    toast.success(`${job.title} was deleted.`)
    navigate('/jobs', { replace: true })
  }

  const highlightApplication = searchParams.get('application')

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Jobs', to: '/jobs' },
          { label: job.title },
        ]}
        title={job.title}
        subtitle={
          <span>
            <Link className="link-quiet" to={`/companies/${company?.id}`}>
              {company?.name}
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <span className="mx-2 text-faint">·</span>
            {job.location}
            <span className="mx-2 text-faint">·</span>
            {job.type}
            <span className="mx-2 text-faint">·</span>
            {job.experience}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={toggleSave}>
              <Bookmark fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
              {saved ? 'Saved' : 'Save'}
            </Button>
            {isRecruiter ? (
              <>
                <ButtonLink to={`/jobs/${job.id}/edit`} variant="secondary">
                  <Pencil aria-hidden="true" />
                  Edit
                </ButtonLink>
                <ButtonLink to={`/applications?job=${job.id}`} variant="primary">
                  <Users aria-hidden="true" />
                  {applicants.length} applicants
                </ButtonLink>
              </>
            ) : application ? (
              <ButtonLink to={`/applications?application=${application.id}`} variant="primary">
                View application
                <ArrowUpRight aria-hidden="true" />
              </ButtonLink>
            ) : (
              <Button
                variant="primary"
                onClick={() => setApplyOpen(true)}
                disabled={closed}
              >
                <Send aria-hidden="true" />
                {closed ? 'Applications closed' : 'Apply for this role'}
              </Button>
            )}
          </>
        }
      />

      <div className="job-detail-grid">
        <div className="stack-24">
          <Panel>
            <div className="flex flex-wrap items-center gap-2">
              <JobStatusPill status={job.status} size="lg" />
              <Pill tone="accent">{job.category}</Pill>
              <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                <Clock3 className="size-3.5" aria-hidden="true" />
                Posted {timeAgo(job.postedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {closed ? 'Closed' : `Closes ${formatDate(job.deadline)}`}
              </span>
            </div>

            <div className="prose-block mt-6">
              <p>{job.description}</p>
              <h3>What you’ll do</h3>
              <ul>
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>What we’re looking for</h3>
              <ul>
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h3>Skills for the role</h3>
              <div className="skill-list">
                {job.skills.map((skill) => (
                  <span className="skill-chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
              <h3>What the team offers</h3>
              <ul>
                {job.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Panel>

          {isRecruiter ? (
            <Panel
              title="Applicants"
              subtitle={`${applicants.length} people have applied to this role.`}
              action={
                <Link className="link-quiet" to={`/applications?job=${job.id}`}>
                  Open pipeline <ArrowUpRight aria-hidden="true" />
                </Link>
              }
            >
              <div className="grid gap-4">
                <div className="flex flex-wrap gap-2">
                  {stageCounts.map((stage) => (
                    <Pill key={stage.stage} tone={stage.stage === 'Interview' ? 'accent' : 'neutral'}>
                      {stage.stage} {stage.count}
                    </Pill>
                  ))}
                </div>
                {applicants.length ? (
                  <div className="list-rows">
                    {applicants.slice(0, 5).map((applicant) => (
                      <Link
                        className="list-row"
                        to={`/applications?application=${applicant.id}`}
                        key={applicant.id}
                      >
                        <UserAvatar name={applicant.candidateName} src={applicant.candidateAvatar} size="md" />
                        <span className="list-row-main">
                          <span className="list-row-title">{applicant.candidateName}</span>
                          <span className="list-row-sub">
                            {applicant.candidateTitle || 'Candidate'} · applied {timeAgo(applicant.appliedAt)}
                          </span>
                        </span>
                        <StatusPill status={applicant.status} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No applications yet"
                    text="Share the role or invite a candidate from the directory."
                    action={
                      <ButtonLink to="/candidates" variant="secondary" size="sm">
                        Browse candidates
                      </ButtonLink>
                    }
                  />
                )}
              </div>
            </Panel>
          ) : null}

          {similar.length ? (
            <Panel title="Similar roles" subtitle="Adjacent work from the same directory.">
              <div className="job-list">
                {similar.map((item) => (
                  <JobRow
                    key={item.id}
                    job={item}
                    saved={savedIds.includes(item.id)}
                    onToggleSave={toggleSave}
                    compact
                  />
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        <aside className="grid gap-4 rail-stack">
          <RailSection title="Role snapshot">
            <div className="snapshot">
              <div className="snapshot-row">
                <span className="snapshot-label">Salary</span>
                <span className="snapshot-value">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Type</span>
                <span className="snapshot-value">{job.type}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Experience</span>
                <span className="snapshot-value">{job.experience}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Location</span>
                <span className="snapshot-value">{job.location}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Work mode</span>
                <span className="snapshot-value">{job.workMode}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Deadline</span>
                <span className="snapshot-value">{formatDate(job.deadline)}</span>
              </div>
            </div>
          </RailSection>

          {!isRecruiter ? (
            <RailSection title="Your match" subtitle="A quick read against your profile skills.">
              <div className="match-meter">
                <div className="match-head">
                  <span>{match.label}</span>
                  <strong>{match.percent}%</strong>
                </div>
                <div className="match-track">
                  <span style={{ width: `${match.percent}%` }} />
                </div>
                {match.matched.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {match.matched.map((skill) => (
                      <span className="skill-chip" key={skill}>
                        <Check className="mr-1 size-3 text-positive" aria-hidden="true" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
                {match.missing.length ? (
                  <p className="text-xs leading-5 text-faint">
                    Still to show: {match.missing.join(', ')}. A profile update takes two
                    minutes.
                  </p>
                ) : null}
                {!match.missing.length && match.matched.length ? (
                  <p className="text-xs leading-5 text-positive">A strong match on paper.</p>
                ) : null}
              </div>
            </RailSection>
          ) : null}

          {!isRecruiter ? (
            <RailSection title={application ? 'Your application' : 'Ready to apply?'}>
              {application ? (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <StatusPill status={application.status} size="lg" />
                    <span className="text-xs text-faint">
                      Sent {formatDate(application.appliedAt)}
                    </span>
                  </div>
                  <ApplicationProgress application={application} />
                  {application.note ? (
                    <p className="rounded-[6px] bg-raised p-3 text-xs leading-5 text-muted">
                      “{application.note}”
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink
                      to={`/applications?application=${application.id}`}
                      variant="secondary"
                      size="sm"
                    >
                      Open application
                    </ButtonLink>
                    {application.status !== 'Withdrawn' && application.status !== 'Rejected' ? (
                      <Button variant="danger" size="sm" onClick={() => setWithdrawOpen(true)}>
                        Withdraw
                      </Button>
                    ) : null}
                  </div>
                  {highlightApplication === application.id ? (
                    <p className="text-[11px] text-faint">Opened from the application line.</p>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4">
                  <p className="text-xs leading-5 text-muted">
                    {closed
                      ? 'This role has closed for new applications. Save it for the next opening.'
                      : `Applications close ${formatDate(job.deadline)}. Your profile and resume are attached automatically.`}
                  </p>
                  <Button
                    variant="primary"
                    block
                    disabled={closed}
                    onClick={() => setApplyOpen(true)}
                  >
                    <Send aria-hidden="true" />
                    {closed ? 'Applications closed' : 'Apply for this role'}
                  </Button>
                  <p className="text-center text-[11px] text-faint">
                    Static demo · stored in this browser
                  </p>
                </div>
              )}
            </RailSection>
          ) : (
            <RailSection title="Hiring snapshot" subtitle="Where this role stands today.">
              <div className="grid gap-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[28px] font-medium leading-none tracking-[-0.03em] text-ink">
                      {formatNumber(applicants.length)}
                    </div>
                    <div className="mt-1 text-xs text-faint">applications received</div>
                  </div>
                  <JobStatusPill status={job.status} />
                </div>
                <div className="snapshot">
                  {stageCounts.map((stage) => (
                    <div className="snapshot-row" key={stage.stage}>
                      <span className="snapshot-label">{stage.stage}</span>
                      <span className="snapshot-value">{stage.count}</span>
                    </div>
                  ))}
                </div>
                <ButtonLink to={`/applications?job=${job.id}`} variant="secondary" block size="sm">
                  Review applications
                </ButtonLink>
              </div>
            </RailSection>
          )}

          <RailSection title="The company" subtitle="Who you would be working with.">
            <Link className="flex items-start gap-3" to={`/companies/${company?.id}`}>
              <CompanyMark company={company} size="lg" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{company?.name}</span>
                <span className="mt-1 block text-xs text-faint">
                  {company?.industry} · {company?.location}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-accent-ink">
                  View company <ArrowUpRight className="size-3" aria-hidden="true" />
                </span>
              </span>
            </Link>
            <p className="mt-4 text-xs leading-5 text-muted">{company?.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" aria-hidden="true" />
                {company?.employees} people
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {company?.location}
              </span>
            </div>
          </RailSection>

          {isRecruiter ? (
            <div className="flex gap-2">
              <ButtonLink to={`/jobs/${job.id}/edit`} variant="secondary" block size="sm">
                <Pencil aria-hidden="true" />
                Edit role
              </ButtonLink>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Apply to ${job.title}`}
        description={`${company?.name} · ${job.location}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setApplyOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={submitApplication}>
              <Send aria-hidden="true" />
              Send application
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          {applyError ? <p className="field-error">{applyError}</p> : null}
          <div className="rounded-[6px] bg-accent-soft p-3 text-xs leading-5 text-accent-ink">
            <strong className="block text-[13px]">Your application will include</strong>
            {user.name} · {user.email}
            <br />
            {user.resume?.name ? `Resume: ${user.resume.name}` : 'No resume attached yet. Add one in your profile.'}
          </div>
          <TextAreaField
            label="A note for the hiring team"
            optional
            rows={4}
            placeholder="What makes this role a good next step?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            hint="Keep it short. A specific sentence is better than a paragraph."
          />
          <p className="text-[11px] leading-5 text-faint">
            This is a static demo. Your application is saved in this browser and appears in the
            recruiter pipeline.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${job.title}?`}
        description="This removes the role and every application attached to it. It cannot be undone in this demo."
        confirmLabel="Delete role"
      />

      <ConfirmDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={confirmWithdraw}
        title="Withdraw this application?"
        description={`Your application to ${job.title} will move to withdrawn. The record stays in your history.`}
        confirmLabel="Withdraw application"
        tone="primary"
      />

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
