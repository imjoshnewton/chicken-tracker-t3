#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="FlockNerd"
SCHEME="FlockNerd"
WORKSPACE="ios/${APP_NAME}.xcworkspace"
ARCHIVE_PATH="ios/build/${APP_NAME}.xcarchive"
EXPORT_PATH="ios/build/export"
EXPORT_OPTIONS="ExportOptions.plist"

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FlockNerd iOS Build Script${NC}"
echo -e "${BLUE}========================================${NC}"

# Check for Diawi token
if [ -z "$DIAWI_TOKEN" ]; then
    echo -e "${YELLOW}Warning: DIAWI_TOKEN not set in .env${NC}"
    echo -e "${YELLOW}Build will complete but won't upload to Diawi${NC}"
    SKIP_DIAWI=true
fi

# Step 1: Prebuild
echo -e "\n${BLUE}[1/5] Running Expo Prebuild...${NC}"
bunx expo prebuild --platform ios --clean

# Step 2: Install CocoaPods
echo -e "\n${BLUE}[2/5] Installing CocoaPods...${NC}"
cd ios
pod install
cd ..

# Step 3: Archive
echo -e "\n${BLUE}[3/5] Building Archive...${NC}"
xcodebuild -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    archive \
    CODE_SIGN_STYLE=Automatic \
    | xcpretty || xcodebuild -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    archive \
    CODE_SIGN_STYLE=Automatic

# Step 4: Export IPA
echo -e "\n${BLUE}[4/5] Exporting IPA...${NC}"
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    -exportPath "$EXPORT_PATH" \
    -allowProvisioningUpdates

IPA_PATH="${EXPORT_PATH}/${APP_NAME}.ipa"

if [ ! -f "$IPA_PATH" ]; then
    echo -e "${RED}Error: IPA not found at ${IPA_PATH}${NC}"
    exit 1
fi

echo -e "${GREEN}IPA created: ${IPA_PATH}${NC}"

# Step 5: Upload to Diawi
if [ "$SKIP_DIAWI" = true ]; then
    echo -e "\n${YELLOW}[5/5] Skipping Diawi upload (no token)${NC}"
    echo -e "${GREEN}Build complete!${NC}"
    echo -e "IPA location: ${IPA_PATH}"
    exit 0
fi

echo -e "\n${BLUE}[5/5] Uploading to Diawi...${NC}"

# Upload to Diawi
UPLOAD_RESPONSE=$(curl -s "https://upload.diawi.com/" \
    -F "token=${DIAWI_TOKEN}" \
    -F "file=@${IPA_PATH}" \
    -F "find_by_udid=0" \
    -F "wall_of_apps=0")

JOB_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"job":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
    echo -e "${RED}Error: Failed to upload to Diawi${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo "Upload started, job ID: $JOB_ID"
echo "Waiting for processing..."

# Poll for result
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    sleep 2
    STATUS_RESPONSE=$(curl -s "https://upload.diawi.com/status?token=${DIAWI_TOKEN}&job=${JOB_ID}")

    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":[0-9]*' | cut -d':' -f2)

    if [ "$STATUS" = "2000" ]; then
        # Success
        HASH=$(echo "$STATUS_RESPONSE" | grep -o '"hash":"[^"]*"' | cut -d'"' -f4)
        LINK=$(echo "$STATUS_RESPONSE" | grep -o '"link":"[^"]*"' | cut -d'"' -f4)

        echo -e "\n${GREEN}========================================${NC}"
        echo -e "${GREEN}  Upload Complete!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo -e "\n${GREEN}Install Link:${NC} ${LINK}"
        echo -e "\nOpen this link on your iPhone to install ${APP_NAME}"

        # Copy to clipboard if available
        if command -v pbcopy &> /dev/null; then
            echo "$LINK" | pbcopy
            echo -e "${BLUE}(Link copied to clipboard)${NC}"
        fi

        # Also save to a file for reference
        echo "$LINK" > ios/build/diawi-link.txt
        echo -e "Link saved to: ios/build/diawi-link.txt"

        exit 0
    elif [ "$STATUS" = "4000" ]; then
        # Error
        MESSAGE=$(echo "$STATUS_RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}Error: ${MESSAGE}${NC}"
        exit 1
    fi

    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
done

echo -e "${RED}Timeout waiting for Diawi processing${NC}"
exit 1
