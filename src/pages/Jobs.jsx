import { Bookmark, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  filterJobs,
  getJobLocations,
  getSavedJobIds,
  paginate,
} from '../data/selectors'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_SORT_OPTIONS,
  PAGE_SIZE,
  SALARY_BANDS,
} from '../lib/constants'
import { Button, ButtonLink } from '../components/ui/Button'
import { SelectField } from '../components/ui/Fields'
import {
  EmptyState,
  InlineSelect,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
  Tabs,
} from '../components/ui/Layout'
import { ConfirmDialog, Sheet } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'
import { JobRow } from '../components/jobs/JobRow'

const statusTabs = [
  { value: 'all', label: 'All roles' },
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
]

export function Jobs() {
  const { user } = useAuth()
  const { data, directoryError, refreshDirectory, deleteJob, toggleSavedJob, directorySource, directoryUpdatedAt } =
    usePortal()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('all')
  const [type, setType] = useState('all')
  const [experience, setExperience] = useState('all')
  const [salary, setSalary] = useState('any')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState(null)

  const statusParam = searchParams.get('status')
  const status = ['Open', 'Closed'].includes(statusParam) ? statusParam : 'all'

  const jobs = useMemo(() => {
    if (!data) return []
    const applicantCounts = data.applications.reduce((map, application) => {
      map.set(application.jobId, (map.get(application.jobId) || 0) + 1)
      return map
    }, new Map())
    return data.jobs
      .map((job) => ({
        ...job,
        company: data.companies.find((company) => company.id === job.companyId),
        applicantCount: applicantCounts.get(job.id) || 0,
      }))
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
  }, [data])

  const savedIds = useMemo(
    () => (data ? getSavedJobIds(data, user.id) : []),
    [data, user.id],
  )

  const locations = useMemo(() => getJobLocations(jobs), [jobs])
  const counts = useMemo(
    () => ({
      all: jobs.length,
      Open: jobs.filter((job) => job.status === 'Open').length,
      Closed: jobs.filter((job) => job.status === 'Closed').length,
    }),
    [jobs],
  )

  const filtered = useMemo(
    () =>
      filterJobs(jobs, {
        query,
        location,
        type,
        experience,
        salary,
        status,
        sort,
      }),
    [jobs, query, location, type, experience, salary, status, sort],
  )

  const paged = paginate(filtered, page, PAGE_SIZE.jobs)
  const savedSet = useMemo(() => new Set(savedIds), [savedIds])

  useEffect(() => {
    setPage(1)
  }, [query, location, type, experience, salary, status, sort])

  useEffect(() => {
    if (page > paged.pages) setPage(paged.pages)
  }, [page, paged.pages])

  const setStatus = (next) => {
    setSearchParams(next === 'all' ? {} : { status: next }, { replace: true })
    setPage(1)
  }

  const clearFilters = () => {
    setQuery('')
    setLocation('all')
    setType('all')
    setExperience('all')
    setSalary('any')
    setSort('latest')
    setSearchParams({}, { replace: true })
  }

  const onToggleSave = (job) => {
    const wasSaved = savedSet.has(job.id)
    toggleSavedJob(job.id)
    toast.success(wasSaved ? `Removed ${job.title} from saved jobs.` : `Saved ${job.title}.`)
  }

  const confirmDelete = () => {
    if (!jobToDelete) return
    deleteJob(jobToDelete.id)
    toast.success(`${jobToDelete.title} and its applications were deleted.`)
    setJobToDelete(null)
    setPage(1)
  }

  const filterControls = (
    <>
      <InlineSelect
        label="Filter by location"
        value={location}
        onChange={setLocation}
        options={[
          { value: 'all', label: 'All locations' },
          ...locations.map((item) => ({ value: item, label: item })),
        ]}
        className="filter-desktop"
      />
      <InlineSelect
        label="Filter by job type"
        value={type}
        onChange={setType}
        options={[
          { value: 'all', label: 'All job types' },
          ...EMPLOYMENT_TYPES.map((item) => ({ value: item, label: item })),
        ]}
        className="filter-desktop"
      />
      <InlineSelect
        label="Filter by experience"
        value={experience}
        onChange={setExperience}
        options={[
          { value: 'all', label: 'All experience' },
          ...EXPERIENCE_LEVELS.map((item) => ({ value: item, label: item })),
        ]}
        className="filter-desktop"
      />
      <InlineSelect
        label="Filter by salary"
        value={salary}
        onChange={setSalary}
        options={SALARY_BANDS.map((item) => ({ value: item.value, label: item.label }))}
        className="filter-desktop"
      />
    </>
  )

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle={`${counts.Open} open roles across ${new Set(jobs.filter((job) => job.status === 'Open').map((job) => job.companyId)).size} companies. Search by the work, not the noise.`}
        actions={
          user.role === 'recruiter' ? (
            <>
              <ButtonLink to="/reports" variant="secondary">
                Hiring report
              </ButtonLink>
              <ButtonLink to="/jobs/new" variant="primary">
                Post a job
              </ButtonLink>
            </>
          ) : (
            <ButtonLink to="/saved-jobs" variant="secondary">
              <Bookmark aria-hidden="true" />
              Saved jobs
            </ButtonLink>
          )
        }
      />

      {directoryError ? (
        <Notice
          className="mb-4"
          tone="warning"
          icon={RefreshCw}
          action={
            <Button size="sm" variant="secondary" onClick={() => refreshDirectory()}>
              Try again
            </Button>
          }
        >
          <strong>Directory is running offline.</strong> Roles and applications still work.
        </Notice>
      ) : null}

      <Tabs
        tabs={statusTabs.map((tab) => ({
          ...tab,
          count: counts[tab.value],
        }))}
        value={status}
        onChange={setStatus}
        ariaLabel="Job status"
      />

      <div className="toolbar">
        <SearchInput
          className="filter-search"
          value={query}
          onChange={setQuery}
          placeholder="Search role, company or skill"
          label="Search jobs"
        />
        {filterControls}
        <Button
          variant="secondary"
          className="filter-mobile"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters
        </Button>
        <div className="toolbar-spacer" />
        <span className="result-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
        </span>
        <InlineSelect
          label="Sort roles"
          value={sort}
          onChange={setSort}
          options={JOB_SORT_OPTIONS}
        />
      </div>

      <section className="panel px-5 py-2">
        <div className="job-list-head" aria-hidden="true">
          <span>Role</span>
          <span>Salary</span>
          <span>Status</span>
          <span />
        </div>
        {paged.items.length ? (
          <div className="job-list">
            {paged.items.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                saved={savedSet.has(job.id)}
                onToggleSave={onToggleSave}
                manage={user.role === 'recruiter'}
                onEdit={(item) => navigate(`/jobs/${item.id}/edit`)}
                onDelete={setJobToDelete}
                showApplicants={user.role === 'recruiter'}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SlidersHorizontal}
            title="No roles match those filters"
            text="Try a wider location or a different salary band. The right role is usually one filter away."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
        <Pagination
          page={paged.page}
          pages={paged.pages}
          from={paged.from}
          to={paged.to}
          total={paged.total}
          onPageChange={setPage}
          label="roles"
        />
      </section>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter roles"
        footer={
          <Button variant="primary" block onClick={() => setFiltersOpen(false)}>
            Show {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
          </Button>
        }
      >
        <div className="filter-sheet-grid">
          <SelectField
            label="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            options={[
              { value: 'all', label: 'All locations' },
              ...locations.map((item) => ({ value: item, label: item })),
            ]}
          />
          <SelectField
            label="Job type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            options={[
              { value: 'all', label: 'All job types' },
              ...EMPLOYMENT_TYPES.map((item) => ({ value: item, label: item })),
            ]}
          />
          <SelectField
            label="Experience"
            value={experience}
            onChange={(event) => setExperience(event.target.value)}
            options={[
              { value: 'all', label: 'All experience levels' },
              ...EXPERIENCE_LEVELS.map((item) => ({ value: item, label: item })),
            ]}
          />
          <SelectField
            label="Salary"
            value={salary}
            onChange={(event) => setSalary(event.target.value)}
            options={SALARY_BANDS.map((item) => ({ value: item.value, label: item.label }))}
          />
          <SelectField
            label="Sort by"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            options={JOB_SORT_OPTIONS}
          />
        </div>
      </Sheet>

      <ConfirmDialog
        open={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        onConfirm={confirmDelete}
        title={jobToDelete ? `Delete ${jobToDelete.title}?` : 'Delete role?'}
        description="This removes the role and every application attached to it. It cannot be undone in this demo."
        confirmLabel="Delete role"
      />

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
