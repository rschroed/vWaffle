import { type Waffle } from '../../domain/waffles'
import { formatFriendlyTimestamp } from '../../lib/time'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Panel'
import { SectionHeader } from '../../ui/SectionHeader'
import { Stack } from '../../ui/Stack'

type WaffleFeedSectionProps = {
  isLoading: boolean
  onOpenComposer: () => void
  waffles: Waffle[]
}

export function WaffleFeedSection({
  isLoading,
  onOpenComposer,
  waffles,
}: WaffleFeedSectionProps) {
  return (
    <section>
      <Panel as="section" className="feature-panel">
        <Stack gap="lg">
          <SectionHeader
            actions={
              <Button className="feed-mobile-trigger" onClick={onOpenComposer}>
                New waffle
              </Button>
            }
            title="VVAFFLE FEED"
            description="A lightweight stream of appreciation across the team, visible to everyone."
          />

          {isLoading ? (
            <Panel className="feed-state" tone="subtle">
              Loading the shared feed...
            </Panel>
          ) : waffles.length === 0 ? (
            <Panel className="feed-state" tone="subtle">
              No waffles yet. Send the first one to start the feed.
            </Panel>
          ) : (
            <div className="feed-list" role="list">
              {waffles.map((waffle) => (
                <Panel
                  as="article"
                  className="feed-card"
                  key={waffle.id}
                  role="listitem"
                  tone="subtle"
                >
                  <div className="feed-card-top">
                    <Badge>{waffle.flavor}</Badge>
                    <time className="feed-card-time" dateTime={waffle.createdAt}>
                      {formatFriendlyTimestamp(waffle.createdAt)}
                    </time>
                  </div>
                  <Stack gap="sm">
                    <h3 className="feed-card-title">
                      {waffle.sender.name}
                      {' '}
                      sent a waffle to
                      {' '}
                      {waffle.recipient.name}
                    </h3>
                    <p className="feed-card-message">{waffle.message}</p>
                  </Stack>
                </Panel>
              ))}
            </div>
          )}
        </Stack>
      </Panel>
    </section>
  )
}
