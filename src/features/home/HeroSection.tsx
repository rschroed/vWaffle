import { vvaffleLogoSrc } from '../../assets/vvaffleLogo'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Panel'
import { Stack } from '../../ui/Stack'

type HeroSectionProps = {
  tagline: string
  figmaFileUrl?: string
  onOpenComposer: () => void
}

export function HeroSection({
  tagline,
  figmaFileUrl,
  onOpenComposer,
}: HeroSectionProps) {
  return (
    <section className="hero-section">
      <Panel as="section" className="hero-panel">
        <Stack gap="lg">
          <img className="hero-logo" alt="vvaffle logo" src={vvaffleLogoSrc} />

          <p className="hero-tagline">{tagline}</p>

          <div className="hero-actions">
            <Button className="hero-mobile-trigger" onClick={onOpenComposer} variant="primary">
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
