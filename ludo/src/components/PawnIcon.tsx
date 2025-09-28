// src/components/PawnIcon.tsx
import React from "react";

interface Props {
  size: number;
  color: string;
}

const PawnIcon: React.FC<Props> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      border: "2px solid #333",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    }}
  >
    <div
      style={{
        width: size * 0.3,
        height: size * 0.3,
        borderRadius: "50%",
        backgroundColor: "#fff",
      }}
    />
  </div>
);

export default PawnIcon;
