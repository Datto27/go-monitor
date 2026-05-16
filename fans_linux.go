//go:build linux

package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func getFans() []FanT {
	var fans []FanT
	hwmonBase := "/sys/class/hwmon"
	entries, err := os.ReadDir(hwmonBase)
	if err != nil {
		return fans
	}
	for _, entry := range entries {
		hwmonDir := filepath.Join(hwmonBase, entry.Name())
		matches, err := filepath.Glob(filepath.Join(hwmonDir, "fan*_input"))
		if err != nil {
			continue
		}
		for _, match := range matches {
			data, err := os.ReadFile(match)
			if err != nil {
				continue
			}
			rpm, err := strconv.ParseInt(strings.TrimSpace(string(data)), 10, 64)
			if err != nil || rpm == 0 {
				continue
			}
			base := filepath.Base(match)
			idx := strings.TrimPrefix(strings.TrimSuffix(base, "_input"), "fan")
			label := fmt.Sprintf("Fan %s", idx)
			if lb, err := os.ReadFile(filepath.Join(hwmonDir, fmt.Sprintf("fan%s_label", idx))); err == nil {
				label = strings.TrimSpace(string(lb))
			}
			fans = append(fans, FanT{Label: label, RPM: rpm})
		}
	}
	return fans
}
