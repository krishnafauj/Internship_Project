import React from "react";
import PawnIcon from "./PawnIcon"; // your pawn svg component

interface Matrix6x6Props {
  borderColor?: string;
  blockColor?: string; // all 4 blocks same color
  spotPawns?: string[][]; // pawns inside each block
}

export const Matrix6x6: React.FC<Matrix6x6Props> = ({
  borderColor = "black",
  blockColor = "#cce5ff",
  spotPawns = [[], [], [], []],
}) => {
  const spotPositions = [
    { top: 0, left: 0 }, // top-left
    { top: 0, right: 0 }, // top-right
    { bottom: 0, left: 0 }, // bottom-left
    { bottom: 0, right: 0 }, // bottom-right
  ];

  return (
    <div
      style={{
        width: 240, // 6 * 40
        height: 240,
        border: `3px solid ${borderColor}`,
        position: "relative",
      }}
    >
      {spotPositions.map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            width: 80, // 2 * 40
            height: 80,
            backgroundColor: blockColor, // all blocks same color
            border: `2px solid ${borderColor}`,
            display: "flex",
            flexWrap: "wrap",
            padding: 4,
            justifyContent: "center",
            alignItems: "center",
            ...pos,
          }}
        >
          {spotPawns[idx].map((color, i) => (
            <PawnIcon key={i} size={28} color={color} />
          ))}
        </div>
      ))}
    </div>
  );
};
