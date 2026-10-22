import { ArrowUpRight, Check } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../Brand'
import { ThemeToggle } from '../ThemeToggle'

const previewStages = [
  { label: 'Applied', value: 25, width: 100 },
  { label: 'Screening', value: 15, width: 60 },
  { label: 'Interview', value: 10, width: 40 },
  { label: 'Offer', value: 6, width: 24 },
]

export function AuthLayout() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="auth-shell">
      <section className="auth-brand" aria-label="About Hireline">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Logo />
            <div className="mt-3 text-[11px] font-medium tracking-[0.01em] text-pulse-muted">
              A hiring workspace for people who care about the details.
            </div>
          </div>
          <span className="hidden items-center gap-1.5 text-[11px] text-pulse-muted sm:flex">
            <span className="size-1.5 rounded-full bg-pulse-accent" />
            Demo workspace
          </span>
        </div>

        <div className="auth-brand-copy">
          <h1>Hiring, in clear view.</h1>
          <p>
            One calm line from open role to next hire. Recruiters keep the pipeline moving;
            candidates keep every application in sight.
          </p>

          <div className="auth-preview" aria-label="Sample pipeline snapshot">
            <div className="auth-preview-head">
              <strong>Today’s pipeline</strong>
              <span>Sample workspace</span>
            </div>
            <div className="auth-preview-total">
              <strong>56</strong>
              <span>applications in play</span>
            </div>
            <div className="auth-preview-stages">
              {previewStages.map((stage) => (
                <div className="auth-stage" key={stage.label}>
                  <div className="auth-stage-label">
                    <span>{stage.label}</span>
                    <b>{stage.value}</b>
                  </div>
                  <div className="auth-stage-track">
                    <span style={{ width: `${stage.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="auth-preview-foot">
              <strong>9 interview replies</strong> have waited more than 4 days. One queue, one
              place to look.
            </div>
          </div>
        </div>

        <div className="auth-brand-foot">
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3" aria-hidden="true" />
            Local-first demo · data stays in this browser
          </span>
          <span className="inline-flex items-center gap-1.5">
            Directory via DummyJSON
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </span>
        </div>
      </section>

      <main className="auth-main">
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
