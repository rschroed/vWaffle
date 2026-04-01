import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Panel'
import { Stack } from '../../ui/Stack'

type HeroSectionProps = {
  tagline: string
  figmaFileUrl?: string
  sentCount: number
}

export function HeroSection({
  tagline,
  figmaFileUrl,
  sentCount,
}: HeroSectionProps) {
  return (
    <section className="hero-section">
      <Panel as="section" className="hero-panel">
        <Stack gap="lg">
          <div className="hero-badges">
            <Badge>Peer recognition</Badge>
            <Badge tone="muted">{sentCount} waffles shared</Badge>
          </div>

          <Stack gap="md">
            <h1 className="hero-title">Recognition that stays visible.</h1>
            <p className="hero-copy">
              {tagline}
              {' '}
              vvaffle helps small teams celebrate everyday contributions in one
              shared place, so appreciation is easy to give and easy to see.
            </p>
          </Stack>

          <div className="hero-actions">
            <Button href="#composer" variant="primary">
              Send a waffle
            </Button>
            {figmaFileUrl ? (
              <Button href={figmaFileUrl} rel="noreferrer" target="_blank">
                Open Figma wireframe
              </Button>
            ) : null}
          </div>
        </Stack>
      </Panel>
    </section>
  )
}
