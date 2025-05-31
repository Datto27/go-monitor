import React, { useEffect, useState } from "react";
import { Test } from "../../wailsjs/go/main/App";
import CirclePorgressChart from "./CirclePorgressChart";
import { Gauge, gaugeClasses, LineChart } from "@mui/x-charts";

export type StatsT = {
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

const SystemChart = () => {
  const [stats, setStats] = useState<StatsT | null>(null);
  const [cpuData, setCpuData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    let segments: { [key: string]: number } = {};
    let intr = setInterval(() => {
      Test().then((res) => {
        setStats(res);

        const dateStamp = new Date().toString();
        segments[formatSegmentKey(dateStamp)] = res.cpuPercentage;
        if (Object.keys(segments).length > 50) {
          delete segments[Object.keys(segments)[0]];
        }

        setCpuData(segments);
      });
    }, 2000);

    return () => {
      clearInterval(intr);
    };
  }, []);

  const formatSegmentKey = (key: string) => {
    const date = new Date(key);
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  const generatePercentageData = () => {
    return Array.from({ length: 100 }, (_, i) => i + 1);
  };

  console.log(Object.keys(cpuData))
  return (
    <div className="container">
      <div>
        <div className="seciton chart-wrapper">
          <h3 className="title">CPU Info</h3>
          <p className="subtitle">CPU: {stats?.cpuModelName}</p>
          <div className="section">
            <p className="subtitle">Cores: {stats?.cpuCores}</p>
            <p className="subtitle">Threads: {stats?.cpuThreads}</p>
            <p className="subtitle">Clock Speed: {stats?.cpuGhz}Ghz</p>
            <p className="subtitle">Cache Size: {stats?.cpuCacheSize}kb</p>
          </div>
        </div>
        <LineChart
          yAxis={[{
            id: 'percentageAxis',
            min: 0,
            max: 100,
            label: 'Percentage (%)',
            }]}
          series={[{ data: Object.values(cpuData), area: true }]}
          height={300}
          grid={{ vertical: true, horizontal: true }}
        />
      </div>
      <div className="section">
        <CirclePorgressChart
          title={`CPU Usage`}
          size={window.innerWidth / 2.5}
          percentage={stats?.cpuPercentage}
        />
        <CirclePorgressChart
          title={`Total Memory: ${stats?.totalMemory}`}
          size={window.innerWidth / 2.5}
          percentage={stats?.memoryPercentage}
        />
      </div>
    </div>
  );
};

export default SystemChart;
