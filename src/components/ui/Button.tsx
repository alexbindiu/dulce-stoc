import React from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'caramel'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const V: Record<Variant, string> = {
  primary: 'bg-brown text-white border-brown hover:bg-brown-mid',
  caramel: 'bg-caramel text-white border-caramel hover:bg-amber-700',
  ghost:   'bg-transparent text-muted border-border hover:text-brown hover:border-brown-soft',
  danger:  'bg-transparent text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500',
}

const S: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-3   text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center gap-1.5 font-medium border rounded-md',
        'transition-all duration-200 active:scale-[0.97] disabled:active:scale-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        V[variant], S[size], className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
