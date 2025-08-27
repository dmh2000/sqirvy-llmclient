# AI Client APIs Documentation

This document describes the APIs available for interacting with various AI providers (Anthropic, Google Gemini, and OpenAI).

## Common Interface

All providers implement the following interface for making queries. See client.go for the full interface definition.

```go
// client.go and models.go
const (
    Anthropic string = "anthropic" // Anthropic's Claude models
    Gemini    string = "gemini"    // Google's Gemini models
    OpenAI    string = "openai"    // OpenAI's GPT models
)

type Options struct {
    Temperature float32 // Controls randomness (0.0-1.0)
    MaxTokens   int64   // Maximum tokens in response
    APIKey      string  // Optional API key override
    BaseUrl     string  // Optional Base URL override
}

type Client interface {
    QueryText(ctx context.Context, system string, prompts []string, model string, options Options) (string, error)
    Close() error
}

func NewClient(provider string) (Client, error)
```

## Usage Example

See the code in directory 'examples' for complete examples of using the client APIs.

```go
model := "gemini-2.5-flash"
systemPrompt := "you are a helpful chatbot"
userPrompts := []string{"What is the meaning of life?"}

// Create a new client
client, err := NewClient("gemini")
if err != nil {
    log.Fatal(err)
}
defer client.Close()

// Configure options
options := Options{
    Temperature: 0.5,   // 0.0-1.0 range
    MaxTokens: 8192,    // Default token limit
}

// Query for text
ctx := context.Background()
response, err := client.QueryText(ctx, systemPrompt, userPrompts, model, options)
if err != nil {
    log.Fatal(err)
}
```

## Error Handling

All methods return errors in the following cases:

- Missing API keys
- Empty or invalid prompts
- Invalid temperature values (must be 0.0-1.0)
- API request failures
- Invalid responses

## Environment Variables

The following environment variables are used:

- `ANTHROPIC_API_KEY` - For Anthropic Claude API access
- `GEMINI_API_KEY` - For Google Gemini API access
- `OPENAI_API_KEY` - For OpenAI API access

## Provider-Specific Implementations

### Anthropic Client

The Anthropic client interfaces with Claude models via the Anthropic API using LangChain.

#### Models

- `claude-sonnet-4-20250514` (alias: `claude-sonnet-4`) - 64,000 max output tokens
- `claude-opus-4-1-20250805` (alias: `claude-opus-4-1`) - 32,000 max output tokens
- `claude-3-5-haiku-20241022` (alias: `claude-3-5-haiku`) - 8,096 max output tokens

### Google Gemini Client

The Gemini client interfaces with Google's Gemini models using LangChain.

#### Models

- `gemini-2.5-pro` - 64,000 max output tokens
- `gemini-2.5-flash` - 64,000 max output tokens

### OpenAI Client

The OpenAI client interfaces with GPT models via the OpenAI API using LangChain.

#### Models

- `gpt-5` - 64,000 max output tokens  
- `gpt-5-mini` - 64,000 max output tokens

#### Common Features

All clients:
- Use LangChain for consistent API interactions
- Support temperature control (0.0-1.0 range)
- Configurable max tokens per model
- Return error if prompt is empty
- 15-second request timeout
- Support optional API key and base URL overrides

## Utility Functions

The CLI tool provides utility functions in `cmd/sqirvy-cli/cmd/util/` for:

### File Operations

```go
// Check if input is from stdin/pipe
func IsFromStdin() (bool, error)

// Read from stdin if available
func ReadStdin(maxTotalBytes int64) (data string, size int64, err error)

// Read from files
func ReadFile(fname string, maxTotalBytes int64) ([]byte, int64, error)
func ReadFiles(filenames []string, maxTotalBytes int64) (string, int64, error)
```

### Web Scraping

```go
// Scrape content from URLs
func ScrapeURL(link string) (string, error)
func ScrapeAll(urls []string) (string, error)
```

These utilities handle:
- File path validation and cleaning with `filepath.Clean()` and `filepath.EvalSymlinks()`
- Size limit enforcement to prevent memory issues
- Error handling for missing/invalid files
- URL validation and scraping using Colly
- Content formatting with Markdown code blocks
- Stdin detection for pipeline usage
