import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Monitor, Cpu, HardDrive, Computer, LayoutDashboard, Activity, Thermometer, Server, Minimize2, Maximize2, Minus, X } from "lucide-react";
import { Info, NetStats, Stats, DiskStats, Sensors, FanStats, GpuStats } from "../../wailsjs/go/main/App";
import {
  WindowSetSize, WindowSetAlwaysOnTop, WindowSetPosition,
  WindowCenter, ScreenGetAll, WindowGetSize, WindowMinimise, Quit,
} from "../../wailsjs/runtime/runtime";
import InfoCard from "./InfoCard";
import CircularProgress from "./CirclePorgress";
import PerCorePanel from "./PerCorePanel";
import DiskPanel from "./DiskPanel";
import SensorsPanel from "./SensorsPanel";
import {
  StatsT,
  InfoT,
  DiskStatsT,
  NetInterfaceT,
  SensorT,
  FanT,
  GpuT,
  CpuHistorySegmentT,
  NetHistorySegmentT,
} from "../types";

const IFACE_COLORS = ["#94e864", "#e3ae52", "#3b82f6", "#f87171", "#a78bfa", "#34d399"];

const tempColor = (temp: number) => {
  if (temp < 45) return "#94e864";
  if (temp < 55) return "#e3e352";
  if (temp < 70) return "#e3ae52";
  if (temp < 85) return "#e35952";
  return "#c20a0a";
};

const formatUptime = (s: number): string => {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const TOOLTIP_STYLE = {
  backgroundColor: "rgba(22, 27, 34, 0.97)",
  border: "1px solid rgba(48, 54, 61, 0.9)",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#e6edf3",
};

const WIDGET_W = 380;
const WIDGET_H = 52;

type Tab = "overview" | "cpu" | "network" | "disk" | "sensors" | "system";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
  { id: "cpu", label: "CPU", icon: <Cpu size={15} /> },
  { id: "network", label: "Network", icon: <Activity size={15} /> },
  { id: "disk", label: "Disk", icon: <HardDrive size={15} /> },
  { id: "sensors", label: "Sensors", icon: <Thermometer size={15} /> },
  { id: "system", label: "System", icon: <Server size={15} /> },
];

