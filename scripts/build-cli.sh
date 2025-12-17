#!/bin/bash
# CREATOR CLI Build Script
# This script compiles the CLI with a minimal node_modules to reduce binary size

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CLI_DEPS_DIR="$PROJECT_DIR/cli"

# Install CLI-only dependencies if needed
install_cli_deps() {
    echo "Installing CLI dependencies..."
    cd "$CLI_DEPS_DIR"
    
    # Use bun if available, otherwise npm
    if command -v bun &> /dev/null; then
        bun install --production
    else
        echo "Error: Bun not found. Please install Bun."
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Check if CLI deps are installed
if [ ! -d "$CLI_DEPS_DIR/node_modules" ]; then
    install_cli_deps
fi

# Parse command line arguments
OUTPUT="creator-cli"
TARGET=""
REINSTALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --output|-o)
            OUTPUT="$2"
            shift 2
            ;;
        --target|-t)
            TARGET="--target $2"
            shift 2
            ;;
        --reinstall|-r)
            REINSTALL=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--output NAME] [--target TARGET] [--reinstall]"
            echo "Targets: x86_64-unknown-linux-gnu, aarch64-unknown-linux-gnu,"
            echo "         x86_64-pc-windows-msvc, x86_64-apple-darwin, aarch64-apple-darwin"
            exit 1
            ;;
    esac
done

# Reinstall deps if requested
if [ "$REINSTALL" = true ]; then
    rm -rf "$CLI_DEPS_DIR/node_modules"
    install_cli_deps
fi

echo "Building CREATOR CLI..."
echo "Output: $OUTPUT"
if [ -n "$TARGET" ]; then
    echo "Target: $TARGET"
fi

# Set up symlink to CLI node_modules if not already correct
# Use a lock file to prevent race conditions in parallel builds
CREATED_SYMLINK=false
if [ -L "$PROJECT_DIR/node_modules" ]; then
    # Symlink exists - check if it points to the right place
    LINK_TARGET=$(readlink "$PROJECT_DIR/node_modules")
    if [ "$LINK_TARGET" != "$CLI_DEPS_DIR/node_modules" ] && [ "$LINK_TARGET" != "cli/node_modules" ]; then
        rm "$PROJECT_DIR/node_modules"
        ln -s "$CLI_DEPS_DIR/node_modules" "$PROJECT_DIR/node_modules"
        CREATED_SYMLINK=true
    fi
elif [ -d "$PROJECT_DIR/node_modules" ]; then
    echo "Warning: Found existing node_modules directory, removing it for CLI build"
    rm -rf "$PROJECT_DIR/node_modules"
    ln -s "$CLI_DEPS_DIR/node_modules" "$PROJECT_DIR/node_modules"
    CREATED_SYMLINK=true
elif [ ! -e "$PROJECT_DIR/node_modules" ]; then
    # No node_modules exists, create symlink
    ln -s "$CLI_DEPS_DIR/node_modules" "$PROJECT_DIR/node_modules"
    CREATED_SYMLINK=true
fi

# Base compile options
INCLUDE_OPTS="--include ./src/core/assembler/creatorAssembler/deno"

# Exclusions - web stuff since we have minimal node_modules now
EXCLUDE_OPTS=""
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./src/web"
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./examples"
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./tests"
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./gateway"
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./public"
EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude ./vscode-extension"

# Run deno compile
deno compile --no-check -A $INCLUDE_OPTS $EXCLUDE_OPTS $TARGET -o "$OUTPUT" ./src/cli/creator-cli.mts
BUILD_STATUS=$?

# Only clean up symlink if we created it (avoid race condition in parallel builds)
if [ "$CREATED_SYMLINK" = true ] && [ -L "$PROJECT_DIR/node_modules" ]; then
    rm "$PROJECT_DIR/node_modules"
fi

if [ $BUILD_STATUS -ne 0 ]; then
    echo "Build failed!"
    exit $BUILD_STATUS
fi

echo "Build complete: $OUTPUT"
# Handle Windows .exe extension
if [ -f "${OUTPUT}.exe" ]; then
    ls -lh "${OUTPUT}.exe"
else
    ls -lh "$OUTPUT"
fi

