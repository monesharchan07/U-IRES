export default function Panel({ title, subtitle, actions, children, className = '', bodyClassName = '', corners = false }) {
  return (
    <section className={`glass hud-corners ${corners ? '' : ''} ${className}`}>
      {corners && <span className="corner-br" />}
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0">
            <h2 className="label-cap !text-[10px] !tracking-[0.22em] text-neon/90">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[11px] text-faint font-tech">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`px-4 pb-4 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
