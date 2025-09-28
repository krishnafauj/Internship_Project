// src/components/Matrix3x3.tsx
import React from "react";
import PawnIcon from "./PawnIcon";

interface Props {
  matrix: (string | null)[][];
  cellSize?: number;
}

export const Matrix3x3: React.FC<Props> = ({ matrix, cellSize = 50 }) => {
  return (
    <div style={{ display: "grid", gridTemplateRows: `repeat(${matrix.length}, ${cellSize}px)`, gridTemplateColumns: `repeat(${matrix[0].length}, ${cellSize}px)` }}>
      {matrix.flat().map((color, idx) => (
        <div key={idx} style={{ border: "1px solid #333", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {color && <PawnIcon size={cellSize * 0.6} color={color} />}
        </div>
      ))}
    </div>
  );
};
