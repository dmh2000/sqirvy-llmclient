.PHONY:  build test clean

build: lint
	@echo "no build for pkg/util"

lint:
	golangci-lint run ./...

test:
	@echo "Testing pkg/util"
	go test .

clean:
	@echo "pkg/util"