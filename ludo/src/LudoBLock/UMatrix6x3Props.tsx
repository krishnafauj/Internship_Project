import { useState } from "react";
interface UMatrix6x3Props {
    startNum?: number;
    rotation?: number;
    values?: number[][]; // optional override
    onValueChange?: (row: number, col: number, val: number) => void;
  }
  
  export const UMatrix6x3: React.FC<UMatrix6x3Props> = ({
    startNum = 1,
    rotation = 0,
    values,
    onValueChange,
  }) => {
    const [matrix, setMatrix] = useState<number[][]>(
      values || Array.from({ length: 6 }, () => Array(3).fill(0))
    );
  
    // Fill U-shape numbers if no values passed
    if (!values && startNum) {
      let num = startNum;
      // Right column
      for (let i = 0; i < 6; i++) matrix[i][2] = num++;
      // Bottom row
      for (let j = 1; j >= 0; j--) matrix[5][j] = num++;
      // Left column excluding bottom
      for (let i = 4; i >= 0; i--) matrix[i][0] = num++;
    }
  
    const handleChange = (i: number, j: number) => {
      const val = prompt("Enter value:") || "";
      const num = parseInt(val);
      if (!isNaN(num)) {
        const newMatrix = matrix.map((r) => r.slice());
        newMatrix[i][j] = num;
        setMatrix(newMatrix);
        if (onValueChange) onValueChange(i, j, num);
      }
    };
  
    return (
      <div style={{ transform: `rotate(${rotation}deg)`, display: "inline-block" }}>
        {matrix.map((row, i) => (
          <div key={i} style={{ display: "flex" }}>
            {row.map((cell, j) => (
              <div
                key={j}
                style={{
                  width: 40,
                  height: 40,
                  border: "1px solid black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => handleChange(i, j)}
              >
                {cell || ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  // ------------------------- 3x3 Matrix -------------------------
 
  