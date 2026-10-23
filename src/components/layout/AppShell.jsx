import {
  BarChart3,
  Bookmark,
  Briefcase,
  Building2,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { usePortal } from '../../context/PortalContext'
import { NAV_ITEMS, ROLES } from '../../lib/constants'
import { getCounts, getPipeline } from '../../data/selectors'
import { Logo, LogoMark } from '../Brand'
import { ThemeToggle } from '../ThemeToggle'
import { UserAvatar } from '../UserAvatar'
import { Menu as ActionMenu, SkeletonPage } from '../ui/Layout'

const NAV_ICONS = {
  overview: LayoutDashboard,
  briefcase: Briefcase,
  building: Building2,
  users: Users,
  inbox: Inbox,
  chart: BarChart3,
  search: Search,
  bookmark: Bookmark,
  profile: UserRound,
}

function pageLabel(pathname) {
  if (pathname === '/dashboard') return 'Overview'
  if (pathname === '/jobs/new') return 'Post a job'
  if (pathname.startsWith('/jobs/') && pathname.endsWith('/edit')) return 'Edit job'
  if (pathname.startsWith('/jobs/')) return 'Job details'
  if (pathname === '/jobs') return 'Jobs'
  if (pathname === '/companies') return 'Companies'
  if (pathname.startsWith('/companies/')) return 'Company'
  if (pathname === '/candidates') return 'Candidates'
  if (pathname === '/applications') return 'Applications'
  if (pathname === '/saved-jobs') return 'Saved jobs'
  if (pathname === '/reports') return 'Reports'
  if (pathname === '/profile') return 'Profile'
  return 'Hireline'
}

function useNavGroups(user) {
  return useMemo(() => {
    const items = NAV_ITEMS[user?.role] || NAV_ITEMS.candidate
    const profile = { label: 'Profile', to: '/profile', icon: 'profile' }
    if (user?.role === 'recruiter') {
      return [
        { label: 'Workspace', items: items.slice(0, 2) },
        { label: 'Hiring', items: items.slice(2) },
        { label: 'Account', items: [profile] },
      ]
    }
    return [
      { label: 'Workspace', items: items.slice(0, 1) },
      { label: 'Your search', items: items.slice(1) },
      { label: 'Account', items: [profile] },
    ]
  }, [user])
}

function NavItems({ user, onNavigate, staleInterviews }) {
  const groups = useNavGroups(user)
  return (
    <>
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-group-label">{group.label}</div>
          {group.items.map((item) => {
            const Icon = NAV_ICONS[item.icon] || LayoutDashboard
            const badge =
              item.to === '/applications' && user?.role === 'recruiter' && staleInterviews
                ? staleInterviews
                : null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className="nav-item"
                onClick={onNavigate}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </NavLink>
            )
          })}
        </div>
      ))}
    </>
  )
}

function WorkspaceIdentity({ user }) {
  return (
    <div className="workspace">
      <Logo subtitle={user?.role === 'recruiter' ? 'Recruiting workspace' : 'Candidate workspace'} />
      <span className="ml-auto">
        <ThemeToggle />
      </span>
    </div>
  )
}

function SidebarBottom({ user, counts }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  if (!user) return null
  return (
    <div className="sidebar-bottom">
      {user.role === 'candidate' ? (
        <Link className="sidebar-note" to="/profile">
          <span className="flex items-center justify-between gap-2">
            <strong>Profile strength</strong>
            <span className="inline-flex items-center gap-1 text-accent-ink">
              {counts.profileStrength}%
              <ChevronRight className="size-3" aria-hidden="true" />
            </span>
          </span>
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-accent-track">
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${counts.profileStrength}%` }}
            />
          </span>
          <span className="mt-1.5 block">Add a resume or photo to stand out.</span>
        </Link>
      ) : (
        <Link className="sidebar-note" to="/applications">
          <span className="flex items-center justify-between gap-2">
            <strong>This week</strong>
            <span className="inline-flex items-center gap-1 text-accent-ink">
              Review
              <ChevronRight className="size-3" aria-hidden="true" />
            </span>
          </span>
          <span className="mt-1 block">
            {counts.thisWeek} new {counts.thisWeek === 1 ? 'application' : 'applications'} ·{' '}
            {counts.closingSoon} {counts.closingSoon === 1 ? 'role closes' : 'roles close'} soon.
          </span>
        </Link>
      )}
      <ActionMenu
        label="Account menu"
        trigger={
          <button type="button" className="user-row">
            <UserAvatar name={user.name} src={user.photo} size="md" alt="" />
            <span className="user-meta">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{ROLES[user.role] || 'Member'}</span>
            </span>
            <ChevronRight className="size-4 flex-none text-faint" aria-hidden="true" />
          </button>
        }
        items={[
          { label: 'View profile', to: '/profile', icon: <UserRound /> },
          { label: 'Sign out', onClick: () => {
            logout()
            toast.info('You have signed out of Hireline.')
            navigate('/login')
          }, icon: <LogOut />, danger: true },
        ]}
      />
    </div>
  )
}

function MobileMenu({ open, onClose, user, staleInterviews }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="mobile-menu-layer" role="dialog" aria-modal="true" aria-label="Workspace menu">
      <div className="mobile-menu-inner">
        <div className="mobile-menu-head">
          <Logo />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close menu">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="mobile-menu-nav">
          <NavItems
            user={user}
            onNavigate={onClose}
            staleInterviews={staleInterviews}
          />
        </div>
        <div className="mobile-menu-bottom">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <span className="flex items-center gap-2">
              <UserAvatar name={user.name} src={user.photo} size="md" />
              <span>
                <span className="block text-sm font-semibold text-ink">{user.name}</span>
                <span className="block text-xs text-faint">{ROLES[user.role]}</span>
              </span>
            </span>
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-block justify-start text-negative"
            onClick={() => {
              logout()
              toast.info('You have signed out of Hireline.')
              navigate('/login')
            }}
          >
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const { user } = useAuth()
  const { data, loading } = usePortal()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  const counts = useMemo(
    () => (data ? getCounts(data, user) : { thisWeek: 0, closingSoon: 0, profileStrength: 0 }),
    [data, user],
  )
  const staleInterviews = useMemo(() => {
    if (!data || user?.role !== 'recruiter') return 0
    return getPipeline(data.applications).staleInterviews.length
  }, [data, user])

  if (!user) return null

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <WorkspaceIdentity user={user} />
        <NavItems user={user} staleInterviews={staleInterviews} />
        <SidebarBottom user={user} counts={counts} />
      </aside>

      <div className="min-w-0">
        <header className="mobile-bar">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open workspace menu"
          >
            <Menu aria-hidden="true" />
          </button>
          <Link className="flex min-w-0 items-center gap-2" to="/dashboard">
            <span className="grid size-7 flex-none place-items-center rounded-[6px] bg-accent text-white">
              <LogoMark size={18} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-none tracking-[-0.04em] text-ink">
                hireline
              </span>
              <span className="mt-1 block truncate text-[10px] font-medium leading-none text-faint">
                {pageLabel(location.pathname)}
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-full"
              onClick={() => setMobileOpen(true)}
              aria-label="Open account menu"
            >
              <UserAvatar name={user.name} src={user.photo} size="sm" />
            </button>
          </div>
        </header>
        <main className="canvas">
          <div className="canvas-inner">
            {loading || !data ? <SkeletonPage /> : <Outlet />}
          </div>
        </main>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        staleInterviews={staleInterviews}
      />
    </div>
  )
}
