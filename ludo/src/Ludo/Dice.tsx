import React, { useState } from "react";

interface DiceProps {
  size?: number;
}


const DiceRoller: React.FC<DiceProps> = ({ size = 100 }) => {
  const [value, setValue] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [rolling, setRolling] = useState(false);

  const dot = (cx: number, cy: number) => (
    <circle cx={cx} cy={cy} r={size * 0.08} fill="black" />
  );

  const positions = [
    [0.25, 0.25],
    [0.5, 0.25],
    [0.75, 0.25],
    [0.25, 0.5],
    [0.5, 0.5],
    [0.75, 0.5],
    [0.25, 0.75],
    [0.5, 0.75],
    [0.75, 0.75],
  ];

  const dotsMap: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const rollDice = () => {
    if (rolling) return; // prevent multiple clicks during animation
    setRolling(true);

    let rolls = 10; // number of rapid rolls before final
    const interval = setInterval(() => {
      const rand = (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
      setValue(rand);
      rolls--;
      if (rolls <= 0) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 50);
  };
  console.log(value)
  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={rollDice}
        disabled={rolling}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        {rolling ? "Rolling..." : "Roll Dice"}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{ marginBottom: "10px" }}
        >
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            rx="15"
            fill="white"
            stroke="black"
            strokeWidth="5"
          />
          {dotsMap[value].map((i) =>
            dot(positions[i][0] * 100, positions[i][1] * 100)
          )}
        </svg>
        <br />
      </button>
      <p>{value}</p>
    </div>
  );
};

export default DiceRoller;
