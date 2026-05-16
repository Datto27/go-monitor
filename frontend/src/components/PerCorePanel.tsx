import React from "react";
import { Cpu } from "lucide-react";

type Props = {
  cores: number[];
};

const coreColor = (pct: number) => {
  if (pct < 40) return "#94e864";
  if (pct < 60) return "#e3e352";
  if (pct < 80) return "#e3ae52";
  return "#e35952";
};

const PerCorePanel = ({ cores }: Props) => {
  if (!cores || cores.length === 0) return null;

  return (
    <div className="chartCard">
      <h2 className="chartTitle">
        <Cpu style={{ width: "20px", height: "20px", color: "#3b82f6", marginRight: "8px" }} />
        Per-Core CPU Usage
      </h2>
      <div className="perCoreGrid">
        {cores.map((pct, i) => (
          <div key={i} className="coreItem">
            <div className="coreLabel">Core {i}</div>
            <div className="coreBar">
              <div
                className="coreBarFill"
                style={{ width: `${pct}%`, backgroundColor: coreColor(pct) }}
              />
            </div>
            <div className="coreValue">{pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerCorePanel;
