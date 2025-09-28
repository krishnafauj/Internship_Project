import React from "react";

interface PawnIconProps {
  size?: number; // px
  color?: string; // any valid CSS color
  stroke?: string;
}

export const PawnIcon: React.FC<PawnIconProps> = ({
  size = 28,
  color = "red",
  stroke = "black",
}) => {
  // A simple pawn-like shape: circle head + tapered body
  const viewBox = "0 0 64 64";
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      role="img"
    >
      {/* head */}
      <circle cx="32" cy="16" r="10" fill={color} stroke={stroke} strokeWidth="1.5"/>
      {/* body */}
      <path
        d="M18 44
           C18 36, 46 36, 46 44
           C46 52, 40 56, 32 56
           C24 56, 18 52, 18 44 Z"
        fill={color}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* neck / connector */}
      <rect x="26" y="24" width="12" height="6" rx="2" fill={color} stroke={stroke} strokeWidth="1.2"/>
      {/* base */}
      <ellipse cx="32" cy="58" rx="18" ry="4" fill={stroke} opacity="0.06"/>
    </svg>
  );
};

export default PawnIcon;
