export type StatsT = {
  memoryAvailable: number;
  memoryUsed: number;
  memoryPercentage: number;
  swapUsed: number;
  swapTotal: number;
  swapPercentage: number;
  cpuPercentage: number;
  cpuCores: number[];
  cpuTemp: number;
  sysTemp: number;
  uptime: number;
  loadAvg1: number;
  loadAvg5: number;
  loadAvg15: number;
};

export type InfoT = {
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

export type DiskPartitionT = {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  free: number;
  usedPercent: number;
};

export type DiskIOT = {
  name: string;
  readBytes: number;
  writeBytes: number;
  readCount: number;
  writeCount: number;
};

export type DiskStatsT = {
  partitions: DiskPartitionT[];
  io: DiskIOT[];
};

export type NetInterfaceT = {
  name: string;
  bytesSent: number;
  bytesRecv: number;
};

export type SensorT = {
  key: string;
  temperature: number;
  category: string;
};

export type FanT = {
  label: string;
  rpm: number;
};

export type GpuT = {
  name: string;
  utilPercent: number;
  memUsed: number;
  memTotal: number;
  memPercent: number;
  temp: number;
  fanPercent: number;
  powerDraw: number;
};

export type CpuHistorySegmentT = {
  time: string;
  usage: number;
};

export type NetHistorySegmentT = {
  time: string;
  [iface: string]: number | string;
};
