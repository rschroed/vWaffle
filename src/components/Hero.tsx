type HeroProps = {
  tagline: string
  figmaFileUrl?: string
  sentCount: number
}

export function Hero({ tagline, figmaFileUrl, sentCount }: HeroProps) {
  return (
    <section className="hero-card">
      <div className="eyebrow-row">
        <span className="eyebrow">Lunch-and-learn demo</span>
        <span className="eyebrow eyebrow-sunrise">{sentCount} waffles on deck</span>
      </div>
      <h1>Send a waffle. Spark a smile. Ship the prototype.</h1>
      <p className="hero-copy">
        {tagline}
        {' '}
        vWaffle keeps the architecture tiny on purpose so the team can focus on
        agentic coding, design round-trips, and a little bit of syrupy chaos.
      </p>
      <div className="hero-actions">
        <a className="button button-primary" href="#composer">
          Send a waffle
        </a>
        {figmaFileUrl ? (
          <a
            className="button button-secondary"
            href={figmaFileUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open the Figma source
          </a>
        ) : (
          <span className="inline-note">
            Add <code>VITE_FIGMA_FILE_URL</code> to wire up the round-trip.
          </span>
        )}
      </div>
    </section>
  )
}
