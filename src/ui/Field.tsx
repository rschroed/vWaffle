import type { ReactNode } from 'react'
import { cn } from './cn'

type FieldProps = {
  children: ReactNode
  className?: string
  hint?: string
  htmlFor: string
  label: string
}

export function Field({
  children,
  className,
  hint,
  htmlFor,
  label,
}: FieldProps) {
  return (
    <label className={cn('ui-field', className)} htmlFor={htmlFor}>
      <span className="ui-field-label">{label}</span>
      {hint ? <span className="ui-field-hint">{hint}</span> : null}
      {children}
    </label>
  )
}
