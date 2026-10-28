import { ArrowUpRight, BarChart3, Printer } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import { getCounts, getMonthlyApplications, getReports } from '../data/selectors'
import { formatNumber } from '../lib/format'
import { CompanyMark } from '../components/CompanyMark'
import { MonthlyApplicationsChart, MostAppliedList, StageMix } from '../components/charts/Charts'
import { Button } from '../components/ui/Button'
import { EmptyState, PageHeader, Panel, StatStrip } from '../components/ui/Layout'
import { PageFooter } from '../components/ui/PageFooter'

export function Reports() {
  const { user } = useAuth()
  const { data, directorySource, directoryUpdatedAt } = usePortal()
  const [months, setMonths] = useState(12)

  if (!data) return null
  const reports = getReports(data)
  const counts = getCounts(data, user)
  const monthly = getMonthlyApplications(data.applications, months)
  const monthlyTotal = monthly.reduce((sum, item) => sum + item.value, 0)
  const offerRate = reports.activeApplications
    ? Math.round((reports.outcomes.Offer / reports.activeApplications) * 100)
    : 0

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="A monthly read on the line: where applications gather, where roles slow down and what is waiting on a decision."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              aria-label="Print this report"
            >
              <Printer aria-hidden="true" />
              Print report
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                document.getElementById('monthly-report')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <BarChart3 aria-hidden="true" />
              Monthly view
            </Button>
          </>
        }
      />

      <div className="stack-24">
        <StatStrip
          items={[
            {
              label: 'Total jobs',
              value: formatNumber(counts.jobs),
              caption: `${counts.closedJobs} closed roles`,
              to: '/jobs',
            },
            {
              label: 'Companies',
              value: formatNumber(counts.companies),
              caption: `${counts.industries} industries`,
              to: '/companies',
            },
            {
              label: 'Candidates',
              value: formatNumber(counts.candidates),
              caption: 'DummyJSON directory',
              to: '/candidates',
            },
            {
              label: 'Applications',
              value: formatNumber(reports.totalApplications),
              caption: `${reports.activeApplications} live in the line`,
              to: '/applications',
            },
            {
              label: 'Active jobs',
              value: formatNumber(counts.activeJobs),
              caption: `${counts.closingSoon} closing within 7 days`,
              to: '/jobs?status=Open',
            },
            {
              label: 'Offers',
              value: formatNumber(reports.outcomes.Offer || 0),
              caption: `${offerRate}% of live applications`,
            },
          ]}
        />

        <div className="grid-12">
          <Panel
            className="col-8"
            id="monthly-report"
            title="Applications by month"
            subtitle="Every application in the workspace, grouped by the month it landed."
            action={
              <div className="segmented" role="group" aria-label="Report period">
                {[6, 12].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={months === value}
                    onClick={() => setMonths(value)}
                  >
                    {value} months
                  </button>
                ))}
              </div>
            }
          >
            <MonthlyApplicationsChart
              data={monthly}
              caption={`${formatNumber(monthlyTotal)} applications shown in this window. The current month is set in raspberry; the open month is part of the count.`}
            />
          </Panel>

          <Panel
            className="col-4"
            title="Live pipeline mix"
            subtitle="The four stages where a candidate can still move."
            action={<span className="panel-meta">{formatNumber(reports.activeApplications)} live</span>}
          >
            <StageMix mix={reports.stageMix} total={reports.activeApplications} />
            <div className="mt-4 border-t border-rule pt-4">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-muted">Offer rate</span>
                <strong className="text-[15px] font-semibold text-ink">{offerRate}%</strong>
              </div>
              <div className="match-track mt-2">
                <span style={{ width: `${offerRate}%` }} />
              </div>
              <p className="mt-2 text-[11px] leading-5 text-faint">
                {reports.outcomes.Offer || 0} offers from {reports.activeApplications} live
                applications.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4 text-center">
              <div>
                <div className="text-lg font-medium text-ink">
                  {reports.outcomes.Rejected || 0}
                </div>
                <div className="mt-1 text-[11px] text-faint">Rejected</div>
              </div>
              <div>
                <div className="text-lg font-medium text-ink">
                  {reports.outcomes.Withdrawn || 0}
                </div>
                <div className="mt-1 text-[11px] text-faint">Withdrawn</div>
              </div>
              <div>
                <div className="text-lg font-medium text-ink">
                  {reports.outcomes.Offer || 0}
                </div>
                <div className="mt-1 text-[11px] text-faint">Offers</div>
              </div>
            </div>
          </Panel>

          <Panel
            className="col-7"
            title="Most applied roles"
            subtitle="The roles drawing the most candidate attention."
            action={
              <Link className="link-quiet" to="/jobs">
                All roles <ArrowUpRight aria-hidden="true" />
              </Link>
            }
          >
            <MostAppliedList jobs={reports.mostApplied} limit={5} />
          </Panel>

          <Panel
            className="col-5"
            title="Companies with the most interest"
            subtitle="Where applications are landing across the directory."
            action={
              <Link className="link-quiet" to="/companies">
                Directory <ArrowUpRight aria-hidden="true" />
              </Link>
            }
          >
            {reports.topCompanies.length ? (
              <div className="list-rows">
                {reports.topCompanies.map((company) => (
                  <Link className="list-row" to={`/companies/${company.id}`} key={company.id}>
                    <CompanyMark company={company} size="sm" />
                    <span className="list-row-main">
                      <span className="list-row-title">{company.name}</span>
                      <span className="list-row-sub">
                        {company.industry} · {company.location}
                      </span>
                    </span>
                    <span className="list-row-side">
                      <span className="strong">{company.applications}</span>
                      <span className="sub">{company.openRoles} open</span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No applications yet"
                text="As applications arrive, company interest will rank here."
              />
            )}
          </Panel>
        </div>
      </div>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
