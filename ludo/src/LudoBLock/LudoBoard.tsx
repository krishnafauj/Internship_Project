import DiceRoller from "../Ludo/DiceRoller";
import { Matrix3x3 } from "./Matrix3x3";
import { Matrix6x6 } from "./Matrix6x6Props";
import { UMatrix6x3 } from "./UMatrix6x3Props";

export const LudoBoard: React.FC = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column" }}
      className="ml-10"
    >
      {/* First row: 6x6 | 6x3 | 6x6 */}
      <div style={{ display: "flex", gap: 4 }}>
        <Matrix6x6 blockColor="#d32f2f" />
        <div className="ml-10 mr-10">
          <UMatrix6x3 startNum={26} rotation={180} />
        </div>
        <Matrix6x6 blockColor="#1976d2" />
      </div>

      {/* Second row: 3x6 | 3x3 | 3x6 */}
      <div style={{ display: "flex", gap: 4 }}>
        <div className="ml-16 mr-10">
          <UMatrix6x3 startNum={13} rotation={90} />
        </div>
        <div className="mt-15 mr-10 ml-14">
          <Matrix3x3 color="#ffff" />
        </div>
        <div className="ml-15">
          <UMatrix6x3 startNum={39} rotation={-90} />
        </div>
      </div>

      {/* Third row: same as first */}
      <div style={{ display: "flex", gap: 4 }}>
        <Matrix6x6 blockColor="#388e3c" />
        <div className="ml-10 mr-10">
          <UMatrix6x3 startNum={1} rotation={0} />
        </div>
        <Matrix6x6 blockColor="#b59f3b" />
      </div>
    </div>
  );
};
