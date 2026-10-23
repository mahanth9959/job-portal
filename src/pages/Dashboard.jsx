import {
  ArrowUpRight,
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  Inbox,
  Plus,
  Search,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePortal } from '../context/PortalContext'
import {
  getCounts,
  getMostApplied,
  getMonthlyApplications,
  getNeedsAttention,
  getPipeline,
  getRecentActivities,
  getRecommendedJobs,
  getSavedJobs,
  getTopCompanies,
  getUserApplications,
} from '../data/selectors'
import { formatNumber, formatSalary, formatWeekday, timeAgo } from '../lib/format'
import { MonthlyApplicationsChart, MostAppliedList, PipelinePulse } from '../components/charts/Charts'
import { CompanyMark } from '../components/CompanyMark'
import { Pill } from '../components/StatusPill'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState, PageHeader, Panel, StatStrip } from '../components/ui/Layout'
import { PageFooter } from '../components/ui/PageFooter'

function QuickActions({ user, attentionCount }) {
  const actions =
    user.role === 'recruiter'
      ? [
          {
            label: 'Post a job',
            sub: 'Open a role in two minutes',
            to: '/jobs/new',
            icon: Plus,
          },
          {
            label: 'Add company',
            sub: 'Grow the directory',
            to: '/companies',
            state: { openAdd: true },
            icon: Building2,
          },
          {
            label: 'Applications',
            sub: `${attentionCount} waiting on a reply`,
            to: '/applications',
            icon: Inbox,
          },
          {
            label: 'Open reports',
            sub: 'See the full hiring picture',
            to: '/reports',
            icon: BarChart3,
          },
        ]
      : [
          {
            label: 'Find a role',
            sub: 'Search the open line',
            to: '/jobs',
            icon: Search,
          },
          {
            label: 'Saved jobs',
            sub: 'Pick up where you left off',
            to: '/saved-jobs',
            icon: Bookmark,
          },
          {
            label: 'Your applications',
            sub: 'Check every next step',
            to: '/applications',
            icon: Inbox,
          },
          {
            label: 'Browse companies',
            sub: 'See who is building what',
            to: '/companies',
            icon: Building2,
          },
        ]

  return (
    <div className="quick-grid" aria-label="Quick actions">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link className="action-card" to={action.to} state={action.state} key={action.label}>
            <span className="action-card-icon">
              <Icon aria-hidden="true" />
            </span>
            <span className="action-card-body">
              <span className="action-card-label">{action.label}</span>
              <span className="action-card-sub">{action.sub}</span>
            </span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        )
      })}
    </div>
  )
}

