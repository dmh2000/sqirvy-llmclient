// Package main implements the sqirvy-cli command line tool.
// sqirvy-cli is a versatile AI-powered tool that provides functionality
// for code generation, review, planning, and querying across multiple
// AI model providers.
package main

import "github.com/dmh2000/sqirvy-llmclient/cmd/sqirvy-cli/cmd"

func main() {
	cmd.Execute()
}