const SystemMonitor = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isWidget, setIsWidget] = useState(false);
  const savedSize = useRef<{ w: number; h: number }>({ w: 1024, h: 700 });
  const [stats, setStats] = useState<StatsT | null>(null);
  const [info, setInfo] = useState<InfoT | null>(null);
  const [diskStats, setDiskStats] = useState<DiskStatsT | null>(null);
  const [sensors, setSensors] = useState<SensorT[]>([]);
  const [fans, setFans] = useState<FanT[]>([]);
  const [gpuStats, setGpuStats] = useState<GpuT[]>([]);
  const [cpuHistory, setCpuHistory] = useState<CpuHistorySegmentT[]>([]);
  const [netHistory, setNetHistory] = useState<NetHistorySegmentT[]>([]);

  const totalRecv = useRef<Map<string, number>>(new Map());
  const totalSent = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    fetchInfo();
    fetchStats();
    fetchNetStats();
    fetchSensors();
    fetchFans();
    fetchGpuStats();
    fetchDiskStats();

    const fastInterval = setInterval(() => {
      fetchStats();
      fetchNetStats();
    }, 2000);

    const medInterval = setInterval(() => {
      fetchSensors();
      fetchFans();
      fetchGpuStats();
    }, 5000);

    const slowInterval = setInterval(fetchDiskStats, 10000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(medInterval);
      clearInterval(slowInterval);
    };
  }, []);

  const timeStr = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  const fetchStats = () => {
    Stats().then((res) => {
      setStats(res);
      setCpuHistory((prev) => [
        ...prev.slice(-79),
        { time: timeStr(), usage: res.cpuPercentage },
      ]);
    });
  };

  const fetchNetStats = () => {
    NetStats().then((res: NetInterfaceT[]) => {
      if (!res || res.length === 0) return;
      const t = timeStr();
      const segment: NetHistorySegmentT = { time: t };
      let anyNew = false;

      for (const iface of res) {
        const prevRecv = totalRecv.current.get(iface.name) ?? 0;
        const prevSent = totalSent.current.get(iface.name) ?? 0;
        if (prevRecv === 0 && prevSent === 0) {
          totalRecv.current.set(iface.name, iface.bytesRecv);
          totalSent.current.set(iface.name, iface.bytesSent);
          continue;
        }
        const deltaRecv = parseFloat(((iface.bytesRecv - prevRecv) / 1000).toFixed(2));
        const deltaSent = parseFloat(((iface.bytesSent - prevSent) / 1000).toFixed(2));
        totalRecv.current.set(iface.name, iface.bytesRecv);
        totalSent.current.set(iface.name, iface.bytesSent);
        if (deltaRecv > 0 || deltaSent > 0) {
          segment[`${iface.name}_recv`] = deltaRecv;
          segment[`${iface.name}_sent`] = deltaSent;
          anyNew = true;
        }
      }

      if (anyNew) {
        setNetHistory((prev) => [...prev.slice(-79), segment]);
      }
    });
  };

  const fetchDiskStats = () => { DiskStats().then(setDiskStats); };
  const fetchSensors = () => { Sensors().then(setSensors); };
  const fetchFans = () => { FanStats().then(setFans); };
  const fetchGpuStats = () => { GpuStats().then(setGpuStats); };
  const fetchInfo = () => { Info().then(setInfo); };

  const enterWidget = async () => {
    const size = await WindowGetSize();
    savedSize.current = size;
    const screens = await ScreenGetAll();
    const screen = screens.find((s) => s.isCurrent) ?? screens[0];
    const x = screen.width - WIDGET_W - 20;
    const y = screen.height - WIDGET_H - 60;
    WindowSetSize(WIDGET_W, WIDGET_H);
    WindowSetPosition(x, y);
    WindowSetAlwaysOnTop(true);
    setIsWidget(true);
  };

  const exitWidget = () => {
    WindowSetSize(savedSize.current.w, savedSize.current.h);
    WindowSetAlwaysOnTop(false);
    WindowCenter();
    setIsWidget(false);
  };

  const activeIfaceKeys = useMemo(() => {
    const keys = new Set<string>();
    netHistory.forEach((seg) => {
      Object.keys(seg).forEach((k) => { if (k !== "time") keys.add(k); });
    });
    return Array.from(keys).slice(0, 6);
  }, [netHistory]);

  const showLoadAvg = stats && (stats.loadAvg1 > 0 || stats.loadAvg5 > 0 || stats.loadAvg15 > 0);

  /* ── Widget view ── */
  if (isWidget) {
    const temp = stats?.cpuTemp || stats?.sysTemp || 0;
    const cpu = stats?.cpuPercentage ?? 0;
    const ram = stats?.memoryPercentage ?? 0;

    return (
      <div className="widgetRoot">
        <div className="widgetStat">
          <span className="widgetLabel">CPU</span>
          <span className="widgetValue" style={{ color: "#388bfd" }}>{cpu.toFixed(1)}%</span>
          <div className="widgetBar">
            <div className="widgetBarFill" style={{ width: `${cpu}%`, backgroundColor: "#388bfd" }} />
          </div>
        </div>
        <div className="widgetDivider" />
        <div className="widgetStat">
          <span className="widgetLabel">RAM</span>
          <span className="widgetValue" style={{ color: "#3fb950" }}>{ram.toFixed(1)}%</span>
          <div className="widgetBar">
            <div className="widgetBarFill" style={{ width: `${ram}%`, backgroundColor: "#3fb950" }} />
          </div>
        </div>
        {temp > 0 && (
          <>
            <div className="widgetDivider" />
            <div className="widgetStat">
              <span className="widgetLabel">TEMP</span>
              <span className="widgetValue" style={{ color: tempColor(temp) }}>{temp.toFixed(1)}°</span>
              <div className="widgetBar">
                <div className="widgetBarFill" style={{ width: `${Math.min(temp, 100)}%`, backgroundColor: tempColor(temp) }} />
              </div>
            </div>
          </>
        )}
        {gpuStats.length > 0 && (
          <>
            <div className="widgetDivider" />
            <div className="widgetStat">
              <span className="widgetLabel">GPU</span>
              <span className="widgetValue" style={{ color: "#bc8cff" }}>{gpuStats[0].utilPercent.toFixed(1)}%</span>
              <div className="widgetBar">
                <div className="widgetBarFill" style={{ width: `${gpuStats[0].utilPercent}%`, backgroundColor: "#bc8cff" }} />
              </div>
            </div>
          </>
        )}
        <button className="widgetExpandBtn" onClick={exitWidget} title="Restore full view">
          <Maximize2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <>
    <div className="titleBar">
      <span className="titleBarTitle">Go Monitor</span>
      <div className="titleBarControls">
        <button className="titleBarBtn" onClick={() => WindowMinimise()} title="Minimize">
          <Minus size={12} />
        </button>
        <button className="titleBarBtn closeBtn" onClick={() => Quit()} title="Close">
          <X size={12} />
        </button>
      </div>
    </div>
    <div className="container">
      <div className="maxWidth">

        {/* Tab Navigation */}
        <div className="tabNavRow">
        <nav className="tabNav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab${activeTab === tab.id ? " tabActive" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
          <button className="widgetModeBtn" onClick={enterWidget} title="Switch to widget mode">
            <Minimize2 size={13} />
            Widget
          </button>
        </div>

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <>
            <div className="progressGrid">
              <div className="progressCard">
                <h2 className="progressCardTitle">
                  <Cpu style={{ width: "18px", height: "18px", color: "#388bfd" }} />
                  CPU Usage
                </h2>
                <div className="progressCardContent">
                  <CircularProgress
                    percentage={stats?.cpuPercentage}
                    color="#388bfd"
                    label="CPU Load"
                    value={`${stats?.cpuPercentage}%`}
                    unit="%"
                    size={130}
                  />
                </div>
              </div>

              <div className="progressCard">
                <h2 className="progressCardTitle">
                  <HardDrive style={{ width: "18px", height: "18px", color: "#3fb950" }} />
                  Memory Usage
                </h2>
                <div className="progressCardContent">
                  <CircularProgress
                    percentage={stats?.memoryPercentage}
                    color="#3fb950"
                    label="Memory Used"
                    value={`${stats?.memoryUsed}GB`}
                    unit=" %"
                    size={130}
                  />
                </div>
              </div>

              {stats?.swapTotal != null && stats.swapTotal > 0 && (
                <div className="progressCard">
                  <h2 className="progressCardTitle">
                    <HardDrive style={{ width: "18px", height: "18px", color: "#bc8cff" }} />
                    Swap Usage
                  </h2>
                  <div className="progressCardContent">
                    <CircularProgress
                      percentage={stats.swapPercentage}
                      color="#bc8cff"
                      label="Swap Used"
                      value={`${stats.swapUsed}GB`}
                      unit=" %"
                      size={130}
                    />
                  </div>
                </div>
              )}

              {stats?.cpuTemp ? (
                <div className="progressCard">
                  <h2 className="progressCardTitle">
                    <Thermometer style={{ width: "18px", height: "18px", color: tempColor(stats.cpuTemp) }} />
                    CPU Temperature
                  </h2>
                  <div className="progressCardContent">
                    <CircularProgress
                      percentage={stats.cpuTemp}
                      color={tempColor(stats.cpuTemp)}
                      label="CPU Temp"
                      unit=" °C"
                      size={130}
                    />
                  </div>
                </div>
              ) : (
                <div className="progressCard">
                  <h2 className="progressCardTitle">
                    <Computer style={{ width: "18px", height: "18px", color: tempColor(stats?.sysTemp ?? 0) }} />
                    System Temperature
                  </h2>
                  <div className="progressCardContent">
                    <CircularProgress
                      percentage={stats?.sysTemp}
                      color={tempColor(stats?.sysTemp ?? 0)}
                      label="System Temp"
                      unit=" °C"
                      size={130}
                    />
                  </div>
                </div>
              )}

              {gpuStats.map((gpu, i) => (
                <div key={i} className="progressCard">
                  <h2 className="progressCardTitle">
                    <Monitor style={{ width: "18px", height: "18px", color: "#bc8cff" }} />
                    GPU Usage
                  </h2>
                  <div className="progressCardContent">
                    <CircularProgress
                      percentage={gpu.utilPercent}
                      color="#bc8cff"
                      label="GPU Load"
                      value={`${gpu.utilPercent}%`}
                      unit="%"
                      size={130}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* GPU detail cards */}
            {gpuStats.length > 0 && (
              <div className="detailsGrid">
                {gpuStats.map((gpu, i) => (
                  <div key={i} className="detailsCard">
                    <h2 className="detailsTitle">GPU — {gpu.name}</h2>
                    <div className="detailsContent">
                      <div className="detailsItemGrid">
                        <div className="detailItem">
                          <p className="detailLabel">VRAM Used</p>
                          <p className="detailValue">{gpu.memUsed} / {gpu.memTotal} GB</p>
                        </div>
                        <div className="detailItem">
                          <p className="detailLabel">Temperature</p>
                          <p className="detailValue" style={{ color: tempColor(gpu.temp) }}>{gpu.temp}°C</p>
                        </div>
                        <div className="detailItem">
                          <p className="detailLabel">Fan</p>
                          <p className="detailValue">{gpu.fanPercent > 0 ? `${gpu.fanPercent}%` : "N/A"}</p>
                        </div>
                        <div className="detailItem">
                          <p className="detailLabel">Power Draw</p>
                          <p className="detailValue">{gpu.powerDraw > 0 ? `${gpu.powerDraw} W` : "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats bar */}
            {stats && (stats.uptime > 0 || showLoadAvg) && (
              <div className="statsBar">
                {stats.uptime > 0 && (
                  <div className="statsBarItem">
                    <span className="statsBarLabel">Uptime</span>
                    <span className="statsBarValue">{formatUptime(stats.uptime)}</span>
                  </div>
                )}
                {showLoadAvg && (
                  <>
                    <div className="statsBarItem">
                      <span className="statsBarLabel">Load 1m</span>
                      <span className="statsBarValue">{stats.loadAvg1}</span>
                    </div>
                    <div className="statsBarItem">
                      <span className="statsBarLabel">Load 5m</span>
                      <span className="statsBarValue">{stats.loadAvg5}</span>
                    </div>
                    <div className="statsBarItem">
                      <span className="statsBarLabel">Load 15m</span>
                      <span className="statsBarValue">{stats.loadAvg15}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── CPU ── */}
        {activeTab === "cpu" && (
          <>
            <div className="chartCard">
              <h2 className="chartTitle">
                <Cpu style={{ width: "18px", height: "18px", color: "#388bfd", marginRight: "8px" }} />
                CPU Usage History
              </h2>
              <div className="chartContainer">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuHistory}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#388bfd" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#388bfd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(48,54,61,0.7)" />
                    <XAxis dataKey="time" stroke="#6e7681" fontSize={11} tick={{ fill: "#6e7681" }} />
                    <YAxis stroke="#6e7681" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#6e7681" }} />
                    <Tooltip
                      animationDuration={200}
                      formatter={(value) => [`${value}%`, "CPU usage"]}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={TOOLTIP_STYLE}
                      cursor={{ stroke: "rgba(56,139,253,0.3)", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="usage"
                      stroke="#388bfd"
                      strokeWidth={1.5}
                      fill="url(#cpuGrad)"
                      dot={false}
                      activeDot={{ r: 3, stroke: "#388bfd", strokeWidth: 1, fill: "#0d1117" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <PerCorePanel cores={stats?.cpuCores ?? []} />
          </>
        )}

        {/* ── Network ── */}
        {activeTab === "network" && (
          <div className="chartCard">
            <h2 className="chartTitle">
              <Activity style={{ width: "18px", height: "18px", color: "#94e864", marginRight: "8px" }} />
              Network Usage (KB/s)
            </h2>
            <div className="chartContainer">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netHistory}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(48,54,61,0.7)" />
                  <XAxis dataKey="time" stroke="#6e7681" fontSize={11} tick={{ fill: "#6e7681" }} />
                  <YAxis stroke="#6e7681" fontSize={11} tickFormatter={(v) => `${v}KB`} tick={{ fill: "#6e7681" }} />
                  <Legend
                    formatter={(v) => (
                      <span style={{ color: "#8b949e", fontSize: "12px" }}>
                        {v.replace("_recv", " ↓").replace("_sent", " ↑")}
                      </span>
                    )}
                  />
                  <Tooltip
                    animationDuration={200}
                    formatter={(value, name) => [
                      `${value} KB`,
                      String(name).replace("_recv", " ↓").replace("_sent", " ↑"),
                    ]}
                    labelFormatter={(label) => `Time: ${label}`}
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ stroke: "rgba(148,232,100,0.3)", strokeWidth: 1 }}
                  />
                  {activeIfaceKeys.map((key, i) => (
                    <Area
                      key={key}
                      type="linear"
                      dataKey={key}
                      stroke={IFACE_COLORS[i % IFACE_COLORS.length]}
                      fill={IFACE_COLORS[i % IFACE_COLORS.length]}
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, strokeWidth: 1, fill: "#0d1117" }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Disk ── */}
        {activeTab === "disk" && <DiskPanel diskStats={diskStats} />}

        {/* ── Sensors ── */}
        {activeTab === "sensors" && <SensorsPanel sensors={sensors} fans={fans} />}

        {/* ── System ── */}
        {activeTab === "system" && (
          <>
            <div className="infoGrid">
              <InfoCard icon={<Cpu size={22} color="#388bfd" />} title="CPU Cores" value={`${info?.cpuCores} cores`} />
              <InfoCard icon={<Cpu size={22} color="#bc8cff" />} title="CPU Threads" value={`${info?.cpuThreads} threads`} />
              <InfoCard icon={<HardDrive size={22} color="#3fb950" />} title="Total Memory" value={`${info?.totalMemory} GB`} />
              <InfoCard icon={<Monitor size={22} color="#e3b341" />} title="Available Memory" value={`${stats?.memoryAvailable} GB`} />
            </div>

            <div className="detailsGrid">
              <div className="detailsCard">
                <h2 className="detailsTitle">CPU Information</h2>
                <div className="detailsContent">
                  <p className="detailLabel">Model</p>
                  <p className="detailName">{info?.cpuModelName}</p>
                  <div className="detailsItemGrid">
                    <div className="detailItem">
                      <p className="detailLabel">Base Clock</p>
                      <p className="detailValue">{info?.cpuGhz} GHz</p>
                    </div>
                    <div className="detailItem">
                      <p className="detailLabel">CPU Cache</p>
                      <p className="detailValue">{info?.cpuCacheSize} KB</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="detailsCard">
                <h2 className="detailsTitle">System Information</h2>
                <div className="detailsContent">
                  <div className="detailsItemGrid" style={{ marginTop: 0 }}>
                    <div className="detailItem">
                      <p className="detailLabel">OS</p>
                      <p className="detailName">{info?.platform}</p>
                    </div>
                    <div className="detailItem">
                      <p className="detailLabel">Version</p>
                      <p className="detailValue">{info?.platformVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
    </>
  );
};

export default SystemMonitor;
