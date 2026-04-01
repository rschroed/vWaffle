import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from './cn'

type CommonProps = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button(props: ButtonProps) {
  const { children, className, variant = 'secondary', href, ...rest } =
    props as ButtonProps & Record<string, unknown>
  const classes = cn('ui-button', `ui-button--${variant}`, className)

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classes}
      type="button"
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
