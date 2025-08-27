.PHONY: build test clean lint

PROJECT=sqirvy-cli
BINDIR=../bin

# detect target OS and architecture
ifeq ($(filter Windows%, $(OS)),Windows)
    arch := Windows
	goarch := amd64
else
    arch := $(shell uname -s)
	ifeq ($(arch),Darwin)
		arch := darwin
		goarch := arm64
	else 
		ifeq ($(arch),Linux)
			arch := linux
			goarch := amd64
		else 
			echo "Unsupported OS: $(arch)"
			exit 1
		endif
	endif
endif

build: lint
	@echo $(arch) $(goarch)
	mkdir -p $(BINDIR)
	GOOS=$(arch) GOARCH=amd64 go build -o $(BINDIR)/$(PROJECT) .
	
# build with compression 
# rm $(BINDIR)/$(PROJECT)
# GOOS=$(arch) GOARCH=amd64 go build . 
# upx -1 -o $(BINDIR)/$(PROJECT) $(PROJECT)

lint: 
	golangci-lint run ./...

test:
	@./test.sh 
	@echo "Tests passed"
	
clean:
	@echo "Cleaning $(PROJECT)"