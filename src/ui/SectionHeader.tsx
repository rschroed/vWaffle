import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { cn } from './cn'
import { Stack } from './Stack'

type SectionHeaderProps = {
  actions?: ReactNode
  className?: string
  description?: string
  eyebrow?: string
  title: string
}

export function SectionHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className={cn('ui-section-header', className)}>
      <Stack gap="sm" className="ui-section-copy">
        {eyebrow ? <Badge tone="muted">{eyebrow}</Badge> : null}
        <h2 className="ui-section-title">{title}</h2>
        {description ? (
          <p className="ui-section-description">{description}</p>
        ) : null}
      </Stack>
      {actions ? <div className="ui-section-actions">{actions}</div> : null}
    </div>
  )
}
