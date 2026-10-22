import {
  ACTIVE_STAGES,
  CLOSED_STAGES,
  SALARY_BANDS,
  STAGES,
} from '../lib/constants'
import {
  daysSince,
  daysUntil,
  formatMonth,
  normalize,
  parseDate,
  profileStrength,
  toMillis,
} from '../lib/format'

export function getCompanyById(companies, id) {
  return companies.find((company) => company.id === id) || null
}

export function getJobById(jobs, id) {
  return jobs.find((job) => job.id === id) || null
}

export function getJobWithCompany(jobs, companies, id) {
  const job = getJobById(jobs, id)
  if (!job) return null
  return { ...job, company: getCompanyById(companies, job.companyId) }
}

export function jobsWithCompanies(jobs, companies) {
  return jobs.map((job) => ({
    ...job,
    company: getCompanyById(companies, job.companyId),
  }))
}

export function applicationsWithJobs(applications, jobs, companies) {
  return applications.map((application) => {
    const job = getJobById(jobs, application.jobId)
    return {
      ...application,
      job,
      company: job ? getCompanyById(companies, job.companyId) : null,
    }
  })
}

export function getSavedJobIds(data, userId) {
  return data.savedJobs?.[userId] || []
}

export function getSavedJobs(data, user) {
  const ids = new Set(getSavedJobIds(data, user?.id))
  return jobsWithCompanies(data.jobs, data.companies).filter((job) => ids.has(job.id))
}

export function getUserApplications(data, user) {
  if (!user) return []
  if (user.role === 'candidate') {
    return applicationsWithJobs(
      data.applications.filter((application) => application.candidateId === user.id),
      data.jobs,
      data.companies,
    )
  }
  return applicationsWithJobs(data.applications, data.jobs, data.companies)
}

export function getApplicationForCandidate(data, userId, jobId) {
  return data.applications.find(
    (application) => application.candidateId === userId && application.jobId === jobId,
  )
}

export function getJobApplications(data, jobId) {
  return applicationsWithJobs(
    data.applications.filter((application) => application.jobId === jobId),
    data.jobs,
    data.companies,
  ).sort((a, b) => toMillis(b.appliedAt) - toMillis(a.appliedAt))
}

export function getCompanyJobs(data, companyId) {
  return jobsWithCompanies(
    data.jobs.filter((job) => job.companyId === companyId),
    data.companies,
  ).sort((a, b) => toMillis(b.postedAt) - toMillis(a.postedAt))
}

export function getCounts(data, user) {
  const scopedApplications =
    user?.role === 'candidate'
      ? data.applications.filter((application) => application.candidateId === user.id)
      : data.applications
  const openJobs = data.jobs.filter((job) => job.status === 'Open')
  const savedIds = user ? getSavedJobIds(data, user.id) : []
  const thisWeek = scopedApplications.filter(
    (application) => daysSince(application.appliedAt) <= 7,
  ).length
  const closingSoon = openJobs.filter((job) => {
    const days = daysUntil(job.deadline)
    return days >= 0 && days <= 7
  }).length
  const companiesHiring = new Set(openJobs.map((job) => job.companyId)).size
  const industries = new Set(data.companies.map((company) => company.industry)).size
  const newCompanies = data.companies.filter(
    (company) => daysSince(company.createdAt) <= 30,
  ).length

  return {
    companies: data.companies.length,
    jobs: data.jobs.length,
    activeJobs: openJobs.length,
    closedJobs: data.jobs.length - openJobs.length,
    candidates: data.candidates.length,
    applications: scopedApplications.length,
    allApplications: data.applications.length,
    savedJobs: savedIds.length,
    thisWeek,
    closingSoon,
    companiesHiring,
    industries,
    newCompanies,
    interviews: scopedApplications.filter((application) => application.status === 'Interview')
      .length,
    offers: scopedApplications.filter((application) => application.status === 'Offer').length,
    profileStrength: user ? profileStrength(user) : 0,
    scopedApplications,
  }
}