function ActivityList({ activities }) {
  if (!activities.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="The line is quiet"
        text="New applications and stage changes will land here."
      />
    )
  }
  return (
    <div className="list-rows">
      {activities.map((activity) => (
        <Link className="list-row" to={activity.href} key={activity.id}>
          <span className="list-row-main">
            <span className="list-row-title">{activity.title}</span>
            <span className="list-row-sub">{activity.meta}</span>
          </span>
          <span className="list-row-side">
            <span className="sub">{timeAgo(activity.at)}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}

function AttentionList({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nothing is waiting"
        text="Every reply is up to date. Keep the line moving."
      />
    )
  }
  return (
    <div className="list-rows">
      {items.map((item) => (
        <Link className="list-row" to={item.href} key={item.id}>
          <span className="list-row-main">
            <span className="list-row-title">{item.title}</span>
            <span className="list-row-sub">{item.meta}</span>
          </span>
          <span className="link-quiet">
            {item.action}
            <ArrowUpRight aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  )
}

function RecommendedRoles({ jobs }) {
  if (!jobs.length) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No new matches today"
        text="Add a few skills to your profile and we will keep the next role closer."
        action={
          <ButtonLink to="/profile" variant="primary" size="sm">
            Update profile
          </ButtonLink>
        }
      />
    )
  }
  return (
    <div className="recommended-list">
      {jobs.map((job) => (
        <Link className="recommended-row" to={`/jobs/${job.id}`} key={job.id}>
          <span className="recommended-main">
            <CompanyMark company={job.company} size="sm" />
            <span className="min-w-0">
              <span className="job-title">{job.title}</span>
              <span className="job-company">
                {job.company?.name || 'Company'} · {job.location}
              </span>
              <span className="job-meta-line">
                <span className="job-tag">{job.type}</span>
                <span className="job-tag">{job.experience}</span>
              </span>
            </span>
          </span>
          <span className="recommended-side">
            <strong>{formatSalary(job.salaryMin, job.salaryMax)}</strong>
            <span className="sub">{job.match?.label || 'Open role'}</span>
          </span>
          <Pill tone="accent">{job.match?.percent || 0}% match</Pill>
        </Link>
      ))}
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const { data, directoryUpdatedAt, directorySource } = usePortal()
  if (!user || !data) return null
  const isRecruiter = user.role === 'recruiter'
  const counts = getCounts(data, user)
  const scopedApplications = counts.scopedApplications
  const applications = getUserApplications(data, user)
  const pipeline = getPipeline(scopedApplications)
  const attention = getNeedsAttention(data, user, 4)
  const activities = getRecentActivities(data, user, 5)
  const monthly = isRecruiter ? getMonthlyApplications(data.applications, 10) : []
  const mostApplied = getMostApplied(data, 4)
  const topCompanies = getTopCompanies(data, 4)
  const recommended = isRecruiter ? [] : getRecommendedJobs(data, user, 3)
  const savedJobs = getSavedJobs(data, user)
  const nextInterview = applications
    .filter((application) => application.status === 'Interview')
    .sort((a, b) => new Date(b.stageUpdatedAt) - new Date(a.stageUpdatedAt))[0]
  const candidateFinding = nextInterview
    ? `Your ${nextInterview.job?.title || 'application'} interview is with ${nextInterview.company?.name || 'the team'}. A reply is the next move.`
    : savedJobs.length
      ? `${savedJobs.length} saved ${savedJobs.length === 1 ? 'role is' : 'roles are'} still open. Pick one back up when you are ready.`
      : 'Your next move is a role worth a closer look.'

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle={
          isRecruiter
            ? `${formatWeekday(new Date())} · ${attention.length} signals need a look. ${counts.thisWeek} applications arrived this week.`
            : `${formatWeekday(new Date())} · Your search, in clear view. ${counts.interviews} interview ${counts.interviews === 1 ? 'is' : 'are'} in motion.`
        }
        actions={
          isRecruiter ? (
            <>
              <ButtonLink to="/reports" variant="secondary">
                <BarChart3 aria-hidden="true" />
                View reports
              </ButtonLink>
              <ButtonLink to="/jobs/new" variant="primary">
                <Plus aria-hidden="true" />
                Post a job
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/profile" variant="secondary">
                <UserRound aria-hidden="true" />
                Update profile
              </ButtonLink>
              <ButtonLink to="/jobs" variant="primary">
                <Search aria-hidden="true" />
                Find jobs
              </ButtonLink>
            </>
          )
        }
      />

      <div className="stack-24">
        <QuickActions user={user} attentionCount={attention.length} />

        <StatStrip
          items={
            isRecruiter
              ? [
                  {
                    label: 'Total companies',
                    value: formatNumber(counts.companies),
                    caption: `${counts.industries} industries`,
                    to: '/companies',
                  },
                  {
                    label: 'Total jobs',
                    value: formatNumber(counts.jobs),
                    caption: `${counts.closedJobs} closed`,
                    to: '/jobs',
                  },
                  {
                    label: 'Active postings',
                    value: formatNumber(counts.activeJobs),
                    caption: `${counts.closingSoon} close this week`,
                    to: '/jobs?status=Open',
                  },
                  {
                    label: 'Total candidates',
                    value: formatNumber(counts.candidates),
                    caption: 'DummyJSON directory',
                    to: '/candidates',
                  },
                  {
                    label: 'Total applications',
                    value: formatNumber(counts.applications),
                    caption: `${counts.thisWeek} this week`,
                    to: '/applications',
                  },
                  {
                    label: 'Saved jobs',
                    value: formatNumber(counts.savedJobs),
                    caption: 'Bookmarked by you',
                    to: '/jobs',
                  },
                ]
              : [
                  {
                    label: 'Open roles',
                    value: formatNumber(counts.activeJobs),
                    caption: `${counts.companiesHiring} companies hiring`,
                    to: '/jobs',
                  },
                  {
                    label: 'Applications',
                    value: formatNumber(counts.applications),
                    caption: `${counts.thisWeek} sent this week`,
                    to: '/applications',
                  },
                  {
                    label: 'In interview',
                    value: formatNumber(counts.interviews),
                    caption: 'One next conversation',
                    to: '/applications',
                  },
                  {
                    label: 'Saved jobs',
                    value: formatNumber(counts.savedJobs),
                    caption: 'Roles to revisit',
                    to: '/saved-jobs',
                  },
                  {
                    label: 'Companies hiring',
                    value: formatNumber(counts.companiesHiring),
                    caption: 'Directory wide',
                    to: '/companies',
                  },
                  {
                    label: 'Profile strength',
                    value: `${counts.profileStrength}%`,
                    caption: counts.profileStrength === 100
                      ? 'Profile complete'
                      : user.photo
                        ? 'Add the last detail'
                        : 'Add a photo',
                    to: '/profile',
                  },
                ]
          }
        />

        <div className="grid-12">
          <div className="col-8 stack-24">
            <PipelinePulse
              pipeline={pipeline}
              meta={isRecruiter ? `${counts.activeJobs} open roles` : 'Your applications'}
              finding={isRecruiter ? undefined : candidateFinding}
              href="/applications"
              linkLabel={isRecruiter ? 'Review the queue' : 'Open your applications'}
              weekly={counts.thisWeek}
              closingSoon={counts.closingSoon}
              showWaiting={isRecruiter}
            />
            {isRecruiter ? (
              <Panel
                title="Applications"
                subtitle="Live totals from every role and application in the workspace."
                action={
                  <span className="panel-meta">
                    {monthly[monthly.length - 1]?.label} · {monthly[monthly.length - 1]?.value}
                  </span>
                }
              >
                <MonthlyApplicationsChart
                  data={monthly}
                  caption={`${formatNumber(counts.applications)} applications across the last 10 months. The current month is set in raspberry.`}
                />
              </Panel>
            ) : (
              <Panel
                title="Recommended for you"
                subtitle="Open roles that share the most ground with your profile."
                action={
                  <Link className="link-quiet" to="/jobs">
                    All roles <ArrowUpRight aria-hidden="true" />
                  </Link>
                }
              >
                <RecommendedRoles jobs={recommended} />
              </Panel>
            )}
          </div>

          <div className="col-4 stack-24">
            <Panel
              title="Needs attention"
              subtitle={isRecruiter ? 'The decisions waiting on you.' : 'The next steps on your search.'}
              action={<span className="panel-meta">{attention.length}</span>}
            >
              <AttentionList items={attention} />
            </Panel>
            <Panel title="Recent activity" subtitle="The last few moves in the line.">
              <ActivityList activities={activities} />
            </Panel>
          </div>

          {isRecruiter ? (
            <>
              <Panel
                title="Most applied roles"
                subtitle="Where candidate interest is gathering."
                className="col-7"
                action={
                  <Link className="link-quiet" to="/reports">
                    Reports <ArrowUpRight aria-hidden="true" />
                  </Link>
                }
              >
                <MostAppliedList jobs={mostApplied} limit={4} />
              </Panel>
              <Panel
                title="Companies to watch"
                subtitle="The directory, ranked by open roles and interest."
                className="col-5"
                action={
                  <Link className="link-quiet" to="/companies">
                    Directory <ArrowUpRight aria-hidden="true" />
                  </Link>
                }
              >
                {topCompanies.length ? (
                  <div className="list-rows">
                    {topCompanies.map((company) => (
                      <Link className="list-row" to={`/companies/${company.id}`} key={company.id}>
                        <CompanyMark company={company} size="sm" />
                        <span className="list-row-main">
                          <span className="list-row-title">{company.name}</span>
                          <span className="list-row-sub">
                            {company.industry} · {company.location}
                          </span>
                        </span>
                        <span className="list-row-side">
                          <span className="strong">{company.openRoles} open</span>
                          <span className="sub">{company.applications} applicants</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="No companies yet"
                    text="Add a company to start the directory."
                  />
                )}
              </Panel>
            </>
          ) : (
            <Panel
              className="col-12"
              title="Your saved jobs"
              subtitle="A short list to return to when the week slows down."
              action={
                <Link className="link-quiet" to="/saved-jobs">
                  All saved <ArrowUpRight aria-hidden="true" />
                </Link>
              }
            >
              {savedJobs.length ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {savedJobs.slice(0, 3).map((job) => (
                    <Link className="panel" to={`/jobs/${job.id}`} key={job.id}>
                      <span className="flex items-start gap-3">
                        <CompanyMark company={job.company} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-ink">
                            {job.title}
                          </span>
                          <span className="mt-1 block truncate text-xs text-faint">
                            {job.company?.name} · {job.location}
                          </span>
                        </span>
                      </span>
                      <span className="mt-4 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted">{job.type}</span>
                        <span className="link-quiet">
                          View <ArrowUpRight aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="No saved jobs yet"
                  text="Bookmark a role and it will wait here for you."
                  action={
                    <ButtonLink to="/jobs" variant="primary" size="sm">
                      Browse jobs
                    </ButtonLink>
                  }
                />
              )}
            </Panel>
          )}
        </div>
      </div>

      <PageFooter directorySource={directorySource} directoryUpdatedAt={directoryUpdatedAt} />
    </>
  )
}
