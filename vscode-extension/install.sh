#!/bin/bash

echo "🚀 CREATOR Assembly Debugger - Installation Script"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "✅ TypeScript compiled successfully"

# Check if vsce is installed globally
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing vsce (Visual Studio Code Extension Manager)..."
    npm install -g vsce
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Failed to install vsce globally. You can install it manually with: npm install -g vsce"
    else
        echo "✅ vsce installed successfully"
    fi
fi

# Package the extension
echo "📦 Packaging extension..."
vsce package

if [ $? -eq 0 ]; then
    echo "✅ Extension packaged successfully!"
    echo ""
    echo "📋 Installation Instructions:"
    echo "1. Open Visual Studio Code"
    echo "2. Go to Extensions view (Ctrl+Shift+X)"
    echo "3. Click on the '...' menu and select 'Install from VSIX...'"
    echo "4. Select the generated .vsix file in this directory"
    echo ""
    echo "🚀 Or install from command line:"
    echo "   code --install-extension creator-assembly-debugger-1.0.0.vsix"
else
    echo "⚠️  Extension packaging failed, but the extension can still be used in development mode"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Start the CREATOR RPC server:"
echo "   cd ../rpc-server && deno run --allow-net --allow-read --allow-env server.mts"
echo ""
echo "2. Open an assembly file (.s, .asm, .S) in VSCode"
echo "3. Click the 'Start CREATOR Debugging' button in the toolbar"
echo ""
echo "🎉 Installation complete!"
