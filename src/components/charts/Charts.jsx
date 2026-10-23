import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNumber, niceMax } from '../../lib/format'
import { EmptyState } from '../ui/Layout'

export function MonthlyApplicationsChart({ data, caption, ariaLabel = 'Applications by month' }) {
  let max = niceMax(Math.max(1, ...data.map((item) => item.value)), 4)
  max = Math.max(4, Math.ceil(max / 4) * 4)
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(max * ratio))
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const current = data.find((item) => item.current)
  const best = data.reduce(
    (winner, item) => (item.value > winner.value ? item : winner),
    data[0] || { value: 0, full: '—' },
  )
  const average = data.length ? Math.round(total / data.length) : 0

  return (
    <figure className="chart-figure">
      <div className="chart-frame">
        <div className="chart-y" aria-hidden="true">
          {ticks.map((tick, index) => (
            <span key={`${tick}-${index}`}>{formatNumber(tick)}</span>
          ))}
        </div>
        <div>
          <div className="chart-plot">
            <div className="chart-gridlines" aria-hidden="true">
              {ticks.map((tick, index) => (
                <span key={`${tick}-line-${index}`} />
              ))}
            </div>
            <div
              className="chart-bars"
              role="img"
              aria-label={`${ariaLabel}. ${total} applications across ${data.length} months.`}
            >
              {data.map((item) => (
                <div className="chart-bar-col" key={item.key}>
                  <div
                    className={`chart-bar ${item.current ? 'is-current' : ''}`}
                    style={{
                      height: `${(item.value / max) * 100}%`,
                      minHeight: item.value === 0 ? 0 : 2,
                    }}
                    title={`${item.full}: ${item.value} applications`}
                  >
                    {item.value > 0 ? (
                      <span className="chart-tooltip">
                        {item.full} · {item.value}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-x" aria-hidden="true">
            {data.map((item) => (
              <span key={item.key} title={item.full}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {caption ? <figcaption className="chart-caption">{caption}</figcaption> : null}
      <div className="chart-summary">
        <div>
          <div className="chart-summary-label">Current month</div>
          <div className="chart-summary-value">{current?.value ?? 0}</div>
        </div>
        <div>
          <div className="chart-summary-label">Best month</div>
          <div className="chart-summary-value">
            {best.value ? `${best.label} · ${best.value}` : '—'}
          </div>
        </div>
        <div>
          <div className="chart-summary-label">Monthly average</div>
          <div className="chart-summary-value">{average}</div>
        </div>
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.key}>
            {item.full}: {item.value} applications
          </li>
        ))}
      </ul>
    </figure>
  )
}

export function PipelinePulse({
  pipeline,
  meta = 'All roles',
  finding,
  href = '/applications',
  linkLabel = 'Review the queue',
  highlight = 'Interview',
  weekly = 0,
  closingSoon = 0,
  showWaiting = true,
}) {
  const offerRate = pipeline.inPlay
    ? Math.round(((pipeline.stageCounts.Offer || 0) / pipeline.inPlay) * 100)
    : 0
  return (
    <section className="pulse" aria-label="Pipeline pulse">
      <div className="pulse-top">
        <div>
          <h2 className="panel-title">Pipeline pulse</h2>
          <p className="pulse-meta mt-1">Live applications, from first hello to offer.</p>
        </div>
        <span className="pulse-meta text-right">{meta}</span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="pulse-big">{formatNumber(pipeline.inPlay)}</div>
          <div className="pulse-big-label">applications in play</div>
        </div>
        <div className="pulse-meta pb-1 text-right">
          {formatNumber(pipeline.closed)} closed
          {showWaiting ? (
            <>
              <br />
              {formatNumber(pipeline.staleInterviews.length)} waiting
            </>
          ) : null}
        </div>
      </div>
      <div className="pulse-stages">
        {pipeline.activeCounts.map((stage) => (
          <div
            className={`pulse-stage ${stage.stage === highlight ? 'is-current' : ''}`}
            key={stage.stage}
          >
            <div className="pulse-stage-head">
              <span>{stage.stage}</span>
              <span className="pulse-stage-count">{stage.count}</span>
            </div>
            <div className="pulse-track">
              <div
                className="pulse-fill"
                style={{
                  width: `${Math.round((stage.count / pipeline.maxStage) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pulse-secondary">
        <div>
          <span>This week</span>
          <strong>{weekly} new</strong>
        </div>
        <div>
          <span>Closing soon</span>
          <strong>{closingSoon} roles</strong>
        </div>
        <div>
          <span>Offer rate</span>
          <strong>{offerRate}%</strong>
        </div>
      </div>
      <div className="pulse-finding">
        <span>{finding || pipeline.finding}</span>
      </div>
      <Link className="pulse-link" to={href}>
        {linkLabel}
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  )
}

export function MostAppliedList({ jobs, limit = 4 }) {
  if (!jobs.length) {
    return (
      <EmptyState
        title="No applications yet"
        text="As soon as candidates start applying, the roles with the most interest will appear here."
      />
    )
  }
  const max = Math.max(1, ...jobs.slice(0, limit).map((job) => job.applicationCount))
  return (
    <div className="bar-list">
      {jobs.slice(0, limit).map((job) => (
        <div className="bar-list-row" key={job.id}>
          <div className="bar-list-head">
            <Link className="bar-list-label" to={`/jobs/${job.id}`}>
              {job.title}
              <span className="sub">{job.company?.name || 'Company'}</span>
            </Link>
            <span className="bar-list-value">{job.applicationCount} applicants</span>
          </div>
          <div className="bar-list-track">
            <span
              className={`bar-list-bar ${job.applicationCount === max ? 'is-top' : ''}`}
              style={{ width: `${Math.max(4, (job.applicationCount / max) * 88)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StageMix({ mix, total }) {
  return (
    <div>
      <div className="stage-mix" role="img" aria-label={`Stage mix for ${total} live applications`}>
        {mix.map((item) => (
          <span
            key={item.stage}
            style={{ width: `${(item.count / Math.max(1, total)) * 100}%` }}
            title={`${item.stage}: ${item.count}`}
          />
        ))}
      </div>
      <div className="legend-table">
        {mix.map((item, index) => (
          <div className="legend-row" key={item.stage}>
            <span
              className={`legend-dot ${index === 0 ? '' : `d${index + 1}`}`}
              aria-hidden="true"
            />
            <span>{item.stage}</span>
            <span className="legend-value">{item.count}</span>
            <span className="legend-share">{item.share}%</span>
          </div>
        ))}
      </div>
      <p className="chart-caption">{formatNumber(total)} live applications across four stages.</p>
    </div>
  )
}

export function ApplicationProgress({ application, stages = ['Applied', 'Screening', 'Interview', 'Offer'] }) {
  const status = application?.status || 'Applied'
  const closed = status === 'Rejected' || status === 'Withdrawn'
  const currentIndex = stages.indexOf(status)
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1" aria-hidden="true">
        {stages.map((stage, index) => {
          const active = !closed && index <= currentIndex
          return (
            <span
              key={stage}
              className={`h-1.5 flex-1 rounded-full ${active ? 'bg-accent' : 'bg-raised'}`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap justify-between gap-1 text-[11px] text-faint">
        {stages.map((stage, index) => (
          <span
            key={stage}
            className={!closed && index <= currentIndex ? 'text-ink' : ''}
          >
            {stage}
          </span>
        ))}
      </div>
      {closed ? (
        <p className="text-xs text-muted">This application is closed as {status.toLowerCase()}.</p>
      ) : null}
    </div>
  )
}