export function getPipeline(applications) {
  const stageCounts = Object.fromEntries(STAGES.map((stage) => [stage, 0]))
  applications.forEach((application) => {
    if (stageCounts[application.status] != null) stageCounts[application.status] += 1
  })
  const activeCounts = ACTIVE_STAGES.map((stage) => ({
    stage,
    count: stageCounts[stage] || 0,
  }))
  const inPlay = activeCounts.reduce((sum, stage) => sum + stage.count, 0)
  const closed = CLOSED_STAGES.reduce((sum, stage) => sum + (stageCounts[stage] || 0), 0)
  const staleInterviews = applications.filter(
    (application) =>
      application.status === 'Interview' && daysSince(application.stageUpdatedAt) >= 4,
  )
  const maxStage = Math.max(1, ...activeCounts.map((stage) => stage.count))

  return {
    stageCounts,
    activeCounts,
    inPlay,
    closed,
    staleInterviews,
    maxStage,
    finding:
      staleInterviews.length > 0
        ? `${staleInterviews.length} interview ${staleInterviews.length === 1 ? 'reply has' : 'replies have'} waited more than 4 days.`
        : 'Every interview reply is up to date.',
  }
}

export function getStageMix(applications) {
  const active = applications.filter((application) =>
    ACTIVE_STAGES.includes(application.status),
  )
  const total = active.length || 1
  return ACTIVE_STAGES.map((stage) => {
    const count = active.filter((application) => application.status === stage).length
    return {
      stage,
      count,
      share: Math.round((count / total) * 100),
    }
  })
}

export function getMonthlyApplications(applications, count = 10) {
  const now = new Date()
  const months = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    months.push({
      key,
      label: formatMonth(date),
      full: `${formatMonth(date, { month: 'long' })} ${date.getFullYear()}`,
      value: 0,
      current: i === 0,
    })
  }
  const byKey = new Map(months.map((month) => [month.key, month]))
  applications.forEach((application) => {
    const date = parseDate(application.appliedAt)
    if (!date) return
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const month = byKey.get(key)
    if (month) month.value += 1
  })
  return months
}

