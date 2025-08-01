import React, { useState, useEffect, useRef } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Tooltip,
} from "recharts";
import { Monitor, Cpu, HardDrive, Computer } from "lucide-react";
import { Info, NetStats, Stats } from "../../wailsjs/go/main/App";
import InfoCard from "./InfoCard";
import CircularProgress from "./CirclePorgress";

type StatsT = {
  memoryAvailable: number;
  memoryUsed: number;
  memoryPercentage: number;
  cpuPercentage: number;
  cpuTemp: number;
  sysTemp: number;
};

type InfoT = {
  cpu: number;
  cpuThreads: number;
  cpuModel: string;
  cpuCores: number;
  cpuModelName: string;
  cpuGhz: number;
  cpuCacheSize: number;
  totalMemory: number;
  OS: string;
  platform: string;
  platformVersion: string;
};

type CpuHistorySegmentT = {
  time: string;
  usage: number;
};

const SystemMonitor = () => {
  const [stats, setStats] = useState<StatsT | null>(null);
  const [info, setInfo] = useState<InfoT | null>(null);
  const [cpuHistory, setCpuHistory] = useState<CpuHistorySegmentT[]>([]);
  const [netHistory, setNetHistory] = useState([
    {
      time: "",
      bytesRecv: 0,
      bytesSent: 0,
    },
  ]);
  const totalRecv = useRef(0);
  const totalSent = useRef(0);

  useEffect(() => {
    let netTimeout = 4;
    fetchInfo();
    const inter = setInterval(() => {
      fetchStats();
      if (netTimeout === 4) {
        fetchNetStats();
        netTimeout = 0;
      } else {
        netTimeout += 1;
      }
    }, 2000);

    return () => clearInterval(inter);
  }, []);

  const fetchStats = () => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    Stats().then((res) => {
      setStats(res);

      setCpuHistory((prev) => {
        const newHistory = [
          ...prev.slice(-79),
          { time: timeStr, usage: res.cpuPercentage },
        ];
        return newHistory;
      });
    });
  };

  const fetchNetStats = () => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    NetStats().then((res) => {
      if (totalRecv.current === 0 && totalSent.current === 0) {
        totalRecv.current = res.bytesRecv;
        totalSent.current = res.bytesSent;
        return;
      }

      setNetHistory((prev) => {
        const newHistory = [
          ...prev.slice(-79),
          {
            time: timeStr,
            bytesRecv: parseFloat(
              ((res?.bytesRecv - totalRecv.current) / 1000).toFixed(2)
            ),
            bytesSent: parseFloat(
              ((res?.bytesSent - totalSent.current) / 1000).toFixed(2)
            ),
          },
        ];
        totalRecv.current = res.bytesRecv;
        totalSent.current = res.bytesSent;
        return newHistory;
      });
    });
  };

  const fetchInfo = () => {
    Info().then((res) => {
      setInfo(res);
    });
  };

  const tempColor = (temp: number) => {
    if (temp < 45) {
      return "#94e864";
    } else if (temp < 55) {
      return "#e3e352";
    } else if (temp < 70) {
      return "#e3ae52";
    } else if (temp < 85) {
      return "#e35952";
    } else {
      return "#c20a0a";
    }
  };

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
                value={`${stats?.cpuPercentage}%`}
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
                value={`${stats?.memoryUsed}GB`}
                unit=" %"
                size={140}
              />
            </div>
          </div>
          {stats?.cpuTemp ? (
            <div className={"progressCard"}>
              <h2 className={"progressCardTitle"}>
                <Cpu
                  style={{
                    width: "20px",
                    height: "20px",
                    color: tempColor(stats?.cpuTemp ?? 0),
                  }}
                />
                CPU Temperature
              </h2>
              <div className={"progressCardContent"}>
                <CircularProgress
                  percentage={stats?.cpuTemp}
                  color={tempColor(stats?.cpuTemp ?? 0)}
                  label="CPU Temperature"
                  unit=" °C"
                  size={140}
                />
              </div>
            </div>
          ) : (
            <div className={"progressCard"}>
              <h2 className={"progressCardTitle"}>
                <Computer
                  style={{
                    width: "20px",
                    height: "20px",
                    color: tempColor(stats?.sysTemp ?? 0),
                  }}
                />
                System Temperature
              </h2>
              <div className={"progressCardContent"}>
                <CircularProgress
                  percentage={stats?.sysTemp}
                  color={tempColor(stats?.sysTemp ?? 0)}
                  label="System Temperature"
                  unit=" °C"
                  size={140}
                />
              </div>
            </div>
          )}
        </div>
        <div className={"chartCard"}>
          <h2 className={"chartTitle"}>CPU Usage History</h2>
          <div className={"chartContainer"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  animationDuration={300}
                  formatter={(value, name) => [`${value}%`, "CPU usage"]}
                  labelFormatter={(label) => `Time: ${label}`}
                  contentStyle={{
                    backgroundColor: "rgb(154, 160, 167)",
                    border: "1px solid rgb(118, 123, 129)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    textAlign: "start",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dot={{ fill: "#3b82f6", strokeWidth: 1, r: 1 }}
                  activeDot={{
                    r: 1.5,
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={"chartCard"}>
          <h2 className={"chartTitle"}>Network Usage</h2>
          <div className={"chartContainer"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netHistory}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}Kb`}
                />
                <Legend
                  formatter={(value) =>
                    value === "bytesSent" ? "Sent" : "Received"
                  }
                />
                <Tooltip
                  animationDuration={300}
                  formatter={(value, name) => [
                    `${value}Kb`,
                    name === "bytesSent" ? "Sent" : "Received",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                  contentStyle={{
                    backgroundColor: "rgb(154, 160, 167)",
                    border: "1px solid rgb(118, 123, 129)",
                    borderRadius: "10px",
                    fontSize: "12px",
                    textAlign: "start",
                  }}
                />
                <Area
                  type="linear"
                  label="Sent"
                  dataKey="bytesSent"
                  stroke="#94e864"
                  fill="#94e864"
                  fillOpacity={0.2}
                  strokeWidth={1}
                  dot={{ fill: "#14fc24", strokeWidth: 1, r: 1 }}
                  activeDot={{
                    r: 1.5,
                    stroke: "#14fc24",
                    strokeWidth: 1,
                    fill: "#ffffff",
                  }}
                />
                <Area
                  type="linear"
                  label="Recived"
                  dataKey="bytesRecv"
                  stroke="#e3ae52"
                  fill="#e3ae52"
                  fillOpacity={0.2}
                  strokeWidth={1}
                  dot={{ fill: "#f29d0a", strokeWidth: 1, r: 1 }}
                  activeDot={{
                    r: 1.5,
                    stroke: "#f29d0a",
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
            value={`${info?.cpuCores} cores`}
          />
          <InfoCard
            icon={<Cpu color="#8b5cf6" />}
            title="CPU Threads"
            value={`${info?.cpuThreads} threads`}
          />
          <InfoCard
            icon={<HardDrive color="#10b981" />}
            title="Total Memory"
            value={`${info?.totalMemory} GB`}
          />
          <InfoCard
            icon={<Monitor color="#f59e0b" />}
            title="Available Memory"
            value={`${stats?.memoryAvailable} GB`}
          />
        </div>
        <div className="detailsGrid">
          <div className={"detailsCard"}>
            <h2 className={"detailsTitle"}>CPU Information</h2>
            <div className={"detailsContent"}>
              <p className={"detailLabel"}>Model</p>
              <p className={"detailName"}>{info?.cpuModelName}</p>
              <div className={"detailsItemGrid"}>
                <div className={"detailItem"}>
                  <p className={"detailLabel"}>Base Clock</p>
                  <p className={"detailValue"}>{info?.cpuGhz} GHz</p>
                </div>
                <div className={"detailItem"}>
                  <p className={"detailLabel"}>CPU Cache</p>
                  <p className={"detailValue"}>{info?.cpuCacheSize} KB</p>
                </div>
              </div>
            </div>
          </div>
          <div className={"detailsCard"}>
            <h2 className={"detailsTitle"}>System Information</h2>
            <div className={"detailsContent"}>
              <div className={"detailsItemGrid"}>
                <div className="detailItem">
                  <p className={"detailLabel"}>OS</p>
                  <p className={"detailName"}>{info?.platform}</p>
                </div>
                <div className={"detailItem"}>
                  <p className={"detailLabel"}>OS Version</p>
                  <p className={"detailValue"}>{info?.platformVersion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
