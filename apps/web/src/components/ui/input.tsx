import { cn } from "@/lib/utils";
import * as React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("flex h-10 w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-50", className)}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 10,
          color: '#f5f5f7',
          fontSize: 14,
          height: 44,
          padding: '0 14px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box' as const,
          transition: 'border-color 0.2s',
          fontFamily: 'inherit',
          ...style,
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
