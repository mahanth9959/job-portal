import { ArrowLeft, Compass } from 'lucide-react'
import { LogoMark } from '../components/Brand'
import { ButtonLink } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="grid min-h-[60svh] place-items-center">
      <div className="w-full max-w-lg rounded-card border border-line bg-surface p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
          <LogoMark size={28} />
        </span>
        <h1 className="mt-6 text-[32px] font-bold leading-[1.1] tracking-[-0.035em] text-ink">
          This page is out of view.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
          404. The link may be old, or the page may have moved. The rest of the workspace is
          still where you left it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink to="/dashboard" variant="primary">
            <ArrowLeft aria-hidden="true" />
            Back to overview
          </ButtonLink>
          <ButtonLink to="/jobs" variant="secondary">
            <Compass aria-hidden="true" />
            Browse jobs
          </ButtonLink>
        </div>

      </div>
    </div>
  )
}
