import type { ReactNode } from "react";
import { Plane, Route, Users } from "lucide-react";

export type SignKind = "speed" | "phone" | "belt" | "light" | "warning" | "plane" | "route" | "family";

const RED = "#D62828";
const BLUE = "#1D5FB8";

function Square({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="grid h-full w-full place-items-center rounded-[22%] p-[3px] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)]" style={{ background: color }}>
      <span className="grid h-full w-full place-items-center rounded-[18%] ring-2 ring-white/90">{children}</span>
    </span>
  );
}

export function RoadSign({ kind, value = 50, className = "" }: { kind: SignKind; value?: number; className?: string }) {
  if (kind === "plane")
    return (
      <span className={`block ${className}`}>
        <Square color={BLUE}>
          <Plane className="h-[52%] w-[52%] text-white" strokeWidth={2.2} />
        </Square>
      </span>
    );
  if (kind === "route")
    return (
      <span className={`block ${className}`}>
        <Square color="#167A43">
          <Route className="h-[52%] w-[52%] text-white" strokeWidth={2.2} />
        </Square>
      </span>
    );
  if (kind === "family")
    return (
      <span className={`block ${className}`}>
        <Square color={BLUE}>
          <Users className="h-[52%] w-[52%] text-white" strokeWidth={2.2} />
        </Square>
      </span>
    );

  return (
    <svg viewBox="0 0 64 64" className={`block overflow-visible drop-shadow-[0_10px_14px_rgba(0,0,0,0.45)] ${className}`} aria-hidden>
      {kind === "warning" && (
        <>
          <path d="M32 5 61 57H3Z" fill="#fff" stroke={RED} strokeWidth="6" strokeLinejoin="round" />
          <rect x="29.5" y="22" width="5" height="19" rx="2.5" fill="#111" />
          <circle cx="32" cy="48" r="3" fill="#111" />
        </>
      )}
      {(kind === "speed" || kind === "phone") && (
        <>
          <circle cx="32" cy="32" r="31" fill="#fff" />
          <circle cx="32" cy="32" r="26.5" fill="#fff" stroke={RED} strokeWidth="8" />
          {kind === "speed" ? (
            <text x="32" y="40.5" textAnchor="middle" fontSize="23" fontWeight="800" fill="#111" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-0.5">
              {value}
            </text>
          ) : (
            <>
              <rect x="24" y="16" width="16" height="31" rx="3.5" fill="none" stroke="#111" strokeWidth="3.4" />
              <circle cx="32" cy="42" r="1.8" fill="#111" />
              <path d="M17 17 47 47" stroke={RED} strokeWidth="5.5" strokeLinecap="round" />
            </>
          )}
        </>
      )}
      {kind === "belt" && (
        <>
          <circle cx="32" cy="32" r="31" fill={BLUE} />
          <circle cx="32" cy="32" r="27.5" fill="none" stroke="#fff" strokeWidth="2.5" />
          <circle cx="32" cy="18" r="5.5" fill="#fff" />
          <path d="M21 50V35a11 11 0 0 1 22 0v15Z" fill="#fff" />
          <path d="M24.5 27.5 43 48" stroke={BLUE} strokeWidth="4.2" strokeLinecap="round" />
        </>
      )}
      {kind === "light" && (
        <>
          <rect x="18" y="3" width="28" height="58" rx="9" fill="#141B2B" stroke="#3A4560" strokeWidth="2" />
          <circle cx="32" cy="17" r="7.5" fill="#FF3B30" />
          <circle cx="32" cy="17" r="11" fill="#FF3B30" opacity="0.25" />
          <circle cx="32" cy="32" r="7" fill="#5B4A14" />
          <circle cx="32" cy="47" r="7" fill="#14452A" />
        </>
      )}
    </svg>
  );
}
