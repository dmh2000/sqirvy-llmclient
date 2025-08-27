// Package cmd implements the command-line interface commands for the sqirvy-cli tool.
// It provides functionality for executing queries against various AI models and
// handling command-line arguments and flags.
package cmd

import (
	"context"
	_ "embed"
	"fmt"
	"os"

	sqirvy "github.com/dmh2000/sqirvy-llmclient"
)

// executeQuery processes and executes an AI model query with the given system prompt and arguments.
// It handles model selection, temperature settings, and communication with the AI provider.
//
// Parameters:
//   - cmd: The Cobra command instance containing parsed flags
//   - sysprompt: The system prompt to provide context to the AI model
//   - args: Additional arguments to be processed as part of the query
//
// Returns:
//   - string: The model's response text
//   - error: Any error encountered during execution
func executeQuery(model string, temperature float64, system string, args []string) (string, error) {
	// check if it has an alias
	model = sqirvy.GetModelAlias(model)

	// Print the selected model to stderr
	fmt.Fprintln(os.Stderr, "Using model :", model)

	// Process system prompt and arguments into query prompts
	prompts, err := readPrompt(args)
	if err != nil {
		return "", fmt.Errorf("error: reading prompt:[]string{\n%v", err)
	}

	// Determine the AI provider based on the selected model
	provider, err := sqirvy.GetProviderName(model)
	if err != nil {
		// many of the models are not registered with this package
		// use user model name and assume openai compatible provider
		provider = "openai"
	}

	// Create client for the provider
	client, err := sqirvy.NewClient(provider)
	if err != nil {
		return "", fmt.Errorf("error: creating client for provider %s: %v", provider, err)
	}
	defer func() {
		err := client.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "error closing client: %v\n", err)
		}
	}()

	// Configure query options and execute the query
	options := sqirvy.Options{Temperature: float32(temperature), MaxTokens: sqirvy.GetMaxTokens(model)}
	ctx := context.Background()
	response, err := client.QueryText(ctx, system, prompts, model, options)
	if err != nil {
		return "", fmt.Errorf("error: querying model %s: %v", model, err)
	}

	return response, nil
}
