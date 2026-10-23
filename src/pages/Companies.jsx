import {
  Building2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  filterCompanies,
  getCompanyIndustries,
  paginate,
} from '../data/selectors'
import { COMPANY_SORT_OPTIONS, PAGE_SIZE } from '../lib/constants'
import { formatDate, formatNumber } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { CompanyFormModal } from '../components/companies/CompanyFormModal'
import { UserAvatar } from '../components/UserAvatar'
import { Button } from '../components/ui/Button'
import {
  EmptyState,
  InlineSelect,
  Menu,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
} from '../components/ui/Layout'
import { ConfirmDialog } from '../components/ui/Modal'
import { PageFooter } from '../components/ui/PageFooter'

export function Companies() {
  const { user } = useAuth()
  const {
    data,
    addCompany,
    updateCompany,
    deleteCompany,
    refreshDirectory,
    refreshing,
    directoryError,
    directorySource,
    directoryUpdatedAt,
  } = usePortal()
  const location = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('all')
  const [sort, setSort] = useState('name-asc')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [companyToDelete, setCompanyToDelete] = useState(null)

  useEffect(() => {
    if (location.state?.openAdd) {
      setEditingCompany(null)
      setFormOpen(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.state, location.pathname, navigate])

  const industries = useMemo(
    () => (data ? getCompanyIndustries(data.companies) : []),
    [data],
  )
  const filtered = useMemo(
    () => (data ? filterCompanies(data.companies, { query, industry, sort }) : []),
    [data, query, industry, sort],
  )
  const paged = paginate(filtered, page, PAGE_SIZE.companies)

  useEffect(() => {
    setPage(1)
  }, [query, industry, sort])

  if (!data) return null

  const clearFilters = () => {
    setQuery('')
    setIndustry('all')
    setSort('name-asc')
  }

  const openAdd = () => {
    setEditingCompany(null)
    setFormOpen(true)
  }

  const openEdit = (company) => {
    setEditingCompany(company)
    setFormOpen(true)
  }

  const saveCompany = (payload) => {
    if (editingCompany) {
      updateCompany(editingCompany.id, payload)
      if (query) setQuery(payload.name)
      setPage(1)
      toast.success(`${payload.name} was updated.`)
    } else {
      addCompany(payload)
      setQuery(payload.name)
      setIndustry('all')
      setSort('name-asc')
      setPage(1)
      toast.success(`${payload.name} was added to the directory.`)
    }
    setFormOpen(false)
    setEditingCompany(null)
  }

  const confirmDelete = () => {
    if (!companyToDelete) return
    const jobs = data.jobs.filter((job) => job.companyId === companyToDelete.id).length
    deleteCompany(companyToDelete.id)
    toast.success(`${companyToDelete.name} and ${jobs} ${jobs === 1 ? 'role were' : 'roles were'} removed.`)
    setCompanyToDelete(null)
    setQuery('')
    setPage(1)
  }

  const refresh = async () => {
    const result = await refreshDirectory()
    if (result.ok) toast.success('Directory refreshed from DummyJSON.')
    else toast.error(result.message)
  }

  const deleteJobCount = companyToDelete
    ? data.jobs.filter((job) => job.companyId === companyToDelete.id).length
    : 0

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle={`${data.companies.length} companies, ${industries.length} industries, one clear directory. The people and roles behind each open line.`}
        actions={
          <>
            <Button variant="secondary" onClick={refresh} loading={refreshing}>
              <RefreshCw aria-hidden="true" />
              Refresh directory
            </Button>
            {user.role === 'recruiter' ? (
              <Button variant="primary" onClick={openAdd}>
                <Plus aria-hidden="true" />
                Add company
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-faint">
        <span className="source-dot" />
        {directorySource === 'offline' ? 'Offline directory' : 'Directory via DummyJSON'}
        {directoryUpdatedAt ? ` · refreshed ${formatDate(directoryUpdatedAt)}` : ''}
        <span className="text-control">·</span>
        Company profiles and roles are sample content for this build.
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
          placeholder="Search company, industry or contact"
          label="Search companies"
        />
        <InlineSelect
          label="Filter by industry"
          value={industry}
          onChange={setIndustry}
          options={[
            { value: 'all', label: 'All industries' },
            ...industries.map((item) => ({ value: item, label: item })),
          ]}
        />
        <InlineSelect
          label="Sort companies"
          value={sort}
          onChange={setSort}
          options={COMPANY_SORT_OPTIONS}
        />
        <div className="toolbar-spacer" />
        <span className="result-count" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'company' : 'companies'}
        </span>
      </div>

      <section className="panel panel-flush">
        {paged.items.length ? (
          <div className="table-wrap">
            <table className="data-table table-companies">
              <thead>
                <tr>
                  <th>Company</th>
                  <th className="hidden lg:table-cell">Industry</th>
                  <th className="hidden xl:table-cell">Location</th>
                  <th className="num hidden sm:table-cell">People</th>
                  <th className="hidden xl:table-cell">Hiring contact</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {paged.items.map((company) => (
                  <tr key={company.id}>
                    <td>
                      <Link className="row-link flex items-center gap-3" to={`/companies/${company.id}`}>
                        <CompanyMark company={company} size="md" />
                        <span className="min-w-0">
                          <span className="cell-title block">{company.name}</span>
                          <span className="cell-sub cell-sub-desktop max-w-[42ch] truncate">
                            {company.description}
                          </span>
                          <span className="cell-sub cell-sub-mobile">
                            {company.industry} · {company.location}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className="pill pill-neutral">{company.industry}</span>
                    </td>
                    <td className="hidden xl:table-cell text-muted">{company.location}</td>
                    <td className="num hidden sm:table-cell">{formatNumber(company.employees)}</td>
                    <td className="hidden xl:table-cell">
                      <span className="flex items-center gap-2">
                        <UserAvatar
                          name={company.contact?.name}
                          src={company.contact?.avatar}
                          size="sm"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-medium text-ink">
                            {company.contact?.name}
                          </span>
                          <span className="block truncate text-[11px] text-faint">
                            {company.contact?.role}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <Menu
                          label={`Actions for ${company.name}`}
                          trigger={
                            <button
                              type="button"
                              className="kebab"
                              aria-label={`Actions for ${company.name}`}
                            >
                              <MoreHorizontal aria-hidden="true" />
                            </button>
                          }
                          items={[
                            {
                              label: 'View company',
                              to: `/companies/${company.id}`,
                              icon: <Building2 />,
                            },
                            user.role === 'recruiter'
                              ? {
                                  label: 'Edit company',
                                  onClick: () => openEdit(company),
                                  icon: <Pencil />,
                                }
                              : null,
                            user.role === 'recruiter'
                              ? {
                                  label: 'Delete company',
                                  onClick: () => setCompanyToDelete(company),
                                  icon: <Trash2 />,
                                  danger: true,
                                }
                              : null,
                          ].filter(Boolean)}
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
              icon={Building2}
              title="No companies match that search"
              text="Try another industry or a shorter search. The directory is small on purpose."
              action={
                <Button variant="secondary" onClick={clearFilters}>
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
            label="companies"
          />
        </div>
      </section>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />

      <CompanyFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCompany(null)
        }}
        company={editingCompany}
        onSave={saveCompany}
      />

      <ConfirmDialog
        open={Boolean(companyToDelete)}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={confirmDelete}
        title={companyToDelete ? `Delete ${companyToDelete.name}?` : 'Delete company?'}
        description={
          companyToDelete
            ? `This removes the company, ${deleteJobCount} ${deleteJobCount === 1 ? 'role' : 'roles'} and their applications. It cannot be undone in this demo.`
            : ''
        }
        confirmLabel="Delete company"
      />
    </>
  )
}
