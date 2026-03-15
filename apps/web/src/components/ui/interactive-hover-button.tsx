import React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  variant?: "gold" | "dark" | "white"
}

const InteractiveHoverButton = React.forwardRef<HTMLButtonElement, InteractiveHoverButtonProps>(
  ({ text = "Explore Store", className, variant = "gold", ...props }, ref) => {
    const baseColor =
      variant === "gold" ? "bg-[#D4AF37]" :
      variant === "dark" ? "bg-[#1d1d1f]" :
      "bg-white"

    const textColor =
      variant === "gold" ? "text-black" :
      variant === "dark" ? "text-white" :
      "text-black"

    const hoverBg =
      variant === "gold" ? "bg-[#D4AF37]" :
      variant === "dark" ? "bg-[#1d1d1f]" :
      "bg-white"

    return (
      <button
        ref={ref}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-full border border-transparent px-6 py-2.5 text-center font-semibold transition-all duration-300",
          baseColor,
          textColor,
          variant === "gold" && "border-[#D4AF37]",
          variant === "dark" && "border-white/10",
          variant === "white" && "border-white/20",
          className,
        )}
        {...props}
      >
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {text}
        </span>
        <div
          className={cn(
            "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100",
            textColor,
          )}
        >
          <span>{text}</span>
          <ArrowRight size={16} />
        </div>
        <div
          className={cn(
            "absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-full transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]",
            hoverBg,
            "opacity-20 group-hover:opacity-100",
          )}
        />
      </button>
    )
  }
)

InteractiveHoverButton.displayName = "InteractiveHoverButton"

export { InteractiveHoverButton }
