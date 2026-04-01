import type { SelectHTMLAttributes } from 'react'
import { cn } from './cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, ...props }: SelectProps) {
  return <select className={cn('ui-control', className)} {...props} />
}
