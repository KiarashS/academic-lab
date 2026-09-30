export default function Tag({ children, active, onClick }) {
  const base = 'inline-block rounded-full px-2.5 py-0.5 text-xs transition-colors'
  const look = active
    ? 'bg-accent text-white dark:text-neutral-950'
    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800/70 dark:text-neutral-400'
  if (!onClick) return <span className={`${base} ${look}`}>{children}</span>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${base} ${look} cursor-pointer ${active ? '' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
    >
      {children}
    </button>
  )
}
