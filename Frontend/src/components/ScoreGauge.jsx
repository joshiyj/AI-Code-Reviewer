import { useEffect, useState } from "react";

export default function ScoreGauge({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let frame;
    let current = 0;
    const step = () => {
      current += (score - current) * 0.08;
      if (Math.abs(score - current) < 0.5) current = score;
      setDisplayed(Math.round(current));
      if (current < score) frame = requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(step); }, 300);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [score]);

  const color =
    score >= 80
      ? "var(--accent-primary)"
      : score >= 60
      ? "var(--accent-warning)"
      : "var(--accent-danger)";

  const label =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work";

  return (
    <div className="score-gauge">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="8"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.05s ease", filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="70" y="64" textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="Syne, sans-serif">
          {displayed}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="var(--text-secondary)" fontSize="11" fontFamily="JetBrains Mono, monospace">
          {label}
        </text>
      </svg>
    </div>
  );
}
