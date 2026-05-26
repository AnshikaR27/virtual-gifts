'use client';

export function CrochetRose() {
  return (
    <svg
      className="garland-rosette"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFB8C4"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(72 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(144 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFB8C4"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(216 11 11)"
      />
      <ellipse
        cx="11"
        cy="6"
        rx="4.5"
        ry="3.5"
        fill="#FFC0CB"
        stroke="#F0AEBB"
        strokeWidth="0.6"
        transform="rotate(288 11 11)"
      />
      <circle
        cx="11"
        cy="11"
        r="3"
        fill="#FFAEC9"
        stroke="#E89AB0"
        strokeWidth="0.5"
      />
      <path
        d="M11,9.5 Q12.5,10.5 12,11.5 Q11,12.5 10,11.5 Q9.5,10.5 11,9.5"
        fill="#FF98B5"
        opacity="0.5"
      />
    </svg>
  );
}

export function GarlandLeaf({
  flip = false,
  dark = false,
}: {
  flip?: boolean;
  dark?: boolean;
}) {
  return (
    <svg
      className="garland-leaf"
      viewBox="0 0 14 8"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M1,4 Q4,0.5 7,0.5 Q10,0.5 13,4 Q10,7.5 7,7.5 Q4,7.5 1,4Z"
        fill={dark ? '#7DA178' : '#8B9F80'}
        stroke={dark ? '#6B9068' : '#7A8E70'}
        strokeWidth="0.5"
      />
      <path
        d="M2,4 Q7,3.5 12,4"
        stroke={dark ? '#6B9068' : '#7A8E70'}
        strokeWidth="0.4"
        fill="none"
      />
    </svg>
  );
}
