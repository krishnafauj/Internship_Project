import React from 'react';

const LudoPage = () => {
  const size = 440; // SVG size
  const cell = size / 11; // one grid cell
  const colors = ['red', 'green', 'yellow', 'blue'];

  const getHomePosition = (player: number) => {
    switch (player) {
      case 0: return { x: 0, y: 0 }; // top-left
      case 1: return { x: 7 * cell, y: 0 }; // top-right
      case 2: return { x: 0, y: 7 * cell }; // bottom-left
      case 3: return { x: 7 * cell, y: 7 * cell }; // bottom-right
      default: return { x: 0, y: 0 };
    }
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{ maxWidth: '500px', maxHeight: '500px', margin: 'auto', display: 'block' }}
    >
      {/* Board background */}
      <rect x={0} y={0} width={size} height={size} fill="#f2f2f2" />

      {/* Homes */}
      {colors.map((color, idx) => {
        const pos = getHomePosition(idx);
        return (
          <g key={color}>
            {/* Home square */}
            <rect x={pos.x} y={pos.y} width={4 * cell} height={4 * cell} fill={color} />
            {/* Pawns */}
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={pos.x + cell * (1 + (i % 2) * 2)}
                cy={pos.y + cell * (1 + Math.floor(i / 2) * 2)}
                r={cell / 2.5}
                fill="white"
              />
            ))}
          </g>
        );
      })}

      {/* Central safe area */}
      <rect x={4 * cell} y={4 * cell} width={3 * cell} height={3 * cell} fill="#ccc" />

      {/* Paths */}
      {/* Horizontal paths */}
      {[0, 4, 7].map((row) =>
        Array.from({ length: 11 }).map((_, col) => (
          <rect
            key={`h-${row}-${col}`}
            x={col * cell}
            y={row * cell}
            width={cell}
            height={cell}
            fill={(row === 4 && col > 0 && col < 10) || (row === 7 && col > 0 && col < 10) ? '#eee' : 'none'}
            stroke="#aaa"
          />
        ))
      )}

      {/* Vertical paths */}
      {[0, 4, 7].map((col) =>
        Array.from({ length: 11 }).map((_, row) => (
          <rect
            key={`v-${row}-${col}`}
            x={col * cell}
            y={row * cell}
            width={cell}
            height={cell}
            fill={(col === 4 && row > 0 && row < 10) || (col === 7 && row > 0 && row < 10) ? '#eee' : 'none'}
            stroke="#aaa"
          />
        ))
      )}
    </svg>
  );
};

export default LudoPage;
