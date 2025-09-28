import React from "react";

interface UMatrixProps {
  rows: number;
  cols: number;
  startNum?: number;
  rotation?: number;
  isBlank?: boolean; // for 6x6 empty blocks
}

const UMatrix: React.FC<UMatrixProps> = ({
  rows,
  cols,
  startNum = 0,
  rotation = 0,
  isBlank = false,
}) => {
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  if (!isBlank && startNum) {
    let num = startNum;
    // Right column
    for (let i = 0; i < rows; i++) matrix[i][cols - 1] = num++;
    // Bottom row
    for (let j = cols - 2; j >= 0; j--) matrix[rows - 1][j] = num++;
    // Left column excluding bottom
    for (let i = rows - 2; i >= 0; i--) matrix[i][0] = num++;
  }

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
        display: "inline-block",
        margin: 2,
      }}
    >
      {matrix.map((row, i) => (
        <div key={i} style={{ display: "flex" }}>
          {row.map((cell, j) => (
            <div
              key={j}
              style={{
                width: 30,
                height: 30,
                border: "1px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                backgroundColor: isBlank ? "#cce5ff" : "#f0f0f0", // corner color
              }}
            >
              {cell || ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const LudoBoard: React.FC = () => {
  let currentNum = 1;

  // Define all blocks, marking corners as blank
  const blocks = [
    // First row
    { rows: 6, cols: 6, isBlank: true }, // top-left
    { rows: 6, cols: 3, startNum: currentNum, rotation: 180 }, // top-middle U
    { rows: 6, cols: 6, isBlank: true }, // top-right

    // Second row
    { rows: 3, cols: 6, startNum: currentNum += 6 + 3 + 4, rotation: 90 }, // middle-left U
    { rows: 3, cols: 3, isBlank: true }, // center blank
    { rows: 3, cols: 6, startNum: currentNum += 6 + 6 + 4, rotation: -90 }, // middle-right U

    // Third row
    { rows: 6, cols: 6, isBlank: true }, // bottom-left
    { rows: 6, cols: 3, startNum: currentNum += 3 + 3 + 6, rotation: 0 }, // bottom-middle U
    { rows: 6, cols: 6, isBlank: true }, // bottom-right
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* First row */}
      <div style={{ display: "flex", gap: 4 }}>
        {blocks.slice(0, 3).map((b, i) => (
          <UMatrix key={i} {...b} />
        ))}
      </div>

      {/* Second row */}
      <div style={{ display: "flex", gap: 4 }}>
        {blocks.slice(3, 6).map((b, i) => (
          <UMatrix key={i} {...b} />
        ))}
      </div>

      {/* Third row */}
      <div style={{ display: "flex", gap: 4 }}>
        {blocks.slice(6, 9).map((b, i) => (
          <UMatrix key={i} {...b} />
        ))}
      </div>
    </div>
  );
};

export default LudoBoard;
