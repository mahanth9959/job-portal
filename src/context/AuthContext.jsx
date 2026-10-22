import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEMO_USERS } from '../data/seed'
import { STORAGE_KEYS } from '../lib/constants'
import { isValidEmail, normalize, slugify } from '../lib/format'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'

const AuthContext = createContext(null)

function seedUsers() {
  const existing = readStorage(STORAGE_KEYS.users, null)
  if (Array.isArray(existing) && existing.length > 0) return existing
  writeStorage(STORAGE_KEYS.users, DEMO_USERS)
  return DEMO_USERS
}

function readSession(users) {
  const session = readStorage(STORAGE_KEYS.session, null)
  if (!session?.userId) return null
  return users.find((user) => user.id === session.userId) || null
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => seedUsers())
  const [user, setUser] = useState(() => readSession(seedUsers()))

  useEffect(() => {
    if (users) writeStorage(STORAGE_KEYS.users, users)
  }, [users])

  const login = useCallback(
    (email, password) => {
      const found = users.find(
        (candidate) =>
          normalize(candidate.email) === normalize(email) && candidate.password === password,
      )
      if (!found) {
        throw new Error('That email and password do not match a Hireline account.')
      }
      writeStorage(STORAGE_KEYS.session, {
        userId: found.id,
        signedInAt: new Date().toISOString(),
      })
      setUser(found)
      return found
    },
    [users],
  )

  const loginAsDemo = useCallback(
    (role) => {
      const demo = DEMO_USERS.find((account) => account.role === role)
      if (!demo) throw new Error('Demo account not found.')
      const found = users.find(
        (candidate) => normalize(candidate.email) === normalize(demo.email),
      )
      if (!found) throw new Error('Demo account not found.')
      writeStorage(STORAGE_KEYS.session, {
        userId: found.id,
        signedInAt: new Date().toISOString(),
      })
      setUser(found)
      return found
    },
    [users],
  )

  const register = useCallback(
    ({ name, email, password, role }) => {
      const cleanEmail = normalize(email)
      if (!isValidEmail(cleanEmail)) throw new Error('Enter a valid email address.')
      if (users.some((candidate) => normalize(candidate.email) === cleanEmail)) {
        throw new Error('An account with that email already exists. Sign in instead.')
      }
      const now = new Date().toISOString()
      const id = `${slugify(name)}-${Date.now().toString(36)}`
      const newUser = {
        id,
        name: name.trim(),
        email: cleanEmail,
        password,
        role,
        title: role === 'recruiter' ? 'Recruiter' : 'Open to new roles',
        company: role === 'recruiter' ? 'Hireline' : '',
        phone: '',
        address: '',
        city: '',
        skills: [],
        experience: '',
        education: '',
        bio: '',
        photo: null,
        resume: null,
        createdAt: now,
      }
      const nextUsers = [...users, newUser]
      setUsers(nextUsers)
      writeStorage(STORAGE_KEYS.users, nextUsers)
      writeStorage(STORAGE_KEYS.session, { userId: id, signedInAt: now })
      setUser(newUser)
      return newUser
    },
    [users],
  )

  const logout = useCallback(() => {
    removeStorage(STORAGE_KEYS.session)
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    (patch) => {
      if (!user) throw new Error('You need to be signed in to update your profile.')
      const cleanEmail = patch.email ? normalize(patch.email) : user.email
      if (patch.email && !isValidEmail(cleanEmail)) {
        throw new Error('Enter a valid email address.')
      }
      const duplicate = users.some(
        (candidate) =>
          candidate.id !== user.id && normalize(candidate.email) === cleanEmail,
      )
      if (duplicate) throw new Error('Another account already uses that email address.')
      const nextUser = { ...user, ...patch, email: cleanEmail }
      const nextUsers = users.map((candidate) =>
        candidate.id === user.id ? nextUser : candidate,
      )
      setUsers(nextUsers)
      setUser(nextUser)
      writeStorage(STORAGE_KEYS.users, nextUsers)
      return nextUser
    },
    [user, users],
  )

  const value = useMemo(
    () => ({
      user,
      users,
      isAuthenticated: Boolean(user),
      isRecruiter: user?.role === 'recruiter',
      isCandidate: user?.role === 'candidate',
      login,
      loginAsDemo,
      register,
      logout,
      updateProfile,
    }),
    [user, users, login, loginAsDemo, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
