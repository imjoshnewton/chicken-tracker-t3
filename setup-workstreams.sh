#!/bin/bash

# Script to set up 3 workstreams for flock refactoring
# This should be run from the parent directory

echo "Setting up 3 workstreams for flock refactoring..."

# Get the current directory name
CURRENT_DIR=$(basename "$PWD")
PARENT_DIR=$(dirname "$PWD")

# Create the 3 workstream directories
echo "Creating workstream directories..."
cd "$PARENT_DIR"

# Clone the current repository 3 times
for i in 1 2 3; do
  WORKSTREAM_DIR="chicken-tracker-refactor-$i"
  
  if [ -d "$WORKSTREAM_DIR" ]; then
    echo "Directory $WORKSTREAM_DIR already exists, skipping..."
  else
    echo "Cloning repository to $WORKSTREAM_DIR..."
    cp -R "$CURRENT_DIR" "$WORKSTREAM_DIR"
    
    # Enter the new directory
    cd "$WORKSTREAM_DIR"
    
    # Create a new branch for this workstream
    git checkout -b "flock-refactor-workstream-$i"
    
    # Update package.json to use a different port
    PORT=$((3002 + $i))
    
    # Update the dev script in package.json to use the new port
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "s/\"dev\": \"next dev\"/\"dev\": \"next dev -p $PORT\"/" package.json
    else
      # Linux
      sed -i "s/\"dev\": \"next dev\"/\"dev\": \"next dev -p $PORT\"/" package.json
    fi
    
    echo "Configured workstream $i to run on port $PORT"
    
    # Copy .env files if they exist
    if [ -f "../$CURRENT_DIR/.env" ]; then
      cp "../$CURRENT_DIR/.env" .env
    fi
    if [ -f "../$CURRENT_DIR/.env.local" ]; then
      cp "../$CURRENT_DIR/.env.local" .env.local
    fi
    
    # Go back to parent directory
    cd "$PARENT_DIR"
  fi
done

echo "Setup complete! You now have 3 workstreams:"
echo "1. chicken-tracker-refactor-1 (port 3003)"
echo "2. chicken-tracker-refactor-2 (port 3004)"
echo "3. chicken-tracker-refactor-3 (port 3005)"
echo ""
echo "To start working in a workstream:"
echo "cd ../chicken-tracker-refactor-1"
echo "npm install"
echo "npm run dev"