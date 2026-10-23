import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  getCompanyById,
  getCompanyJobs,
  getSavedJobIds,
} from '../data/selectors'
import { formatNumber } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { CompanyFormModal } from '../components/companies/CompanyFormModal'
import { UserAvatar } from '../components/UserAvatar'
import { JobRow } from '../components/jobs/JobRow'
import { Button, ButtonAnchor, ButtonLink } from '../components/ui/Button'
import { EmptyState, Panel, RailSection } from '../components/ui/Layout'
import { ConfirmDialog } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'

function websiteHref(value = '') {
  if (!value) return ''
  return /^https?:\/\//.test(value) ? value : `https://${value}`
}

export function CompanyDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const {
    data,
    updateCompany,
    deleteCompany,
    toggleSavedJob,
    directorySource,
    directoryUpdatedAt,
  } = usePortal()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const company = data ? getCompanyById(data.companies, id) : null
  const jobs = data && company ? getCompanyJobs(data, company.id) : []
  const openRoles = jobs.filter((job) => job.status === 'Open')
  const savedIds = data ? getSavedJobIds(data, user.id) : []
  const savedSet = new Set(savedIds)
  const applications = data
    ? data.applications.filter((application) =>
        jobs.some((job) => job.id === application.jobId),
      ).length
    : 0
  const people = data
    ? data.candidates.filter((candidate) => candidate.company === company?.name).slice(0, 4)
    : []

  if (!data) return null
  if (!company) {
    return (
      <EmptyState
        icon={Building2}
        title="That company is no longer here"
        text="It may have been deleted or the link may be old. The directory is still open."
        action={
          <ButtonLink to="/companies" variant="primary">
            Back to companies
          </ButtonLink>
        }
      />
    )
  }

  const toggleSave = (job) => {
    const wasSaved = savedSet.has(job.id)
    toggleSavedJob(job.id)
    toast.success(wasSaved ? `Removed ${job.title} from saved jobs.` : `Saved ${job.title}.`)
  }

  const saveCompany = (payload) => {
    updateCompany(company.id, payload)
    toast.success(`${payload.name} was updated.`)
    setEditOpen(false)
  }

  const confirmDelete = () => {
    deleteCompany(company.id)
    toast.success(`${company.name} was removed from the directory.`)
    navigate('/companies', { replace: true })
  }

  return (
    <>
      <header className="page-header">
        <div className="company-hero min-w-0">
          <CompanyMark company={company} size="xl" />
          <div className="company-hero-body">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/companies">Companies</Link>
              <span aria-hidden="true">/</span>
              <span className="current">{company.name}</span>
            </nav>
            <h1>{company.name}</h1>
            <div className="company-hero-meta">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" aria-hidden="true" />
                {company.industry}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {company.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden="true" />
                {formatNumber(company.employees)} people
              </span>
              {company.website ? (
                <a
                  className="inline-flex items-center gap-1.5"
                  href={websiteHref(company.website)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Globe className="size-3.5" aria-hidden="true" />
                  {company.website}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
          <div className="company-hero-actions">
            {user.role === 'recruiter' ? (
              <>
                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                  <Pencil aria-hidden="true" />
                  Edit company
                </Button>
                <ButtonLink
                  to={`/jobs/new?company=${company.id}`}
                  variant="primary"
                >
                  <Plus aria-hidden="true" />
                  Add a role
                </ButtonLink>
              </>
            ) : (
              <ButtonLink to={`/jobs?status=Open`} variant="primary">
                <Briefcase aria-hidden="true" />
                Browse open roles
              </ButtonLink>
            )}
          </div>
        </div>
      </header>

      <div className="grid-12">
        <div className="col-8 stack-24">
          <Panel title={`About ${company.name}`} subtitle={`${openRoles.length} open roles · ${applications} applications in the line.`}>
            <p className="text-sm leading-6 text-muted">{company.description}</p>
            <div className="info-grid mt-6">
              <div className="info-item">
                <div className="info-label">Industry</div>
                <div className="info-value">{company.industry}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Headcount</div>
                <div className="info-value">{formatNumber(company.employees)} people</div>
              </div>
              <div className="info-item">
                <div className="info-label">Founded</div>
                <div className="info-value">{company.founded || '—'}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Website</div>
                <div className="info-value">
                  {company.website ? (
                    <a
                      className="link"
                      href={websiteHref(company.website)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {company.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Open roles"
            subtitle="Every open line at this company."
            action={
              openRoles.length ? (
                <Link className="link-quiet" to={`/jobs?status=Open`}>
                  All roles <ArrowUpRight aria-hidden="true" />
                </Link>
              ) : null
            }
          >
            {openRoles.length ? (
              <div className="job-list">
                {openRoles.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    saved={savedSet.has(job.id)}
                    onToggleSave={toggleSave}
                    compact
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No open roles right now"
                text={
                  user.role === 'recruiter'
                    ? 'Add a role to start the line at this company.'
                    : 'This company is not hiring at the moment. Save it for later or browse the rest of the directory.'
                }
                action={
                  user.role === 'recruiter' ? (
                    <ButtonLink to={`/jobs/new?company=${company.id}`} variant="primary" size="sm">
                      Add a role
                    </ButtonLink>
                  ) : (
                    <ButtonLink to="/jobs" variant="primary" size="sm">
                      Browse jobs
                    </ButtonLink>
                  )
                }
              />
            )}
          </Panel>

          {user.role === 'recruiter' && people.length ? (
            <Panel
              title="People in the directory"
              subtitle={`${people.length} candidate profiles list ${company.name} as their current company.`}
              action={
                <Link className="link-quiet" to="/candidates">
                  Candidates <ArrowUpRight aria-hidden="true" />
                </Link>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {people.map((person) => (
                  <div className="flex items-center gap-3" key={person.id}>
                    <UserAvatar name={person.name} src={person.avatar} size="md" />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-ink">
                        {person.name}
                      </div>
                      <div className="truncate text-[11.5px] text-faint">
                        {person.title} · {person.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>

        <aside className="col-4 stack-24 rail-stack">
          <RailSection title="Company snapshot">
            <div className="snapshot">
              <div className="snapshot-row">
                <span className="snapshot-label">Industry</span>
                <span className="snapshot-value">{company.industry}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Location</span>
                <span className="snapshot-value">{company.location}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Headcount</span>
                <span className="snapshot-value">{formatNumber(company.employees)}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Open roles</span>
                <span className="snapshot-value">{openRoles.length}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Applications</span>
                <span className="snapshot-value">{applications}</span>
              </div>
              <div className="snapshot-row">
                <span className="snapshot-label">Source</span>
                <span className="snapshot-value">
                  {company.source === 'local' ? 'Added here' : 'DummyJSON directory'}
                </span>
              </div>
            </div>
          </RailSection>

          <RailSection title="Hiring contact" subtitle="The person behind the line.">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={company.contact?.name}
                src={company.contact?.avatar}
                size="lg"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{company.contact?.name}</div>
                <div className="mt-0.5 text-xs text-faint">{company.contact?.role}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs">
              {company.email ? (
                <a className="flex items-center gap-2 text-muted hover:text-ink" href={`mailto:${company.email}`}>
                  <Mail className="size-3.5 text-faint" aria-hidden="true" />
                  {company.email}
                </a>
              ) : null}
              {company.phone ? (
                <a className="flex items-center gap-2 text-muted hover:text-ink" href={`tel:${company.phone}`}>
                  <Phone className="size-3.5 text-faint" aria-hidden="true" />
                  {company.phone}
                </a>
              ) : null}
            </div>
            {company.contact?.email ? (
              <ButtonAnchor
                href={`mailto:${company.contact.email}?subject=${encodeURIComponent(
                  `A question about ${company.name}`,
                )}`}
                variant="secondary"
                block
                size="sm"
                className="mt-4"
              >
                <Mail aria-hidden="true" />
                Write to the team
              </ButtonAnchor>
            ) : null}
          </RailSection>

          {user.role === 'recruiter' ? (
            <div className="flex gap-2">
              <ButtonLink to={`/jobs/new?company=${company.id}`} variant="secondary" block size="sm">
                <Plus aria-hidden="true" />
                Add role
              </ButtonLink>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />

      <CompanyFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company}
        onSave={saveCompany}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${company.name}?`}
        description={`This removes the company, ${jobs.length} ${jobs.length === 1 ? 'role' : 'roles'} and their applications. It cannot be undone in this demo.`}
        confirmLabel="Delete company"
      />
    </>
  )
}
