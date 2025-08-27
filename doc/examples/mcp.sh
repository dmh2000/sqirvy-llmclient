#!/bin/bash




export BINDIR=../bin  
make -C ../cmd
cat mcp.md  | $BINDIR/sqirvy-cli  -m claude-sonnet-4-20250514
# echo "say hello" | $BINDIR/sqirvy-cli  -m claude-sonnet-4-20250514




