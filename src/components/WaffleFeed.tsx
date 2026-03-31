import { type Waffle } from '../domain/waffles'
import { formatFriendlyTimestamp } from '../lib/time'

type WaffleFeedProps = {
  waffles: Waffle[]
}

export function WaffleFeed({ waffles }: WaffleFeedProps) {
  return (
    <section className="panel feed-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Live-ish feed</p>
          <h2>Team waffles in the wild</h2>
        </div>
        <p className="panel-copy">
          Seeded demo data gives the app an instant story, while the repository
          contract keeps future persistence work nicely boxed in.
        </p>
      </div>

      <div className="feed-list" role="list">
        {waffles.map((waffle) => (
          <article className="feed-card" key={waffle.id} role="listitem">
            <div className="feed-card-top">
              <span className="flavor-pill">{waffle.flavor}</span>
              <time dateTime={waffle.createdAt}>
                {formatFriendlyTimestamp(waffle.createdAt)}
              </time>
            </div>
            <h3>
              {waffle.sender.name}
              {' '}
              sent a waffle to
              {' '}
              {waffle.recipient.name}
            </h3>
            <p>{waffle.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
