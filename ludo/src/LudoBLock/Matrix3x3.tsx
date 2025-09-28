interface Matrix3x3Props {
    color?: string;
  }
  
  export const Matrix3x3: React.FC<Matrix3x3Props> = ({ color = "transparent" }) => {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: "flex" }}>
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                style={{
                  width: 40,
                  height: 40,
                  border: "1px solid black",
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };