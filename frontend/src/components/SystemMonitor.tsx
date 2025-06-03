import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Monitor, Cpu, HardDrive } from "lucide-react";
import { Test } from "../../wailsjs/go/main/App";
import InfoCard from "./InfoCard";
import CircularProgress from "./CirclePorgress";

type StatsT = {
  totalMemory: number;
  memoryAvailable: number;
  memoryUsed: number;
  memoryPercentage: number;
  cpu: number;
  cpuPercentage: number;
  cpuThreads: number;
  cpuModel: string;
  cpuCores: number;
  cpuModelName: string;
  cpuGhz: number;
  cpuCacheSize: number;
};

type CpuHistorySegmentT = {
  time: string;
  usage: number;
};

const SystemMonitor = () => {
  const [stats, setStats] = useState<StatsT | null>(null);
  const [cpuHistory, setCpuHistory] = useState<CpuHistorySegmentT[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      Test().then((res) => {
        setStats(res);

        setCpuHistory((prev) => {
          const newHistory = [
            ...prev.slice(-49),
            { time: timeStr, usage: res.cpuPercentage },
          ];
          return newHistory;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={"container"}>
      <div className={"maxWidth"}>
        <div className={"header"}>
          <h1 className={"headerTitle"}>
            <Monitor
              style={{ width: "32px", height: "32px", color: "#3b82f6" }}
            />
            Go-Monitor Dashboard
          </h1>
          <p className={"headerSubtitle"}>
            Real-time system performance monitoring
          </p>
        </div>
        <div className={"progressGrid"}>
          <div className={"progressCard"}>
            <h2 className={"progressCardTitle"}>
              <Cpu
                style={{ width: "20px", height: "20px", color: "#3b82f6" }}
              />
              CPU Usage
            </h2>
            <div className={"progressCardContent"}>
              <CircularProgress
                percentage={stats?.cpuPercentage}
                color="#3b82f6"
                label="CPU Load"
                value={`${stats?.cpuPercentage}`}
                unit="%"
                size={140}
              />
            </div>
          </div>
          <div className={"progressCard"}>
            <h2 className={"progressCardTitle"}>
              <HardDrive
                style={{ width: "20px", height: "20px", color: "#10b981" }}
              />
              Memory Usage
            </h2>
            <div className={"progressCardContent"}>
              <CircularProgress
                percentage={stats?.memoryPercentage}
                color="#10b981"
                label="Memory Used"
                value={`${stats?.memoryUsed}`}
                unit=" GB"
                size={140}
              />
            </div>
          </div>
        </div>
        <div className={"chartCard"}>
          <h2 className={"chartTitle"}>CPU Usage History</h2>
          <div className={"chartContainer"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
                  activeDot={{
                    r: 3,
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={"infoGrid"}>
          <InfoCard
            icon={<Cpu color="#3b82f6" />}
            title="CPU Cores"
            value={`${stats?.cpuCores} cores`}
          />
          <InfoCard
            icon={<Cpu color="#8b5cf6" />}
            title="CPU Threads"
            value={`${stats?.cpuThreads} threads`}
          />
          <InfoCard
            icon={<HardDrive color="#10b981" />}
            title="Total Memory"
            value={`${stats?.totalMemory} GB`}
          />
          <InfoCard
            icon={<Monitor color="#f59e0b" />}
            title="Available Memory"
            value={`${stats?.memoryAvailable} GB`}
          />
        </div>
        <div className={"cpuDetailsCard"}>
          <h2 className={"cpuDetailsTitle"}>CPU Information</h2>
          <div className={"cpuDetailsContent"}>
            <p className={"cpuModelLabel"}>Model</p>
            <p className={"cpuModelName"}>{stats?.cpuModelName}</p>
            <div className={"cpuDetailsGrid"}>
              <div className={"cpuDetailItem"}>
                <p className={"cpuDetailLabel"}>Base Clock</p>
                <p className={"cpuDetailValue"}>{stats?.cpuGhz} GHz</p>
              </div>
              <div className={"cpuDetailItem"}>
                <p className={"cpuDetailLabel"}>CPU Cache</p>
                <p className={"cpuDetailValue"}>{stats?.cpuCacheSize} KB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
