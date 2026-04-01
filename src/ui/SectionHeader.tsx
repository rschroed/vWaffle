import { Badge } from './Badge'
import { Stack } from './Stack'

type SectionHeaderProps = {
  description?: string
  eyebrow?: string
  title: string
}

export function SectionHeader({
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <Stack gap="sm" className="ui-section-header">
      {eyebrow ? <Badge tone="muted">{eyebrow}</Badge> : null}
      <h2 className="ui-section-title">{title}</h2>
      {description ? <p className="ui-section-description">{description}</p> : null}
    </Stack>
  )
}
