import React from "react";
import { Thermometer, Wind } from "lucide-react";
import { SensorT, FanT } from "../types";

type Props = {
  sensors: SensorT[];
  fans: FanT[];
};

const tempColor = (temp: number) => {
  if (temp < 45) return "#94e864";
  if (temp < 55) return "#e3e352";
  if (temp < 70) return "#e3ae52";
  if (temp < 85) return "#e35952";
  return "#c20a0a";
};

const CATEGORY_LABELS: Record<string, string> = {
  cpu: "CPU",
  gpu: "GPU",
  disk: "Disk",
  system: "System",
  other: "Other",
};

const CATEGORY_ORDER = ["cpu", "gpu", "disk", "system", "other"];

const SensorsPanel = ({ sensors, fans }: Props) => {
  if (sensors.length === 0 && fans.length === 0) return null;

  const grouped: Record<string, SensorT[]> = {};
  for (const s of sensors) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]);

  return (
    <div className="chartCard">
      <h2 className="chartTitle">
        <Thermometer style={{ width: "20px", height: "20px", color: "#ef4444", marginRight: "8px" }} />
        Sensors &amp; Fans
      </h2>
      <div className="sensorsGrid">
        {orderedCategories.map((cat) => (
          <div key={cat} className="sensorGroup">
            <div className="sensorGroupTitle">{CATEGORY_LABELS[cat]}</div>
            {grouped[cat].map((s) => (
              <div key={s.key} className="sensorRow">
                <span className="sensorKey">{s.key}</span>
                <span
                  className="tempBadge"
                  style={{ backgroundColor: tempColor(s.temperature) }}
                >
                  {s.temperature.toFixed(1)}°C
                </span>
              </div>
            ))}
          </div>
        ))}
        {fans.length > 0 && (
          <div className="sensorGroup">
            <div className="sensorGroupTitle">
              <Wind style={{ width: "14px", height: "14px", display: "inline", marginRight: "4px" }} />
              Fans
            </div>
            {fans.map((f, i) => (
              <div key={i} className="sensorRow">
                <span className="sensorKey">{f.label}</span>
                <span className="rpmBadge">{f.rpm} RPM</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorsPanel;
