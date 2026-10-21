import { formatDate } from '../../lib/format'

export function PageFooter({ directorySource = 'dummyjson', directoryUpdatedAt = null }) {
  return (
    <footer className="app-foot">
      <span>Hireline demo · all writes stay in this browser</span>
      <span>
        <span className="source-dot" />
        {directorySource === 'offline' ? 'Offline directory' : 'Directory via DummyJSON'}
        {directoryUpdatedAt ? ` · updated ${formatDate(directoryUpdatedAt)}` : ''}
      </span>
    </footer>
  )
}
