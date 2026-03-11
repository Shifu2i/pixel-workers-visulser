import { useEffect, useRef, useState } from 'react'

interface Props {
  activity: string[]
}

export function ActivityTicker({ activity }: Props) {
  const displayed = activity.slice(0, 3)

  return (
    <div className="activity-ticker">
      {displayed.map((line, i) => (
        <TickerLine key={`${line}-${i}`} line={line} isNew={i === 0} />
      ))}
    </div>
  )
}

function TickerLine({ line, isNew }: { line: string; isNew: boolean }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Force reflow then animate in
    const frame = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // Parse "label: detail"
  const colonIdx = line.indexOf(': ')
  const label = colonIdx >= 0 ? line.slice(0, colonIdx) : ''
  const detail = colonIdx >= 0 ? line.slice(colonIdx + 2) : line

  return (
    <div
      ref={ref}
      className="ticker-line"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 200ms linear, opacity 200ms linear',
      }}
    >
      <span className="ticker-prefix">▸ </span>
      {label && <span className="ticker-label">{label}</span>}
      {label && <span className="ticker-separator">: </span>}
      <span className="ticker-detail">{detail}</span>
    </div>
  )
}
