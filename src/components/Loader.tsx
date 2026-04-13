type LoaderProps = {
  label?: string
  size?: 'sm' | 'md'
  inline?: boolean
}

export default function Loader({ label = 'Loading...', size = 'md', inline = false }: LoaderProps) {
  const wrapperClass = inline ? 'loader-wrap loader-wrap-inline' : 'loader-wrap'
  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <span className={`loader-spinner loader-spinner-${size}`} aria-hidden="true" />
      <span className="loader-label">{label}</span>
    </div>
  )
}
