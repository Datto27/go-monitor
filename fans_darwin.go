//go:build darwin

package main

// getFans returns nil on macOS — SMC fan access requires IOKit/CGo.
func getFans() []FanT {
	return nil
}
