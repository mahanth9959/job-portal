import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fetchDirectory, getOfflineDirectory } from '../data/api'
import { createSeedPortal } from '../data/seed'
import { STORAGE_KEYS } from '../lib/constants'
import { slugify } from '../lib/format'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'
import { useAuth } from './AuthContext'

const PortalContext = createContext(null)

function readCachedPortal() {
  const cached = readStorage(STORAGE_KEYS.portal, null)
  if (
    cached &&
    Array.isArray(cached.companies) &&
    Array.isArray(cached.jobs) &&
    Array.isArray(cached.applications) &&
    Array.isArray(cached.candidates) &&
    cached.savedJobs &&
    typeof cached.savedJobs === 'object'
  ) {
    return cached
  }
  return null
}

export function PortalProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(readCachedPortal)
  const [loading, setLoading] = useState(() => !readCachedPortal())
  const [refreshing, setRefreshing] = useState(false)
  const [directoryError, setDirectoryError] = useState('')
  const startedRef = useRef(false)

  const loadDirectory = useCallback(async () => {
    setLoading(true)
    setDirectoryError('')
    try {
      const directory = await fetchDirectory()
      const portal = createSeedPortal(directory.companies, directory.candidates)
      setData({
        ...portal,
        directoryUpdatedAt: directory.fetchedAt,
        directorySource: 'dummyjson',
      })
    } catch (error) {
      const reason =
        error?.code === 'ECONNABORTED'
          ? 'The DummyJSON directory took too long to respond.'
          : 'The DummyJSON directory could not be reached right now.'
      const offline = getOfflineDirectory(reason)
      const portal = createSeedPortal(offline.companies, offline.candidates)
      setData({
        ...portal,
        directoryUpdatedAt: null,
        directorySource: 'offline',
      })
      setDirectoryError(
        `${reason} Hireline is showing the offline directory so every screen still works.`,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (data || startedRef.current) return
    startedRef.current = true
    loadDirectory()
  }, [data, loadDirectory])

  useEffect(() => {
    if (data) writeStorage(STORAGE_KEYS.portal, data)
  }, [data])

  const refreshDirectory = useCallback(async () => {
    if (!data) {
      await loadDirectory()
      return { ok: true }
    }
    setRefreshing(true)
    try {
      const directory = await fetchDirectory()
      setData((current) => {
        const freshById = new Map(directory.companies.map((company) => [company.id, company]))
        const companies = current.companies.map((company) => {
          if (company.source === 'local') return company
          const fresh = freshById.get(company.id)
          if (!fresh) return company
          return {
            ...company,
            contact: fresh.contact,
            phone: fresh.phone,
            apiUserId: fresh.apiUserId,
            source: 'dummyjson',
          }
        })
        return {
          ...current,
          companies,
          candidates: directory.candidates,
          directoryUpdatedAt: directory.fetchedAt,
          directorySource: 'dummyjson',
        }
      })
      setDirectoryError('')
      return { ok: true, people: directory.candidates.length }
    } catch {
      const message =
        'The live directory could not be refreshed. Your current data is still here.'
      setDirectoryError(message)
      return { ok: false, message }
    } finally {
      setRefreshing(false)
    }
  }, [data, loadDirectory])

  const addCompany = useCallback((input) => {
    const now = new Date().toISOString()
    const id = `co-${slugify(input.name)}-${Date.now().toString(36)}`
    const company = {
      id,
      slug: slugify(input.name),
      name: input.name.trim(),
      industry: input.industry,
      location: input.location,
      city: input.location.split(',')[0]?.trim() || '',
      state: input.location.split(',')[1]?.trim() || '',
      website: input.website || '',
      email: input.email || '',
      phone: input.phone || '',
      contact: input.contact || {
        name: input.contactName || 'Hiring team',
        role: input.contactRole || 'Talent',
        email: input.contactEmail || input.email || '',
        avatar: null,
      },
      employees: Number(input.employees) || 0,
      founded: input.founded || '',
      description: input.description || '',
      logo: input.logo || { shape: 'arch', tone: 'rose' },
      source: 'local',
      apiUserId: null,
      createdAt: now,
    }
    setData((current) =>
      current ? { ...current, companies: [company, ...current.companies] } : current,
    )
    return company
  }, [])

  const updateCompany = useCallback((id, patch) => {
    setData((current) => {
      if (!current) return current
      return {
        ...current,
        companies: current.companies.map((company) =>
          company.id === id
            ? {
                ...company,
                ...patch,
                contact: patch.contact
                  ? { ...company.contact, ...patch.contact }
                  : company.contact,
              }
            : company,
        ),
      }
    })
  }, [])

  const deleteCompany = useCallback((id) => {
    setData((current) => {
      if (!current) return current
      const removedJobIds = new Set(
        current.jobs.filter((job) => job.companyId === id).map((job) => job.id),
      )
      const savedJobs = Object.fromEntries(
        Object.entries(current.savedJobs).map(([userId, ids]) => [
          userId,
          ids.filter((jobId) => !removedJobIds.has(jobId)),
        ]),
      )
      return {
        ...current,
        companies: current.companies.filter((company) => company.id !== id),
        jobs: current.jobs.filter((job) => job.companyId !== id),
        applications: current.applications.filter(
          (application) => !removedJobIds.has(application.jobId),
        ),
        savedJobs,
      }
    })
  }, [])

  const addJob = useCallback(
    (input) => {
      const now = new Date().toISOString()
      const company = data?.companies.find((item) => item.id === input.companyId)
      const job = {
        ...input,
        id: `job-${slugify(input.title)}-${Date.now().toString(36)}`,
        companySlug: company?.slug || '',
        salaryMin: Number(input.salaryMin) || 0,
        salaryMax: Number(input.salaryMax) || 0,
        recruiterId: user?.id || 'alex-morgan',
        postedAt: now,
        createdAt: now,
      }
      setData((current) =>
        current ? { ...current, jobs: [job, ...current.jobs] } : current,
      )
      return job
    },
    [data, user],
  )

  const updateJob = useCallback((id, patch) => {
    setData((current) => {
      if (!current) return current
      const company = patch.companyId
        ? current.companies.find((item) => item.id === patch.companyId)
        : null
      return {
        ...current,
        jobs: current.jobs.map((job) =>
          job.id === id
            ? {
                ...job,
                ...patch,
                salaryMin:
                  patch.salaryMin != null ? Number(patch.salaryMin) : job.salaryMin,
                salaryMax:
                  patch.salaryMax != null ? Number(patch.salaryMax) : job.salaryMax,
                companySlug: company ? company.slug : job.companySlug,
              }
            : job,
        ),
      }
    })
  }, [])

  const deleteJob = useCallback((id) => {
    setData((current) => {
      if (!current) return current
      const savedJobs = Object.fromEntries(
        Object.entries(current.savedJobs).map(([userId, ids]) => [
          userId,
          ids.filter((jobId) => jobId !== id),
        ]),
      )
      return {
        ...current,
        jobs: current.jobs.filter((job) => job.id !== id),
        applications: current.applications.filter(
          (application) => application.jobId !== id,
        ),
        savedJobs,
      }
    })
  }, [])

  const toggleSavedJob = useCallback(
    (jobId) => {
      if (!user) return false
      const currentIds = data?.savedJobs?.[user.id] || []
      const isSaved = currentIds.includes(jobId)
      setData((current) => {
        if (!current) return current
        const ids = current.savedJobs?.[user.id] || []
        const alreadySaved = ids.includes(jobId)
        return {
          ...current,
          savedJobs: {
            ...current.savedJobs,
            [user.id]: alreadySaved
              ? ids.filter((id) => id !== jobId)
              : [...ids, jobId],
          },
        }
      })
      return !isSaved
    },
    [data, user],
  )

  const applyToJob = useCallback(
    (jobId, note = '') => {
      if (!user) throw new Error('Sign in to apply for a role.')
      if (user.role !== 'candidate') {
        throw new Error('Switch to a candidate account to apply for roles.')
      }
      const job = data?.jobs.find((item) => item.id === jobId)
      if (!job) throw new Error('That role could not be found.')
      if (job.status !== 'Open') throw new Error('This role is closed for applications.')
      const alreadyApplied = data?.applications.some(
        (application) =>
          application.jobId === jobId && application.candidateId === user.id,
      )
      if (alreadyApplied) throw new Error('You have already applied for this role.')
      const now = new Date().toISOString()
      const application = {
        id: `app-${user.id}-${Date.now().toString(36)}`,
        jobId,
        candidateId: user.id,
        candidateName: user.name,
        candidateEmail: user.email,
        candidateAvatar: user.photo,
        candidateTitle: user.title,
        candidateLocation: user.city,
        status: 'Applied',
        appliedAt: now,
        stageUpdatedAt: now,
        note: note.trim(),
        source: 'user',
      }
      setData((current) =>
        current
          ? { ...current, applications: [application, ...current.applications] }
          : current,
      )
      return application
    },
    [data, user],
  )

  const withdrawApplication = useCallback(
    (applicationId) => {
      if (!user) throw new Error('Sign in to manage applications.')
      const application = data?.applications.find((item) => item.id === applicationId)
      if (!application || application.candidateId !== user.id) {
        throw new Error('That application could not be found.')
      }
      const now = new Date().toISOString()
      setData((current) =>
        current
          ? {
              ...current,
              applications: current.applications.map((item) =>
                item.id === applicationId
                  ? { ...item, status: 'Withdrawn', stageUpdatedAt: now }
                  : item,
              ),
            }
          : current,
      )
    },
    [data, user],
  )

  const updateApplicationStage = useCallback(
    (applicationId, status) => {
      if (!user || user.role !== 'recruiter') {
        throw new Error('Only recruiters can move applications.')
      }
      const now = new Date().toISOString()
      setData((current) =>
        current
          ? {
              ...current,
              applications: current.applications.map((item) =>
                item.id === applicationId
                  ? { ...item, status, stageUpdatedAt: now }
                  : item,
              ),
            }
          : current,
      )
    },
    [user],
  )

  const resetDemoData = useCallback(async () => {
    removeStorage(STORAGE_KEYS.portal)
    setData(null)
    setLoading(true)
    startedRef.current = false
    await loadDirectory()
  }, [loadDirectory])

  const value = useMemo(
    () => ({
      data,
      loading,
      refreshing,
      directoryError,
      directorySource: data?.directorySource || 'offline',
      directoryUpdatedAt: data?.directoryUpdatedAt || null,
      refreshDirectory,
      resetDemoData,
      addCompany,
      updateCompany,
      deleteCompany,
      addJob,
      updateJob,
      deleteJob,
      toggleSavedJob,
      applyToJob,
      withdrawApplication,
      updateApplicationStage,
    }),
    [
      data,
      loading,
      refreshing,
      directoryError,
      refreshDirectory,
      resetDemoData,
      addCompany,
      updateCompany,
      deleteCompany,
      addJob,
      updateJob,
      deleteJob,
      toggleSavedJob,
      applyToJob,
      withdrawApplication,
      updateApplicationStage,
    ],
  )

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export function usePortal() {
  const context = useContext(PortalContext)
  if (!context) throw new Error('usePortal must be used inside PortalProvider')
  return context
}


