#!/bin/bash

echo "Setting up 3 workstreams in subdirectories..."

# Files and directories to copy to each workstream
COPY_LIST=(
  "package.json"
  "package-lock.json"
  "tsconfig.json"
  "next.config.mjs"
  "tailwind.config.cjs"
  "postcss.config.cjs"
  "prettier.config.cjs"
  "components.json"
  "drizzle.config.ts"
  ".eslintrc.cjs"
  "next-env.d.ts"
  "next-pwa.d.ts"
  "src"
  "public"
  "prisma"
)

# Copy files to each workstream
for i in 1 2 3; do
  WORKSTREAM_DIR="workstream-$i"
  echo "Setting up $WORKSTREAM_DIR..."
  
  # Copy all necessary files
  for item in "${COPY_LIST[@]}"; do
    if [ -e "$item" ]; then
      cp -R "$item" "$WORKSTREAM_DIR/"
    fi
  done
  
  # Copy .env files if they exist
  if [ -f ".env" ]; then
    cp .env "$WORKSTREAM_DIR/"
  fi
  if [ -f ".env.local" ]; then
    cp .env.local "$WORKSTREAM_DIR/"
  fi
  
  # Update package.json to use different port
  PORT=$((3002 + $i))
  cd "$WORKSTREAM_DIR"
  
  # Create a modified package.json with the new port
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"dev\": \"next dev\"/\"dev\": \"next dev -p $PORT\"/" package.json
  else
    # Linux
    sed -i "s/\"dev\": \"next dev\"/\"dev\": \"next dev -p $PORT\"/" package.json
  fi
  
  echo "Configured $WORKSTREAM_DIR to run on port $PORT"
  
  cd ..
done

echo ""
echo "Setup complete! You now have 3 workstreams:"
echo "- workstream-1 (port 3003)"
echo "- workstream-2 (port 3004)" 
echo "- workstream-3 (port 3005)"
echo ""
echo "To start a workstream:"
echo "cd workstream-1 && npm install && npm run dev"