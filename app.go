package main

import (
	"context"
	"fmt"
	"math"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/mem"
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

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

type Resources struct {
	TotalMemory float64      `json:"totalMemory"`
	MemoryAvailable float64  `json:"memoryAvailable"`
	MemoryUsed float64       `json:"memoryUsed"`
	MemoryPercentage float64 `json:"memoryPercentage"`
	CPU int32                `json:"cpu"`
	CpuPercentage float64       `json:"cpuPercentage"`
	CpuThreads int           `json:"cpuThreads"`
	CpuModel string          `json:"cpuModel"`
	CpuCores int32           `json:"cpuCores"`
	CpuModelName string      `json:"cpuModelName"`
	CpuGhz float64           `json:"cpuGhz"`
	CpuCacheSize int32       `json:"cpuCacheSize"`
}

func (a *App) Test() Resources {
	cpus, err := cpu.Info()
	cpuPercent, err := cpu.Percent(0, false)
	logicalCores, err := cpu.Counts(true)
	vm, err := mem.VirtualMemory()
	
	if err != nil {
		panic(err)
	}

	return Resources{
		CPU: cpus[0].CPU,
		CpuModelName: cpus[0].ModelName,
		CpuModel: cpus[0].Model,
		CpuCores: cpus[0].Cores,
		CpuGhz: cpus[0].Mhz / 1000,
		CpuCacheSize: cpus[0].CacheSize,
		CpuPercentage: math.Trunc(cpuPercent[0] * 100) / 100,
		CpuThreads: logicalCores,
		TotalMemory: bToGb(vm.Total),
		MemoryAvailable: bToGb(vm.Available),
		MemoryUsed: bToGb(vm.Used),
		MemoryPercentage: math.Trunc(vm.UsedPercent * 100) / 100,
	}
}

func bToGb(b uint64) float64 {
	return math.Trunc((float64(b) / 1024 / 1024 / 1024) * 100) / 100
}
