// Package sqirvy provides a unified interface for interacting with various AI language models.
//
// The package supports multiple AI providers including:
// - Anthropic (Claude models)
// - Google (Gemini models)
// - OpenAI (GPT models)
//
// It provides a consistent interface for making text and JSON queries while handling
// provider-specific implementation details internally.
package sqirvy

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/tmc/langchaingo/llms"
)

const (
	// MAX_TOKENS_DEFAULT is the default maximum number of tokens in responses
	MAX_TOKENS_DEFAULT = 4096

	// request timeout in seconds
	RequestTimeout = time.Second * 15

	// controls output to stderr
	DebugMode = false
)

// Options combines all provider-specific options into a single structure.
// This allows for provider-specific configuration while maintaining a unified interface.
type Options struct {
	Temperature float32 // Controls the randomness of the output
	MaxTokens   int64   // Maximum number of tokens in the response
	APIKey      string  // Optional API key override
	BaseUrl     string  // Optional Base URL override
}

// Client provides a unified interface for AI operations.
// It abstracts away provider-specific implementations behind a common interface
// for making text and JSON queries to AI models.
type Client interface {
	QueryText(ctx context.Context, system string, prompts []string, model string, options Options) (string, error)
	Close() error
}

// NewClient creates a new AI client for the specified provider
func NewClient(provider string) (Client, error) {
	switch provider {
	case Anthropic:
		client, err := NewAnthropicClient()
		if err != nil {
			return nil, fmt.Errorf("failed to create client for provider %s: %w", provider, err)
		}
		return client, nil
	case Gemini:
		client, err := NewGeminiClient()
		if err != nil {
			return nil, fmt.Errorf("failed to create client for provider %s: %w", provider, err)
		}
		return client, nil
	case OpenAI:
		client, err := NewOpenAIClient()
		if err != nil {
			return nil, fmt.Errorf("failed to create client for provider %s: %w", provider, err)
		}
		return client, nil
	default:
		return nil, fmt.Errorf("unsupported provider: %s", provider)
	}
}

func queryTextLangChain(ctx context.Context, llm llms.Model, system string, prompts []string, model string, options Options) (string, error) {
	if ctx.Err() != nil {
		return "", fmt.Errorf("request context error %w", ctx.Err())
	}

	if len(prompts) == 0 {
		return "", fmt.Errorf("prompts cannot be empty for text query")
	}

	// system prompt
	content := []llms.MessageContent{
		llms.TextParts(llms.ChatMessageTypeSystem, system),
	}

	// query prompts
	for _, prompt := range prompts {
		content = append(content, llms.TextParts(llms.ChatMessageTypeHuman, prompt))
	}

	// generate completion
	completion, err := llm.GenerateContent(
		ctx, content,
		llms.WithTemperature(float64(options.Temperature)),
		llms.WithModel(model),
		llms.WithMaxTokens(int(options.MaxTokens)),
	)
	if err != nil {
		return "", fmt.Errorf("failed to generate completion: %w", err)
	}

	var response strings.Builder
	for _, part := range completion.Choices {
		if DebugMode {
			fmt.Fprintf(os.Stderr, "response completion %s:%v\n", model, part.StopReason)
		}
		response.WriteString(part.Content)
	}

	return response.String(), nil
}
