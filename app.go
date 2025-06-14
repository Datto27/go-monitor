package main

import (
	"context"
	"fmt"
	"math"
	"slices"
	"strings"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/net"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type StatsT struct {
	MemoryAvailable  float64 `json:"memoryAvailable"`
	MemoryUsed       float64 `json:"memoryUsed"`
	MemoryPercentage float64 `json:"memoryPercentage"`
	CpuPercentage    float64 `json:"cpuPercentage"`
	CpuTemp          float64 `json:"cpuTemp"`
	SysTemp          float64 `json:"sysTemp"`
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

type TemperatureInfoT struct {
	SensorName  string  `json:"sensorName"`
	Temperature float64 `json:"temperature"`
}

func (a *App) Stats() StatsT {
	ctx := context.Background()
	cpuPercent, err := cpu.Percent(0, false)
	vm, err := mem.VirtualMemory()
	temps, err := host.SensorsTemperaturesWithContext(ctx)

	if err != nil {
		panic(err)
	}

	var cpuTemp float64
	var sysTemp float64
	for _, temp := range temps {
		if isCPUSensor(temp.SensorKey) {
			cpuTemp = temp.Temperature
		} else if isSystemSensor(temp.SensorKey) {
			sysTemp = temp.Temperature
		}
	}

	return StatsT{
		CpuPercentage:    math.Trunc(cpuPercent[0]*100) / 100,
		MemoryAvailable:  bToGb(vm.Available),
		MemoryUsed:       bToGb(vm.Used),
		MemoryPercentage: math.Trunc(vm.UsedPercent*100) / 100,
		CpuTemp:          cpuTemp,
		SysTemp:          sysTemp,
	}
}

func (a *App) NetStats() net.IOCountersStat {
	netIO, err := net.IOCounters(false)

	if err != nil {
		panic(err)
	}

	return netIO[0]
}

func (a *App) Info() InfoT {
	logicalCores, err := cpu.Counts(true)
	physicalCores, err := cpu.Counts(false)
	cpus, err := cpu.Info()
	vm, err := mem.VirtualMemory()
	h, err := host.Info()

	if err != nil {
		panic(err)
	}

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

func bToGb(b uint64) float64 {
	return math.Trunc((float64(b)/1024/1024/1024)*100) / 100
}

func isCPUSensor(sensorName string) bool {
	cpuKeywords := []string{
		"TC0P",
	}

	if slices.Contains(cpuKeywords, sensorName) {
		return true
	}
	return false
}

func isSystemSensor(sensorName string) bool {
	if strings.Contains(sensorName, "ACPI") {
		return true
	}
	return false
}
