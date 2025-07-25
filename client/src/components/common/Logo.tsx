interface LogoProps {
  width: number;
  height: number;
}

export default function Logo({ width, height }: LogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" aria-label="Ken Harmon Logo">
      <defs>
        <radialGradient id="sunGradient" cx="0.2" cy="0.2" r="0.5">
          <stop offset="0" stopColor="#00d5be"/>
          <stop offset="1" stopColor="#312c85"/>
        </radialGradient>
        <linearGradient id="letterGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00d5be"/>
          <stop offset="1" stopColor="#FFFFFF"/>
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="100" height="100" fill="url(#sunGradient)"/>

      <g fill="#00d5be" stroke="#00d5be" strokeWidth="2">
        <circle cx="20" cy="20" r="10"/>
        <line x1="20" y1="7" x2="20" y2="2"/>
        <line x1="11" y1="29" x2="7" y2="33"/>
        <line x1="7" y1="20" x2="2" y2="20"/>
        <line x1="29" y1="29" x2="33" y2="33"/>
        <line x1="20" y1="33" x2="20" y2="38"/>
        <line x1="29" y1="11" x2="33" y2="7"/>
        <line x1="33" y1="20" x2="38" y2="20"/>
        <line x1="11" y1="11" x2="7" y2="7"/>
      </g>

      <text x="60" y="80" fontFamily="Arial, sans-serif" fontSize="60" fontWeight="500"
            fill="url(#letterGradient)" textAnchor="middle" dy=".3em">KH
      </text>
    </svg>
  )
}