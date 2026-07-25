const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* лесная сцена */}
      <div
        className="hero-scene absolute inset-0 z-0"
        style={{ animation: 'hero-scene-in 1.6s ease both' }}
      />
      {/* топографическая сетка */}
      <div className="hero-grid absolute inset-0 z-[1]" />

      <div className="relative z-[2] mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-12 pt-28 md:px-10 md:pt-32">
        <div className="flex flex-1 flex-col justify-center" style={{ maxWidth: 780 }}>
          <span
            className="mb-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-accent-hero"
            style={{ animation: 'hero-rise 0.8s ease 0.15s both' }}
          >
            <span className="inline-block h-px w-10 bg-hero-accent" />
            Личный дневник охотника
          </span>

          <h1 className="font-head text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-hero-text sm:text-6xl md:text-7xl lg:text-[5.4rem]">
            <span className="block overflow-hidden">
              <span className="block" style={{ animation: 'hero-reveal 1s cubic-bezier(.22,.9,.24,1) 0.25s both' }}>
                Каждая охота&nbsp;—
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block" style={{ animation: 'hero-reveal 1s cubic-bezier(.22,.9,.24,1) 0.38s both' }}>
                от&nbsp;выхода в&nbsp;угодья
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block" style={{ animation: 'hero-reveal 1s cubic-bezier(.22,.9,.24,1) 0.51s both' }}>
                до&nbsp;<em className="font-semibold not-italic text-hero-accent">трофея в&nbsp;учёте</em>
              </span>
            </span>
          </h1>

          <p
            className="mt-6 max-w-lg text-lg leading-relaxed text-hero-muted"
            style={{ animation: 'hero-rise 0.9s ease 0.62s both' }}
          >
            Ведите календарь выездов, считайте бюджет и храните учёт оружия —
            <b className="font-semibold text-hero-text"> весь ваш охотничий дневник под рукой</b> в одном приложении.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-6"
            style={{ animation: 'hero-rise 0.9s ease 0.74s both' }}
          >
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-4 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(217,154,63,0.4)]"
            >
              Завести карточку охотника
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <p className="max-w-[190px] text-sm leading-snug text-hero-muted">
              Анкета на <b className="font-semibold text-hero-text">2 минуты</b> — и открывается кабинет.
            </p>
          </div>
        </div>

        <footer
          className="flex items-end text-sm tracking-wide text-hero-muted"
          style={{ animation: 'hero-rise 1s ease 0.9s both' }}
        >
          <span className="flex items-center gap-2.5">
            <span
              className="inline-block h-[7px] w-[7px] rounded-full bg-hero-accent"
              style={{ animation: 'hero-pulse 2.6s ease-in-out infinite' }}
            />
            Личный дневник для каждого охотника
          </span>
        </footer>
      </div>
    </section>
  );
};

export default Hero;