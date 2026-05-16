import React from "react";
import { HardDrive } from "lucide-react";
import { DiskStatsT } from "../types";
import CircularProgress from "./CirclePorgress";

type Props = {
  diskStats: DiskStatsT | null;
};

const diskColor = (pct: number) => {
  if (pct < 60) return "#10b981";
  if (pct < 80) return "#e3ae52";
  return "#e35952";
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

const DiskPanel = ({ diskStats }: Props) => {
  if (!diskStats || diskStats.partitions.length === 0) return null;

  return (
    <div className="chartCard">
      <h2 className="chartTitle">
        <HardDrive style={{ width: "20px", height: "20px", color: "#f59e0b", marginRight: "8px" }} />
        Disk Usage
      </h2>
      <div className="diskGrid">
        {diskStats.partitions.map((p) => (
          <div key={p.mountpoint} className="diskCard">
            <div className="diskCardHeader">
              <span className="diskMountpoint">{p.mountpoint}</span>
              <span className="diskFstype">{p.fstype}</span>
            </div>
            <div className="diskCardContent">
              <CircularProgress
                percentage={p.usedPercent}
                color={diskColor(p.usedPercent)}
                label={p.mountpoint}
                value={`${p.used}GB`}
                unit="%"
                size={100}
              />
              <div className="diskDetails">
                <div className="diskDetailRow">
                  <span className="detailLabel">Used</span>
                  <span className="detailValue">{p.used} GB</span>
                </div>
                <div className="diskDetailRow">
                  <span className="detailLabel">Free</span>
                  <span className="detailValue">{p.free} GB</span>
                </div>
                <div className="diskDetailRow">
                  <span className="detailLabel">Total</span>
                  <span className="detailValue">{p.total} GB</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {diskStats.io && diskStats.io.length > 0 && (
        <div className="diskIOSection">
          <h3 className="diskIOTitle">Disk I/O</h3>
          <table className="diskIOTable">
            <thead>
              <tr>
                <th>Device</th>
                <th>Read</th>
                <th>Written</th>
                <th>Reads</th>
                <th>Writes</th>
              </tr>
            </thead>
            <tbody>
              {diskStats.io.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{formatBytes(d.readBytes)}</td>
                  <td>{formatBytes(d.writeBytes)}</td>
                  <td>{d.readCount.toLocaleString()}</td>
                  <td>{d.writeCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiskPanel;
