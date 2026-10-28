import { Briefcase, Mail, MapPin, RefreshCw, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePortal } from '../context/PortalContext'
import {
  filterCandidates,
  getUniqueValues,
  paginate,
} from '../data/selectors'
import { PAGE_SIZE } from '../lib/constants'
import { formatDate } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { UserAvatar } from '../components/UserAvatar'
import { Button, ButtonAnchor } from '../components/ui/Button'
import {
  EmptyState,
  InlineSelect,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
} from '../components/ui/Layout'
import { Sheet } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'

const sortOptions = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'experience', label: 'Most experience' },
  { value: 'company', label: 'Company A–Z' },
]

export function Candidates() {
  const {
    data,
    directoryError,
    refreshDirectory,
    refreshing,
    directorySource,
    directoryUpdatedAt,
  } = usePortal()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const departments = useMemo(
    () => (data ? getUniqueValues(data.candidates, 'department') : []),
    [data],
  )
  const filtered = useMemo(
    () =>
      data
        ? filterCandidates(data.candidates, { query, department, sort })
        : [],
    [data, query, department, sort],
  )
  const paged = paginate(filtered, page, PAGE_SIZE.candidates)

  if (!data) return null

  const refresh = async () => {
    const result = await refreshDirectory()
    if (result.ok) toast.success('Candidate directory refreshed.')
    else toast.error(result.message)
  }

  const selectedCompany = selected
    ? data.companies.find((company) => company.name === selected.company)
    : null

  return (
    <>
      <PageHeader
        title="Candidates"
        subtitle={`${data.candidates.length} people in the DummyJSON directory. Search by craft, place or current team.`}
        actions={
          <Button variant="secondary" onClick={refresh} loading={refreshing}>
            <RefreshCw aria-hidden="true" />
            Refresh directory
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-faint">
        <span className="source-dot" />
        {directorySource === 'offline' ? 'Offline directory' : 'People via DummyJSON'}
        {directoryUpdatedAt ? ` · refreshed ${formatDate(directoryUpdatedAt)}` : ''}
        <span>·</span>
        Profiles are demo data, not real candidates.
      </div>

      {directoryError ? (
        <Notice
          className="mb-4"
          tone="warning"
          icon={RefreshCw}
          action={
            <Button size="sm" variant="secondary" onClick={refresh} loading={refreshing}>
              Try again
            </Button>
          }
        >
          <strong>Live directory unavailable.</strong> {directoryError}
        </Notice>
      ) : null}

      <div className="toolbar">
        <SearchInput
          className="filter-search"
          value={query}
          onChange={setQuery}
          placeholder="Search name, role, skill or city"
          label="Search candidates"
        />
        <InlineSelect
          label="Filter by department"
          value={department}
          onChange={setDepartment}
          options={[
            { value: 'all', label: 'All departments' },
            ...departments.map((item) => ({ value: item, label: item })),
          ]}
        />
        <InlineSelect
          label="Sort candidates"
          value={sort}
          onChange={setSort}
          options={sortOptions}
        />
        <div className="toolbar-spacer" />
        <span className="result-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      <section className="panel panel-flush">
        {paged.items.length ? (
          <div className="table-wrap">
            <table className="data-table table-candidates">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th className="hidden lg:table-cell">Current role</th>
                  <th className="hidden xl:table-cell">Department</th>
                  <th className="hidden xl:table-cell">Location</th>
                  <th className="num hidden sm:table-cell">Years</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {paged.items.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>
                      <button
                        type="button"
                        className="row-link flex items-center gap-3 text-left"
                        onClick={() => setSelected(candidate)}
                      >
                        <UserAvatar name={candidate.name} src={candidate.avatar} size="md" />
                        <span className="min-w-0">
                          <span className="cell-title block">{candidate.name}</span>
                          <span className="cell-sub cell-sub-email block max-w-[44ch] truncate">
                            {candidate.email}
                          </span>
                          <span className="cell-sub cell-sub-mobile">
                            {candidate.title} · {candidate.location}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="block text-[12.5px] font-medium text-ink">
                        {candidate.title}
                      </span>
                      <span className="cell-sub">{candidate.company}</span>
                    </td>
                    <td className="hidden xl:table-cell">
                      <span className="pill pill-neutral">{candidate.department}</span>
                    </td>
                    <td className="hidden xl:table-cell text-muted">{candidate.location}</td>
                    <td className="num hidden sm:table-cell">{candidate.experience}</td>
                    <td>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(candidate)}>
                          View profile
                        </Button>
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
              icon={Users}
              title="No candidates match that search"
              text="Try a different craft, city or a shorter phrase."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setDepartment('all')
                  }}
                >
                  Clear filters
                </Button>
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
            label="candidates"
          />
        </div>
      </section>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Candidate profile"
        width="lg"
      >
        {selected ? (
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <UserAvatar name={selected.name} src={selected.avatar} size="xl" />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">
                  {selected.name}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {selected.title} at {selected.company}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {selected.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="size-3.5" aria-hidden="true" />
                    {selected.experience} years
                  </span>
                  <span className="pill pill-positive">{selected.availability}</span>
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-muted">{selected.summary}</p>

            <div>
              <h3 className="text-sm font-semibold text-ink">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.skills.map((skill) => (
                  <span className="skill-chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[6px] bg-raised p-4">
                <div className="text-[11px] text-faint">Experience</div>
                <div className="mt-1 text-sm font-medium text-ink">
                  {selected.experience} years · {selected.department}
                </div>
              </div>
              <div className="rounded-[6px] bg-raised p-4">
                <div className="text-[11px] text-faint">Education</div>
                <div className="mt-1 text-sm font-medium text-ink">{selected.education}</div>
              </div>
            </div>

            <div className="grid gap-2 text-sm">
              <a className="flex items-center gap-2 text-muted hover:text-ink" href={`mailto:${selected.email}`}>
                <Mail className="size-4 text-faint" aria-hidden="true" />
                {selected.email}
              </a>
              {selectedCompany ? (
                <Link
                  className="flex items-center gap-2 text-muted hover:text-ink"
                  to={`/companies/${selectedCompany.id}`}
                  onClick={() => setSelected(null)}
                >
                  <CompanyMark company={selectedCompany} size="sm" />
                  {selected.company}
                </Link>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-rule pt-5">
              <ButtonAnchor
                href={`mailto:${selected.email}?subject=${encodeURIComponent(
                  'A role worth a conversation',
                )}&body=${encodeURIComponent(
                  `Hi ${selected.name.split(' ')[0]},\n\nI came across your profile in the Hireline directory and would love to tell you about a role on our team.\n\nWould you be open to a short conversation this week?\n\nBest,\n`,
                )}`}
                variant="primary"
              >
                <Mail aria-hidden="true" />
                Invite to apply
              </ButtonAnchor>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>

            <p className="text-[11px] leading-5 text-faint">
              This opens your email client with a written note. The demo does not send messages
              itself.
            </p>
          </div>
        ) : null}
      </Sheet>
    </>
  )
}
