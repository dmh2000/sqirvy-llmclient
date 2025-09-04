/*
Copyright © 2025 David Howard  dmh2000@gmail.com
*/
package cmd

import (
	_ "embed"
	"fmt"

	"github.com/spf13/cobra"
)

//go:embed VERSION
var version string

// THIS MUST BE SET TO THE GIT TAG
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: version,
	Long:  version,

	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(version) // Ensure a newline at the end
	},
}

func versionUsage(cmd *cobra.Command) error {
	fmt.Println("Usage: version")
	return nil
}

func init() {
	rootCmd.AddCommand(versionCmd)
	queryCmd.SetUsageFunc(versionUsage)
}
