.PHONY: build test clean

# SILENT := -s
build: lint
	$(MAKE) -C cmd/sqirvy-cli build

lint:
	golangci-lint run *.go
	$(MAKE) -C cmd/sqirvy-cli lint


test:
	@echo "Testing sqirvy-llmclient package"
	go test -v -timeout 2m .
	$(MAKE) -C cmd/sqirvy-cli test

clean:
	$(MAKE) -C cmd/sqirvy-cli clean


# Create a git tag based on the version in cmd/sqirvy-cli/cmd/VERSION
tag:
	@version=$$(cat cmd/sqirvy-cli/cmd/VERSION); \
	 echo "Tagging version $$version"; \
	 echo git tag -a $$version -m "Release version $$version"; \