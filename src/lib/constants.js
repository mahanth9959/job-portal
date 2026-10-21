export const APP_NAME = 'Hireline'
export const APP_TAGLINE = 'Hiring, in clear view.'

export const STORAGE_KEYS = {
  users: 'hireline.users.v1',
  session: 'hireline.session.v1',
  portal: 'hireline.portal.v1',
  theme: 'hireline.theme',
  rememberedEmail: 'hireline.remembered-email',
}

export const DEMO_ACCOUNTS = [
  {
    role: 'recruiter',
    label: 'Recruiter demo',
    name: 'Alex Morgan',
    email: 'alex@hireline.dev',
    password: 'hireline123',
    title: 'Talent lead',
    initials: 'AM',
  },
  {
    role: 'candidate',
    label: 'Candidate demo',
    name: 'Maya Chen',
    email: 'maya@hireline.dev',
    password: 'hireline123',
    title: 'Senior product designer',
    initials: 'MC',
  },
]

export const DEMO_PASSWORD = 'hireline123'

export const ROLES = {
  recruiter: 'Recruiter',
  candidate: 'Candidate',
}

export const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn']
export const ACTIVE_STAGES = ['Applied', 'Screening', 'Interview', 'Offer']
export const CLOSED_STAGES = ['Rejected', 'Withdrawn']

export const STAGE_TONE = {
  Applied: 'neutral',
  Screening: 'warning',
  Interview: 'accent',
  Offer: 'positive',
  Rejected: 'negative',
  Withdrawn: 'neutral',
}

export const JOB_STATUS_TONE = {
  Open: 'positive',
  Closed: 'neutral',
}

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
export const EXPERIENCE_LEVELS = ['Internship', 'Junior', 'Mid', 'Senior', 'Lead']
export const JOB_CATEGORIES = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Finance',
  'Support',
  'People',
  'Research',
  'Legal',
  'Analytics',
  'Sales',
  'Training',
  'Services',
]
export const INDUSTRIES = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Finance',
  'Support',
  'People',
  'Research',
  'Legal',
  'Analytics',
  'Sales',
  'Training',
  'Services',
]
export const WORK_MODES = ['Remote', 'Hybrid', 'On-site']

export const SALARY_BANDS = [
  { value: 'any', label: 'Any salary', min: 0, max: Infinity },
  { value: 'under-80', label: 'Under $80k', min: 0, max: 80000 },
  { value: '80-120', label: '$80k – $120k', min: 80000, max: 120000 },
  { value: '120-160', label: '$120k – $160k', min: 120000, max: 160000 },
  { value: '160-plus', label: '$160k and up', min: 160000, max: Infinity },
]

export const JOB_SORT_OPTIONS = [
  { value: 'latest', label: 'Newest first' },
  { value: 'salary', label: 'Highest salary' },
  { value: 'deadline', label: 'Closing soon' },
  { value: 'title', label: 'Title A–Z' },
]

export const COMPANY_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'employees', label: 'Most employees' },
  { value: 'recent', label: 'Recently added' },
]

export const PAGE_SIZE = { companies: 8, jobs: 7, candidates: 8, applications: 8 }

export const NAV_ITEMS = {
  recruiter: [
    { label: 'Overview', to: '/dashboard', icon: 'overview' },
    { label: 'Jobs', to: '/jobs', icon: 'briefcase' },
    { label: 'Companies', to: '/companies', icon: 'building' },
    { label: 'Candidates', to: '/candidates', icon: 'users' },
    { label: 'Applications', to: '/applications', icon: 'inbox' },
    { label: 'Reports', to: '/reports', icon: 'chart' },
  ],
  candidate: [
    { label: 'Overview', to: '/dashboard', icon: 'overview' },
    { label: 'Find jobs', to: '/jobs', icon: 'search' },
    { label: 'Saved jobs', to: '/saved-jobs', icon: 'bookmark' },
    { label: 'Applications', to: '/applications', icon: 'inbox' },
    { label: 'Companies', to: '/companies', icon: 'building' },
  ],
}
