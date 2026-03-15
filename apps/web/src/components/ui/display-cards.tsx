"use client";

import { cn } from "@/lib/utils";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconBg?: string;
  titleColor?: string;
}

function DisplayCard({
  className,
  icon,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconBg = "rgba(212,175,55,0.15)",
  titleColor = "#D4AF37",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] select-none flex-col justify-between rounded-xl px-4 py-3 transition-all duration-700",
        className
      )}
      style={{
        transform: "skewY(-8deg)",
        background: "rgba(255,255,255,0.04)",
        border: "1.5px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Gradient fade on right edge */}
      <div style={{
        position: "absolute", right: -1, top: "-5%",
        height: "110%", width: "8rem",
        background: "linear-gradient(to left, #000 0%, transparent 100%)",
        pointerEvents: "none", borderRadius: "0 12px 12px 0",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: "50%",
          background: iconBg, flexShrink: 0,
        }}>
          {icon}
        </span>
        <p style={{ fontSize: 16, fontWeight: 700, color: titleColor }}>{title}</p>
      </div>

      <p style={{ fontSize: 15, color: "#f5f5f7", whiteSpace: "nowrap" }}>{description}</p>

      <p style={{ fontSize: 12, color: "#555" }}>{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards: DisplayCardProps[] = [
    { className: "hover:-translate-y-10 grayscale hover:grayscale-0" },
    { className: "translate-x-16 translate-y-10 hover:-translate-y-1 grayscale hover:grayscale-0" },
    { className: "translate-x-32 translate-y-20 hover:translate-y-10" },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div style={{
      display: "grid",
      placeItems: "center",
    }}
    className="[grid-template-areas:'stack'] animate-in fade-in-0 duration-700"
    >
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
