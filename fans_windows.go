//go:build windows

package main

import "github.com/yusufpapurcu/wmi"

type win32Fan struct {
	Name         string
	DesiredSpeed uint32
}

func getFans() []FanT {
	var result []win32Fan
	if err := wmi.Query("SELECT Name, DesiredSpeed FROM Win32_Fan", &result); err != nil {
		return nil
	}
	fans := make([]FanT, 0, len(result))
	for _, f := range result {
		fans = append(fans, FanT{Label: f.Name, RPM: int64(f.DesiredSpeed)})
	}
	return fans
}
