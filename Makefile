.PHONY: build test clean


build: lint
	$(MAKE) -C cmd/sqirvy-cli build

lint:
	@echo " ignore go version issues for staticcheck"
	@-staticcheck ./...
	golangci-lint run ./...

test:
	@echo "Testing pkg/sqirvy"
	go test -timeout 2m .
	$(MAKE) -C cmd/sqirvy-cli test

clean:
	$(MAKE) -C cmd/sqirvy-cli clean
