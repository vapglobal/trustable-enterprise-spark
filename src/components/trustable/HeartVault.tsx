import { useEffect, useState } from "react";

/** Heart-to-Vault mark: Lovable heart core inside a forming trust boundary. */
export function HeartVault({ size = 420, sealed: sealedProp }: { size?: number; sealed?: boolean }) {
  const [sealed, setSealed] = useState(sealedProp ?? false);
  useEffect(() => {
    if (sealedProp !== undefined) return setSealed(sealedProp);
    const t = setTimeout(() => setSealed(true), 900);
    return () => clearTimeout(t);
  }, [sealedProp]);

  const gap = sealed ? 0 : 22;
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="hv-heart" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--heart-2)" />
            <stop offset="100%" stopColor="var(--heart)" />
          </linearGradient>
          <linearGradient id="hv-steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--steel)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.75" />
          </linearGradient>
          <radialGradient id="hv-glow">
            <stop offset="0%" stopColor="var(--heart)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--heart)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="none" stroke="var(--vault)" strokeOpacity="0.12" strokeDasharray="2 6" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="var(--vault)" strokeOpacity="0.08" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="var(--vault)" strokeOpacity="0.08" />
        <g style={{ transformOrigin: "200px 200px", animation: "spin-slow 60s linear infinite" }}>
          <circle cx="200" cy="200" r="150" fill="none" stroke="var(--vault)" strokeOpacity="0.35" strokeDasharray="1 10" />
        </g>
        <circle cx="200" cy="200" r="118" fill="none" stroke="var(--vault)" strokeWidth="1.5" style={{ animation: "glow 3.2s ease-in-out infinite" }} />
        <circle cx="200" cy="200" r="120" fill="url(#hv-glow)" />
        {[0, 90, 180, 270].map((rot) => (
          <g key={rot} transform={`rotate(${rot} 200 200)`}>
            <path
              d="M 200 62 L 322 184"
              stroke="url(#hv-steel)"
              strokeWidth="12"
              strokeLinecap="round"
              style={{
                transform: `translate(${gap * 0.7}px, ${-gap * 0.7}px)`,
                transition: "transform 1.1s cubic-bezier(.2,.8,.2,1)",
              }}
            />
          </g>
        ))}
        {[
          [200, 58],
          [342, 200],
          [200, 342],
          [58, 200],
        ].map(([x, y], i) => (
          <g key={i} style={{ opacity: sealed ? 1 : 0.4, transition: "opacity 1s" }}>
            <circle cx={x} cy={y} r="16" fill="var(--card)" stroke="var(--steel)" strokeOpacity="0.8" strokeWidth="2" />
            <circle cx={x} cy={y} r="7" fill="var(--steel)" fillOpacity="0.8" />
            <circle cx={x} cy={y} r="20" fill="none" stroke="var(--vault)" strokeOpacity={sealed ? 0.6 : 0} />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" style={{ width: size * 0.3, animation: "pulse-heart 1.6s ease-in-out infinite" }}>
          <path
            d="M50 88 C 20 68, 6 50, 6 32 C 6 18, 17 8, 30 8 C 39 8, 46 13, 50 20 C 54 13, 61 8, 70 8 C 83 8, 94 18, 94 32 C 94 50, 80 68, 50 88 Z"
            fill="url(#hv-heart2)"
          />
          <defs>
            <linearGradient id="hv-heart2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--heart-2)" />
              <stop offset="100%" stopColor="var(--heart)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function HeartMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="hm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--heart-2)" />
          <stop offset="100%" stopColor="var(--heart)" />
        </linearGradient>
      </defs>
      <path d="M50 88 C 20 68, 6 50, 6 32 C 6 18, 17 8, 30 8 C 39 8, 46 13, 50 20 C 54 13, 61 8, 70 8 C 83 8, 94 18, 94 32 C 94 50, 80 68, 50 88 Z" fill="url(#hm)" />
    </svg>
  );
}