export function getMostApplied(data, limit = 5) {
  const counts = new Map()
  data.applications.forEach((application) => {
    counts.set(application.jobId, (counts.get(application.jobId) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([jobId, count]) => {
      const job = getJobWithCompany(data.jobs, data.companies, jobId)
      return job ? { ...job, applicationCount: count } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.applicationCount - a.applicationCount || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function getTopCompanies(data, limit = 6) {
  const openJobCounts = new Map()
  data.jobs.forEach((job) => {
    if (job.status === 'Open') {
      openJobCounts.set(job.companyId, (openJobCounts.get(job.companyId) || 0) + 1)
    }
  })
  const applicationCounts = new Map()
  data.applications.forEach((application) => {
    const job = getJobById(data.jobs, application.jobId)
    if (job) {
      applicationCounts.set(job.companyId, (applicationCounts.get(job.companyId) || 0) + 1)
    }
  })
  return data.companies
    .map((company) => ({
      ...company,
      openRoles: openJobCounts.get(company.id) || 0,
      applications: applicationCounts.get(company.id) || 0,
    }))
    .sort(
      (a, b) =>
        b.applications - a.applications ||
        b.openRoles - a.openRoles ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit)
}

export function getRecentActivities(data, user, limit = 5) {
  if (!user) return []
  const scopedApplications =
    user.role === 'candidate'
      ? data.applications.filter((application) => application.candidateId === user.id)
      : data.applications
  const details = applicationsWithJobs(scopedApplications, data.jobs, data.companies)
  const events = []

  details
    .slice()
    .sort((a, b) => toMillis(b.appliedAt) - toMillis(a.appliedAt))
    .slice(0, 5)
    .forEach((application) => {
      if (!application.job) return
      events.push({
        id: `applied-${application.id}`,
        type: 'application',
        title:
          user.role === 'candidate'
            ? `You applied to ${application.job.title}`
            : `${application.candidateName} applied to ${application.job.title}`,
        meta: application.company?.name || 'Hireline',
        at: application.appliedAt,
        href:
          user.role === 'candidate'
            ? `/applications?application=${application.id}`
            : `/applications?application=${application.id}`,
      })
    })

  details
    .filter(
      (application) =>
        application.status !== 'Applied' &&
        (application.status === 'Interview' ||
          application.status === 'Offer' ||
          application.status === 'Rejected'),
    )
    .sort((a, b) => toMillis(b.stageUpdatedAt) - toMillis(a.stageUpdatedAt))
    .slice(0, 3)
    .forEach((application) => {
      if (!application.job) return
      events.push({
        id: `stage-${application.id}-${application.status}`,
        type: 'stage',
        title:
          user.role === 'candidate'
            ? `Your application moved to ${application.status}`
            : `${application.candidateName} moved to ${application.status}`,
        meta: `${application.job.title} · ${application.company?.name || 'Hireline'}`,
        at: application.stageUpdatedAt,
        href: `/applications?application=${application.id}`,
      })
    })

  if (user.role === 'recruiter') {
    jobsWithCompanies(data.jobs, data.companies)
      .slice()
      .sort((a, b) => toMillis(b.postedAt) - toMillis(a.postedAt))
      .slice(0, 3)
      .forEach((job) => {
        events.push({
          id: `posted-${job.id}`,
          type: 'job',
          title: `${job.company?.name || 'A company'} posted ${job.title}`,
          meta: `${job.location} · ${job.type}`,
          at: job.postedAt,
          href: `/jobs/${job.id}`,
        })
      })
  }

  return events
    .filter((event) => event.at)
    .sort((a, b) => toMillis(b.at) - toMillis(a.at))
    .slice(0, limit)
}

export function getNeedsAttention(data, user, limit = 4) {
  if (!user) return []
  if (user.role === 'candidate') {
    const own = applicationsWithJobs(
      data.applications.filter((application) => application.candidateId === user.id),
      data.jobs,
      data.companies,
    )
    const offers = own
      .filter((application) => application.status === 'Offer')
      .map((application) => ({
        id: `offer-${application.id}`,
        type: 'offer',
        title: 'Your offer is ready for a reply',
        meta: `${application.job?.title || 'Role'} · ${application.company?.name || 'Company'}`,
        href: `/applications?application=${application.id}`,
        action: 'Open',
      }))
    const waiting = own
      .filter(
        (application) =>
          ['Screening', 'Interview'].includes(application.status) &&
          daysSince(application.stageUpdatedAt) >= 3,
      )
      .map((application) => ({
        id: `waiting-${application.id}`,
        type: 'application',
        title: 'Your application needs a reply',
        meta: `${application.job?.title || 'Role'} · ${daysSince(application.stageUpdatedAt)} days since the last update`,
        href: `/applications?application=${application.id}`,
        action: 'View',
      }))
    const strength = profileStrength(user)
    const profileNudge =
      strength < 100
        ? [
            {
              id: 'profile-nudge',
              type: 'profile',
              title: `Your profile is ${strength}% ready`,
              meta: user.photo
                ? 'Add the last detail to make the match clearer'
                : 'Add a photo to put a face to the profile',
              href: '/profile',
              action: 'Finish',
            },
          ]
        : []
    const savedOpen = getSavedJobs(data, user).filter((job) => job.status === 'Open')
    const savedSummary = savedOpen.length
      ? [
          {
            id: 'saved-summary',
            type: 'saved',
            title: `${savedOpen.length} saved ${savedOpen.length === 1 ? 'role is' : 'roles are'} still open`,
            meta: 'A short list to return to when you are ready',
            href: '/saved-jobs',
            action: 'View',
          },
        ]
      : []
    return [...offers, ...waiting, ...profileNudge, ...savedSummary].slice(0, limit)
  }

  const details = applicationsWithJobs(data.applications, data.jobs, data.companies)
  const stale = details
    .filter(
      (application) =>
        application.status === 'Interview' &&
        daysSince(application.stageUpdatedAt) >= 4,
    )
    .sort((a, b) => daysSince(b.stageUpdatedAt) - daysSince(a.stageUpdatedAt))
    .map((application) => ({
      id: `stale-${application.id}`,
      type: 'interview',
      title: `${application.candidateName} needs a reply`,
      meta: `${application.job?.title || 'Role'} · ${daysSince(application.stageUpdatedAt)} days`,
      href: `/applications?application=${application.id}`,
      action: 'Review',
    }))

  const deadlines = jobsWithCompanies(data.jobs, data.companies)
    .filter((job) => {
      const days = daysUntil(job.deadline)
      return job.status === 'Open' && days >= 0 && days <= 7
    })
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .map((job) => {
      const applicantCount = data.applications.filter(
        (application) => application.jobId === job.id,
      ).length
      return {
        id: `deadline-${job.id}`,
        type: 'deadline',
        title: `${job.title} closes in ${daysUntil(job.deadline)} days`,
        meta: `${job.company?.name || 'Company'} · ${applicantCount} applicants`,
        href: `/jobs/${job.id}`,
        action: 'View role',
      }
    })

  return [...stale, ...deadlines].slice(0, limit)
}

export function getCandidateMatch(job, profile) {
  if (!job || !profile) return { matched: [], missing: [], percent: 0, label: 'Add skills to see your match' }
  const profileSkills = (profile.skills || []).map(normalize)
  const required = job.skills || []
  const matched = required.filter((skill) => {
    const clean = normalize(skill)
    return profileSkills.some(
      (profileSkill) =>
        profileSkill === clean ||
        profileSkill.includes(clean) ||
        clean.includes(profileSkill),
    )
  })
  const missing = required.filter((skill) => !matched.includes(skill))
  const percent = required.length ? Math.round((matched.length / required.length) * 100) : 0
  return {
    matched,
    missing,
    percent,
    label: `${matched.length} of ${required.length} skills match`,
  }
}

export function getRecommendedJobs(data, user, limit = 3) {
  if (!user) return []
  const applied = new Set(
    data.applications
      .filter((application) => application.candidateId === user.id)
      .map((application) => application.jobId),
  )
  return jobsWithCompanies(data.jobs, data.companies)
    .filter((job) => job.status === 'Open' && !applied.has(job.id))
    .map((job) => {
      const match = getCandidateMatch(job, user)
      return { ...job, match }
    })
    .sort(
      (a, b) =>
        b.match.percent - a.match.percent ||
        toMillis(b.postedAt) - toMillis(a.postedAt),
    )
    .slice(0, limit)
}

export function getReports(data) {
  const monthly = getMonthlyApplications(data.applications, 12)
  const pipeline = getPipeline(data.applications)
  const stageMix = getStageMix(data.applications)
  const mostApplied = getMostApplied(data, 5)
  const topCompanies = getTopCompanies(data, 5)
  const outcomes = STAGES.reduce((acc, stage) => {
    acc[stage] = data.applications.filter((application) => application.status === stage).length
    return acc
  }, {})
  const companiesHiring = new Set(
    data.jobs.filter((job) => job.status === 'Open').map((job) => job.companyId),
  ).size
  return {
    monthly,
    pipeline,
    stageMix,
    mostApplied,
    topCompanies,
    outcomes,
    companiesHiring,
    totalApplications: data.applications.length,
    activeApplications: pipeline.inPlay,
  }
}

export function filterJobs(jobs, filters) {
  const {
    query = '',
    location = 'all',
    type = 'all',
    experience = 'all',
    salary = 'any',
    status = 'all',
    sort = 'latest',
  } = filters
  const term = normalize(query)
  const band = SALARY_BANDS.find((item) => item.value === salary) || SALARY_BANDS[0]

  const filtered = jobs.filter((job) => {
    if (status !== 'all' && job.status !== status) return false
    if (location !== 'all') {
      if (location === 'Remote' && job.workMode !== 'Remote' && job.location !== 'Remote') {
        return false
      }
      if (location !== 'Remote' && job.location !== location && job.workMode !== location) {
        return false
      }
    }
    if (type !== 'all' && job.type !== type) return false
    if (experience !== 'all' && job.experience !== experience) return false
    if (salary !== 'any') {
      const overlaps = job.salaryMax >= band.min && job.salaryMin <= band.max
      if (!overlaps) return false
    }
    if (term) {
      const haystack = normalize(
        [
          job.title,
          job.company?.name,
          job.category,
          job.location,
          job.type,
          job.experience,
          ...(job.skills || []),
        ]
          .filter(Boolean)
          .join(' '),
      )
      if (!haystack.includes(term)) return false
    }
    return true
  })

  return filtered.sort((a, b) => {
    if (sort === 'salary') return b.salaryMax - a.salaryMax
    if (sort === 'deadline') return toMillis(a.deadline) - toMillis(b.deadline)
    if (sort === 'title') return a.title.localeCompare(b.title)
    return toMillis(b.postedAt) - toMillis(a.postedAt)
  })
}

export function getJobLocations(jobs) {
  return [...new Set(jobs.map((job) => job.location))].sort()
}

export function getUniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort()
}

export function getCompanyIndustries(companies) {
  return [...new Set(companies.map((company) => company.industry))].sort()
}

export function filterCompanies(companies, filters) {
  const { query = '', industry = 'all', sort = 'name-asc' } = filters
  const term = normalize(query)
  return companies
    .filter((company) => {
      if (industry !== 'all' && company.industry !== industry) return false
      if (!term) return true
      return normalize(
        [company.name, company.industry, company.location, company.description, company.contact?.name]
          .filter(Boolean)
          .join(' '),
      ).includes(term)
    })
    .sort((a, b) => {
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      if (sort === 'employees') return b.employees - a.employees
      if (sort === 'recent') return toMillis(b.createdAt) - toMillis(a.createdAt)
      return a.name.localeCompare(b.name)
    })
}

export function filterCandidates(candidates, filters) {
  const { query = '', department = 'all', sort = 'name-asc' } = filters
  const term = normalize(query)
  return candidates
    .filter((candidate) => {
      if (department !== 'all' && candidate.department !== department) return false
      if (!term) return true
      return normalize(
        [
          candidate.name,
          candidate.email,
          candidate.title,
          candidate.company,
          candidate.location,
          candidate.department,
          ...(candidate.skills || []),
        ]
          .filter(Boolean)
          .join(' '),
      ).includes(term)
    })
    .sort((a, b) => {
      if (sort === 'company') return (a.company || '').localeCompare(b.company || '')
      if (sort === 'experience') return b.experience - a.experience
      return a.name.localeCompare(b.name)
    })
}

export function filterApplications(applications, { query = '', status = 'all' } = {}) {
  const term = normalize(query)
  return applications
    .filter((application) => {
      if (status !== 'all' && application.status !== status) return false
      if (!term) return true
      return normalize(
        [
          application.candidateName,
          application.job?.title,
          application.company?.name,
          application.status,
        ]
          .filter(Boolean)
          .join(' '),
      ).includes(term)
    })
    .sort((a, b) => toMillis(b.appliedAt) - toMillis(a.appliedAt))
}

export function paginate(items, page, pageSize) {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pages)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    total,
    pages,
    page: current,
    from: total === 0 ? 0 : (current - 1) * pageSize + 1,
    to: Math.min(current * pageSize, total),
  }
}
