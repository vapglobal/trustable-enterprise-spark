import { useId, useState } from "react";

type VaultArtworkProps = {
  compact?: boolean;
  animated?: boolean;
};

function VaultArtwork({ compact = false, animated = false }: VaultArtworkProps) {
  const uid = useId().replace(/:/g, "");
  const shieldClip = `${uid}-shield-clip`;
  const steel = `${uid}-steel`;
  const steelDark = `${uid}-steel-dark`;
  const door = `${uid}-door`;
  const heart = `${uid}-heart`;
  const glow = `${uid}-glow`;

  const rivets: Array<[number, number]> = [
    [200, 34], [140, 51], [260, 51], [91, 79], [309, 79],
    [67, 130], [333, 130], [63, 190], [337, 190], [76, 250],
    [324, 250], [104, 304], [296, 304], [147, 346], [253, 346], [200, 371],
  ];

  return (
    <svg viewBox="0 0 400 410" className="h-full w-full" role="img" aria-label="Trustable secure vault shield">
      <defs>
        <clipPath id={shieldClip}>
          <path d="M200 18C155 49 107 57 48 64v123c0 94 52 163 152 207 100-44 152-113 152-207V64c-59-7-107-15-152-46Z" />
        </clipPath>
        <linearGradient id={steel} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--foreground)" />
          <stop offset="0.28" stopColor="var(--steel)" />
          <stop offset="0.55" stopColor="var(--muted-foreground)" />
          <stop offset="0.78" stopColor="var(--foreground)" />
          <stop offset="1" stopColor="var(--steel)" />
        </linearGradient>
        <linearGradient id={steelDark} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--secondary)" />
          <stop offset="0.5" stopColor="var(--background)" />
          <stop offset="1" stopColor="var(--muted)" />
        </linearGradient>
        <radialGradient id={door} cx="42%" cy="30%" r="75%">
          <stop offset="0" stopColor="var(--primary)" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="var(--card)" />
          <stop offset="1" stopColor="var(--background)" />
        </radialGradient>
        <linearGradient id={heart} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--heart)" />
          <stop offset="1" stopColor="var(--heart-deep)" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="var(--heart)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--heart)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {!compact && <ellipse cx="200" cy="391" rx="130" ry="10" fill="var(--background)" opacity="0.75" />}

      <path
        d="M200 18C155 49 107 57 48 64v123c0 94 52 163 152 207 100-44 152-113 152-207V64c-59-7-107-15-152-46Z"
        fill={`url(#${steel})`}
        stroke="var(--foreground)"
        strokeOpacity="0.65"
        strokeWidth="2"
      />
      <path
        d="M200 43C160 68 120 77 72 83v103c0 78 42 137 128 178 86-41 128-100 128-178V83c-48-6-88-15-128-40Z"
        fill={`url(#${steelDark})`}
        stroke="var(--background)"
        strokeWidth="7"
      />

      <g clipPath={`url(#${shieldClip})`}>
        <circle cx="200" cy="197" r="102" fill={`url(#${glow})`} className={animated ? "vault-heart-glow" : undefined} />
        <path
          d="M200 279C128 232 100 192 100 146c0-36 27-61 60-61 18 0 32 7 40 22 8-15 22-22 40-22 33 0 60 25 60 61 0 46-28 86-100 133Z"
          fill={`url(#${heart})`}
          className={animated ? "vault-heart" : undefined}
        />

        <g className={animated ? "vault-door-left" : undefined}>
          <path d="M68 79H200V366c-86-41-128-101-128-180V83Z" fill={`url(#${door})`} />
          <path d="M188 68h12v298c-5-2-8-4-12-6Z" fill="var(--steel)" opacity="0.4" />
        </g>
        <g className={animated ? "vault-door-right" : undefined}>
          <path d="M200 43c40 25 80 34 128 40v103c0 79-42 139-128 180Z" fill={`url(#${door})`} />
          <path d="M200 43h12v317c-4 2-7 4-12 6Z" fill="var(--foreground)" opacity="0.12" />
        </g>
      </g>

      <path
        d="M200 43C160 68 120 77 72 83v103c0 78 42 137 128 178 86-41 128-100 128-178V83c-48-6-88-15-128-40Z"
        fill="none"
        stroke="var(--steel)"
        strokeOpacity="0.78"
        strokeWidth="4"
      />

      {!compact && rivets.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="8.5" fill="var(--background)" opacity="0.7" />
          <circle cx={x} cy={y} r="6.5" fill={`url(#${steel})`} stroke="var(--foreground)" strokeOpacity="0.6" />
          <circle cx={x - 2} cy={y - 2} r="1.6" fill="var(--foreground)" opacity="0.85" />
        </g>
      ))}

      <g className={animated ? "vault-final-lock" : undefined}>
        <circle cx="200" cy="207" r="84" fill="var(--background)" fillOpacity="0.35" stroke="var(--steel)" strokeWidth="5" />
        <circle cx="200" cy="207" r="70" fill="none" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="3 7" />
        <circle cx="200" cy="207" r="84" fill="none" stroke="var(--primary)" strokeOpacity="0.22" strokeWidth="1.5" />
        <path
          d="M152 142h96v28h-35v115h-26V170h-35Z"
          fill="var(--primary)"
          stroke="var(--foreground)"
          strokeOpacity="0.55"
          strokeWidth="2"
        />
        {!compact && (
          <g transform="translate(248 258)">
            <rect x="0" y="16" width="38" height="30" rx="5" fill="var(--background)" stroke="var(--primary)" strokeWidth="3" />
            <path d="M9 17V10a10 10 0 0 1 20 0v7" fill="none" stroke="var(--primary)" strokeWidth="4" />
            <circle cx="19" cy="30" r="3" fill="var(--primary)" />
          </g>
        )}
      </g>
    </svg>
  );
}

/** A vault door opens to reveal the heart, then seals into the Trustable shield. Click to replay. */
export function HeartVault({ size = 420, sealed }: { size?: number; sealed?: boolean }) {
  const [run, setRun] = useState(0);

  return (
    <div
      className={sealed ? "relative shrink-0" : "relative shrink-0 cursor-pointer select-none"}
      style={{ width: `min(${size}px, 92vw)`, aspectRatio: "400 / 410" }}
      data-sealed={sealed ? "true" : undefined}
      title={sealed ? undefined : "Click to replay the Heart-to-Vault animation"}
      onClick={sealed ? undefined : () => setRun((r) => r + 1)}
    >
      <VaultArtwork key={run} animated={!sealed} />
    </div>
  );
}

export function HeartMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className}`} aria-hidden>
      <VaultArtwork compact />
    </span>
  );
}