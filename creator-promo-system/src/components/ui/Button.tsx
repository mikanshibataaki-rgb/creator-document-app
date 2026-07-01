import type { ComponentType, ButtonHTMLAttributes } from 'react'
import type { LucideProps } from 'lucide-react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ComponentType<LucideProps>
  active?: boolean
}

export function Button({ icon: Icon, active = false, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`button ${active ? 'button-active' : ''} ${className}`} type="button" {...props}>
      {Icon ? <Icon aria-hidden="true" size={18} strokeWidth={1.8} /> : null}
      <span>{children}</span>
    </button>
  )
}
