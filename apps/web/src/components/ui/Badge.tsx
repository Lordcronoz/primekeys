import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'gold' | 'green' | 'red' | 'neutral'
}

export function Badge({ 
  children, 
  variant = 'gold',
  className = '',
  ...props 
}: BadgeProps) {
  
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
  
  const variants = {
    gold: "bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[rgba(212,175,55,0.2)]",
    green: "bg-[rgba(45,204,110,0.1)] text-[#2dcc6e] border border-[rgba(45,204,110,0.2)]",
    red: "bg-[rgba(255,68,68,0.1)] text-[#ff4444] border border-[rgba(255,68,68,0.2)]",
    neutral: "bg-[rgba(255,255,255,0.05)] text-[#999999] border border-[rgba(255,255,255,0.05)]"
  }
  
  const classes = [base, variants[variant], className].filter(Boolean).join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
