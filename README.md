# Go Monitor

A cross-platform desktop system monitor built with [Wails](https://wails.io/) (Go + React). It polls your hardware in real time and displays the data in a clean, live-updating UI.

## Features

- **CPU** — overall usage, per-core breakdown, temperature, and usage history chart
- **Memory** — used/available RAM, swap usage and percentage
- **Disk** — per-partition usage (total, used, free) and I/O counters (read/write bytes & ops)
- **Network** — per-interface sent/received bytes with live throughput chart
- **Sensors** — all hardware temperature sensors grouped by category (CPU, GPU, disk, system)
- **Fans** — RPM readings for all detected fans
- **GPU** — NVIDIA GPU utilization, VRAM usage, temperature, fan speed, and power draw (requires `nvidia-smi`)
- **System info** — OS, platform version, CPU model, core/thread count, clock speed, cache size, total RAM

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Go | 1.23+ | |
| Node.js | 18+ | for the frontend |
| Wails CLI | v2 | `go install github.com/wailsapp/wails/v2/cmd/wails@latest` |
| nvidia-smi | any | optional — GPU panel only appears when available |

## Linux dependencies

On Linux, Wails requires GTK and WebKit system libraries. Install them before running:

```bash
# Fedora / RHEL
sudo dnf install gtk3-devel webkit2gtk4.1-devel

# Ubuntu / Debian
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev
```

### Fedora 43+ — webkit2gtk-4.0 compatibility fix

Fedora 43 ships only `webkit2gtk-4.1` and dropped `webkit2gtk-4.0`, which Wails expects. Create a symlink to satisfy the build:

```bash
sudo ln -s /usr/lib64/pkgconfig/webkit2gtk-4.1.pc /usr/lib64/pkgconfig/webkit2gtk-4.0.pc
```

After that, `wails dev` and `wails build` work without any extra flags.

## Running in development

```bash
# Clone the repo
git clone https://github.com/Datto27/go-monitor.git
cd go-monitor

# Install frontend dependencies (first run only)
cd frontend && npm install && cd ..

# Start the dev server with hot-reload
wails dev
```

The app window opens automatically. The Go backend and React frontend both hot-reload on file changes.

## Building a production binary

```bash
wails build
```

The compiled binary is placed in `build/bin/`.

## Project structure

```
go-monitor/
├── app.go              # Backend: all system stats (CPU, mem, disk, net, GPU, sensors)
├── fans_linux.go       # Fan reading — Linux
├── fans_darwin.go      # Fan reading — macOS
├── fans_windows.go     # Fan reading — Windows
├── main.go             # Wails app entry point
├── frontend/
│   └── src/
│       └── components/ # React panels (CPU, memory, disk, network, sensors, GPU …)
└── assets/             # Screenshots used in this README
```

## Showcase

<div style="display: flex; flex-flow: row wrap; justify-content: space-between; align-items: flex-start; width: 100%;">
  <img src="./assets/live_usage.png" style="width: 30%" />
  <img src="./assets/temp.png" style="width: 30%" />
  <img src="./assets/network.png" style="width: 30%" />
</div>
