#!/bin/bash

BINDIR=../../bin
TARGET=$BINDIR/sqirvy-cli
TESTDIR=./test

# Get the list of all supported models
models=(
	"claude-sonnet-4-20250514",
	"claude-opus-4-1-20250805",
	"claude-3-5-haiku-20241022",
	"gemini-2.5-pro",
	"gemini-2.5-flash",
	"gpt-5",
	"gpt-5-mini",
)

# Simple query to test with
query="hello"

# Create directory for test outputs if it doesn't exist
TESTDIR="./test"
mkdir -p "$TESTDIR"

# Test each model
for model in "${models[@]}"; do
    echo "==============================================================="
    echo "Testing model: $model"
    echo "==============================================================="
    output_file="$TESTDIR/query_${model}.txt"
    echo "$query" | $TARGET query -m "$model" > "$output_file" 2>&1
    
    # Get the exit code
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "Test succeeded for $model. Response saved to $output_file"
        # Display first 3 lines of the output
        head -n 3 "$output_file"
        echo "..."
    else
        echo "Test failed for $model with exit code $exit_code"
        cat "$output_file"
    fi
    echo "==============================================================="
    echo ""
done

echo "All tests completed"