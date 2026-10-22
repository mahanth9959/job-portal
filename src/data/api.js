import axios from 'axios'
import {
  BRAND_PROFILES,
  FALLBACK_CANDIDATES,
  brandToCompany,
  skillsForDepartment,
} from './seed'

const DIRECTORY_URL = 'https://dummyjson.com/users?limit=30'

const EXTRA_DEPARTMENTS = {
  'Research and Development': 'Research',
  'Product Management': 'Product',
  'Human Resources': 'People',
  Services: 'Services',
  Accounting: 'Finance',
  Training: 'Training',
  Legal: 'Legal',
}

const CITY_STATE = {
  Phoenix: 'AZ',
  Houston: 'TX',
  Washington: 'DC',
  Seattle: 'WA',
  Jacksonville: 'FL',
  'Fort Worth': 'TX',
  Indianapolis: 'IN',
  'San Antonio': 'TX',
  'New York': 'NY',
  Denver: 'CO',
  Columbus: 'OH',
  'San Jose': 'CA',
  'San Diego': 'CA',
  Philadelphia: 'PA',
  Dallas: 'TX',
  'Los Angeles': 'CA',
  Chicago: 'IL',
  Austin: 'TX',
  Boston: 'MA',
  Atlanta: 'GA',
}

function normalizeDepartment(department = '') {
  return EXTRA_DEPARTMENTS[department] || department || 'Services'
}

function educationFor(id, department) {
  const options =
    department === 'Design'
      ? ['BFA, Visual Communication', 'BA, Interaction Design', 'MFA, Design']
      : department === 'Engineering'
        ? ['BSc, Computer Science', 'MSc, Software Engineering', 'BEng, Systems']
        : department === 'Finance' || department === 'Legal'
          ? ['BCom, Accounting', 'JD, Law', 'BA, Economics']
          : ['BA, Communications', 'BSc, Psychology', 'BA, Liberal Arts']
  return options[id % options.length]
}

function mapCandidate(user, index) {
  const brand = BRAND_PROFILES[index % BRAND_PROFILES.length] || null
  const department = normalizeDepartment(user.company?.department)
  const city = user.address?.city || ''
  const state = CITY_STATE[city] || user.address?.state || ''
  const location = [city, state].filter(Boolean).join(', ')
  const title = user.company?.title || 'Professional'
  const company = brand?.name || 'Independent'
  return {
    id: `cand-${user.id}`,
    apiId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    avatar: null,
    apiAvatar: user.image || null,
    age: user.age,
    city,
    state,
    location,
    company,
    title,
    department,
    experience: 2 + (user.id % 11),
    education: educationFor(user.id, department),
    skills: skillsForDepartment(department),
    availability: user.id % 4 === 0 ? 'Open to work' : 'Open to offers',
    summary: `${title} at ${company}. Based in ${location || 'the US'}, open to careful teams building useful things.`,
    source: 'dummyjson',
  }
}

export async function fetchDirectory() {
  const response = await axios.get(DIRECTORY_URL, {
    timeout: 12000,
    headers: { Accept: 'application/json' },
  })
  const users = Array.isArray(response.data?.users) ? response.data.users : []
  if (!users.length) {
    throw new Error('The directory returned no people.')
  }

  const companies = BRAND_PROFILES.map((profile, index) =>
    brandToCompany(profile, users[index], index),
  )
  const candidates = users.map(mapCandidate)

  return {
    companies,
    candidates,
    source: 'dummyjson',
    fetchedAt: new Date().toISOString(),
  }
}

export function getOfflineDirectory(reason = 'The live directory could not be reached.') {
  return {
    companies: BRAND_PROFILES.map((profile, index) => brandToCompany(profile, null, index)),
    candidates: FALLBACK_CANDIDATES,
    source: 'offline',
    error: reason,
    fetchedAt: null,
  }
}
