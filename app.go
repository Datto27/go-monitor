package main

import (
	"context"
	"encoding/xml"
	"math"
	"os/exec"
	"strconv"
	"strings"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/net"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// StatsT holds all real-time system stats polled every 2 seconds.
type StatsT struct {
	MemoryAvailable  float64   `json:"memoryAvailable"`
	MemoryUsed       float64   `json:"memoryUsed"`
	MemoryPercentage float64   `json:"memoryPercentage"`
	SwapUsed         float64   `json:"swapUsed"`
	SwapTotal        float64   `json:"swapTotal"`
	SwapPercentage   float64   `json:"swapPercentage"`
	CpuPercentage    float64   `json:"cpuPercentage"`
	CpuCores         []float64 `json:"cpuCores"`
	CpuTemp          float64   `json:"cpuTemp"`
	SysTemp          float64   `json:"sysTemp"`
	Uptime           uint64    `json:"uptime"`
	LoadAvg1         float64   `json:"loadAvg1"`
	LoadAvg5         float64   `json:"loadAvg5"`
	LoadAvg15        float64   `json:"loadAvg15"`
}

type InfoT struct {
	CpuThreads      int     `json:"cpuThreads"`
	CpuModel        string  `json:"cpuModel"`
	CpuCores        int     `json:"cpuCores"`
	CpuModelName    string  `json:"cpuModelName"`
	CpuGhz          float64 `json:"cpuGhz"`
	CpuCacheSize    int32   `json:"cpuCacheSize"`
	CPU             int32   `json:"cpu"`
	TotalMemory     float64 `json:"totalMemory"`
	OS              string  `json:"OS"`
	Platform        string  `json:"platform"`
	PlatformVersion string  `json:"platformVersion"`
}

type DiskPartitionT struct {
	Device      string  `json:"device"`
	Mountpoint  string  `json:"mountpoint"`
	Fstype      string  `json:"fstype"`
	Total       float64 `json:"total"`
	Used        float64 `json:"used"`
	Free        float64 `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
}

type DiskIOT struct {
	Name       string `json:"name"`
	ReadBytes  uint64 `json:"readBytes"`
	WriteBytes uint64 `json:"writeBytes"`
	ReadCount  uint64 `json:"readCount"`
	WriteCount uint64 `json:"writeCount"`
}

type DiskStatsT struct {
	Partitions []DiskPartitionT `json:"partitions"`
	IO         []DiskIOT        `json:"io"`
}

type NetInterfaceT struct {
	Name      string `json:"name"`
	BytesSent uint64 `json:"bytesSent"`
	BytesRecv uint64 `json:"bytesRecv"`
}

type SensorT struct {
	Key         string  `json:"key"`
	Temperature float64 `json:"temperature"`
	Category    string  `json:"category"`
}

type FanT struct {
	Label string `json:"label"`
	RPM   int64  `json:"rpm"`
}

type GpuT struct {
	Name        string  `json:"name"`
	UtilPercent float64 `json:"utilPercent"`
	MemUsed     float64 `json:"memUsed"`
	MemTotal    float64 `json:"memTotal"`
	MemPercent  float64 `json:"memPercent"`
	Temp        float64 `json:"temp"`
	FanPercent  float64 `json:"fanPercent"`
	PowerDraw   float64 `json:"powerDraw"`
}

func (a *App) Stats() StatsT {
	ctx := context.Background()

	cpuTotal, _ := cpu.Percent(0, false)
	cpuPerCore, _ := cpu.Percent(0, true)
	vm, _ := mem.VirtualMemory()
	swap, _ := mem.SwapMemory()
	temps, _ := host.SensorsTemperaturesWithContext(ctx)
	uptime, _ := host.Uptime()
	loadAvg, _ := load.Avg()

	var cpuTemp, sysTemp float64
	for _, t := range temps {
		cat := classifySensor(t.SensorKey)
		if cat == "cpu" && cpuTemp == 0 {
			cpuTemp = t.Temperature
		} else if cat == "system" && sysTemp == 0 {
			sysTemp = t.Temperature
		}
	}

	cores := make([]float64, len(cpuPerCore))
	for i, v := range cpuPerCore {
		cores[i] = math.Trunc(v*100) / 100
	}

	var la1, la5, la15 float64
	if loadAvg != nil {
		la1 = math.Trunc(loadAvg.Load1*100) / 100
		la5 = math.Trunc(loadAvg.Load5*100) / 100
		la15 = math.Trunc(loadAvg.Load15*100) / 100
	}

	return StatsT{
		CpuPercentage:    math.Trunc(cpuTotal[0]*100) / 100,
		CpuCores:         cores,
		MemoryAvailable:  bToGb(vm.Available),
		MemoryUsed:       bToGb(vm.Used),
		MemoryPercentage: math.Trunc(vm.UsedPercent*100) / 100,
		SwapUsed:         bToGb(swap.Used),
		SwapTotal:        bToGb(swap.Total),
		SwapPercentage:   math.Trunc(swap.UsedPercent*100) / 100,
		CpuTemp:          cpuTemp,
		SysTemp:          sysTemp,
		Uptime:           uptime,
		LoadAvg1:         la1,
		LoadAvg5:         la5,
		LoadAvg15:        la15,
	}
}

func (a *App) DiskStats() DiskStatsT {
	parts, _ := disk.Partitions(false)
	result := DiskStatsT{}
	seen := map[string]bool{}

	for _, p := range parts {
		if seen[p.Mountpoint] {
			continue
		}
		seen[p.Mountpoint] = true
		usage, err := disk.Usage(p.Mountpoint)
		if err != nil {
			continue
		}
		result.Partitions = append(result.Partitions, DiskPartitionT{
			Device:      p.Device,
			Mountpoint:  p.Mountpoint,
			Fstype:      p.Fstype,
			Total:       bToGb(usage.Total),
			Used:        bToGb(usage.Used),
			Free:        bToGb(usage.Free),
			UsedPercent: math.Trunc(usage.UsedPercent*100) / 100,
		})
	}

	ioCounters, err := disk.IOCounters()
	if err == nil {
		for name, c := range ioCounters {
			result.IO = append(result.IO, DiskIOT{
				Name:       name,
				ReadBytes:  c.ReadBytes,
				WriteBytes: c.WriteBytes,
				ReadCount:  c.ReadCount,
				WriteCount: c.WriteCount,
			})
		}
	}

	return result
}

func (a *App) NetStats() []NetInterfaceT {
	counters, err := net.IOCounters(true)
	if err != nil {
		return nil
	}
	result := make([]NetInterfaceT, 0, len(counters))
	for _, c := range counters {
		if c.Name == "lo" {
			continue
		}
		result = append(result, NetInterfaceT{
			Name:      c.Name,
			BytesSent: c.BytesSent,
			BytesRecv: c.BytesRecv,
		})
	}
	return result
}

func (a *App) Sensors() []SensorT {
	ctx := context.Background()
	temps, err := host.SensorsTemperaturesWithContext(ctx)
	if err != nil {
		return nil
	}
	result := make([]SensorT, 0, len(temps))
	for _, t := range temps {
		if t.Temperature <= 0 {
			continue
		}
		result = append(result, SensorT{
			Key:         t.SensorKey,
			Temperature: t.Temperature,
			Category:    classifySensor(t.SensorKey),
		})
	}
	return result
}

func (a *App) FanStats() []FanT {
	return getFans()
}

func (a *App) GpuStats() []GpuT {
	out, err := exec.Command("nvidia-smi", "-q", "-x").Output()
	if err != nil {
		return nil
	}
	return parseNvidiaSmi(out)
}

func (a *App) Info() InfoT {
	logicalCores, _ := cpu.Counts(true)
	physicalCores, _ := cpu.Counts(false)
	cpus, _ := cpu.Info()
	vm, _ := mem.VirtualMemory()
	h, _ := host.Info()

	return InfoT{
		CpuThreads:      logicalCores,
		TotalMemory:     bToGb(vm.Total),
		CPU:             cpus[0].CPU,
		CpuModelName:    cpus[0].ModelName,
		CpuModel:        cpus[0].Model,
		CpuCores:        physicalCores,
		CpuGhz:          cpus[0].Mhz / 1000,
		CpuCacheSize:    cpus[0].CacheSize,
		OS:              h.OS,
		Platform:        h.Platform,
		PlatformVersion: h.PlatformVersion,
	}
}

// nvidia-smi XML parsing

type nvidiaSmiLog struct {
	GPUs []nvidiaSmiGPU `xml:"gpu"`
}

type nvidiaSmiGPU struct {
	ProductName   string           `xml:"product_name"`
	Utilization   nvidiaSmiUtil    `xml:"utilization"`
	FBMemory      nvidiaSmiMemory  `xml:"fb_memory_usage"`
	Temperature   nvidiaSmiTemp    `xml:"temperature"`
	FanSpeed      string           `xml:"fan_speed"`
	PowerReadings nvidiaSmiPower   `xml:"power_readings"`
	GpuPower      nvidiaSmiPower   `xml:"gpu_power_readings"`
}

type nvidiaSmiUtil struct {
	GPU string `xml:"gpu_util"`
}

type nvidiaSmiMemory struct {
	Total string `xml:"total"`
	Used  string `xml:"used"`
}

type nvidiaSmiTemp struct {
	GPUTemp string `xml:"gpu_temp"`
}

type nvidiaSmiPower struct {
	PowerDraw string `xml:"power_draw"`
}

func parseNvidiaSmi(data []byte) []GpuT {
	var smiLog nvidiaSmiLog
	if err := xml.Unmarshal(data, &smiLog); err != nil {
		return nil
	}

	result := make([]GpuT, 0, len(smiLog.GPUs))
	for _, g := range smiLog.GPUs {
		util := parseNvidiaFloat(g.Utilization.GPU)
		memUsedMiB := parseNvidiaFloat(g.FBMemory.Used)
		memTotalMiB := parseNvidiaFloat(g.FBMemory.Total)
		temp := parseNvidiaFloat(g.Temperature.GPUTemp)
		fan := parseNvidiaFloat(g.FanSpeed)

		// Prefer gpu_power_readings, fall back to power_readings
		power := parseNvidiaFloat(g.GpuPower.PowerDraw)
		if power == 0 {
			power = parseNvidiaFloat(g.PowerReadings.PowerDraw)
		}

		memUsedGB := math.Trunc((memUsedMiB/1024)*100) / 100
		memTotalGB := math.Trunc((memTotalMiB/1024)*100) / 100
		var memPercent float64
		if memTotalGB > 0 {
			memPercent = math.Trunc((memUsedGB/memTotalGB)*10000) / 100
		}

		result = append(result, GpuT{
			Name:        g.ProductName,
			UtilPercent: util,
			MemUsed:     memUsedGB,
			MemTotal:    memTotalGB,
			MemPercent:  memPercent,
			Temp:        temp,
			FanPercent:  fan,
			PowerDraw:   power,
		})
	}
	return result
}

// parseNvidiaFloat strips the unit suffix (e.g. " %", " MiB", " W", " C") and parses the number.
func parseNvidiaFloat(s string) float64 {
	s = strings.TrimSpace(s)
	if s == "N/A" || s == "" {
		return 0
	}
	parts := strings.Fields(s)
	if len(parts) == 0 {
		return 0
	}
	v, err := strconv.ParseFloat(parts[0], 64)
	if err != nil {
		return 0
	}
	return v
}

func bToGb(b uint64) float64 {
	return math.Trunc((float64(b)/1024/1024/1024)*100) / 100
}

// classifySensor maps a sensor key to a category across Linux, Windows, and macOS.
func classifySensor(key string) string {
	k := strings.ToUpper(key)

	// macOS SMC prefixes
	switch {
	case strings.HasPrefix(k, "TC"):
		return "cpu"
	case strings.HasPrefix(k, "TG"):
		return "gpu"
	case strings.HasPrefix(k, "TH"), strings.HasPrefix(k, "TSD"):
		return "disk"
	case strings.HasPrefix(k, "TW"):
		return "system"
	}

	// Linux hwmon / ACPI / coretemp
	switch {
	case strings.Contains(k, "CORE"), strings.Contains(k, "PACKAGE"), strings.Contains(k, "CPU"):
		return "cpu"
	case strings.Contains(k, "ACPITZ"), strings.Contains(k, "ACPI"), strings.Contains(k, "AMBIENT"), strings.Contains(k, "SYSTEM"):
		return "system"
	case strings.Contains(k, "GPU"), strings.Contains(k, "EDGE"), strings.Contains(k, "JUNCTION"), strings.Contains(k, "HOTSPOT"):
		return "gpu"
	case strings.Contains(k, "NVME"), strings.Contains(k, "SSD"), strings.Contains(k, "HDD"), strings.Contains(k, "PCIE"):
		return "disk"
	}

	return "other"
}
