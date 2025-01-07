#!/bin/bash

# Exit on error as the http-server command clears the console and all errors are lost
set -e

MIN_REACT_VERSION=16
MAX_REACT_VERSION=19

# React version selector
# Read user input
read -p "React version (>=$MIN_REACT_VERSION && <=$MAX_REACT_VERSION): " REACT_VERSION

REACT_MAJOR_VERSION=$(echo $REACT_VERSION | cut -d '.' -f 1)

# Check if the React version is valid
if [[ $REACT_MAJOR_VERSION -lt $MIN_REACT_VERSION || $REACT_MAJOR_VERSION -gt $MAX_REACT_VERSION ]]; then
  echo "Invalid React version - supported versions are >=$MIN_REACT_VERSION && <=$MAX_REACT_VERSION"
  exit 1
fi

# Cleanup playground/dist
rm -r playground/dist || echo "No dist folder to remove"
mkdir -p playground/dist

# Run the TypeScript compiler in watch mode
tsc ./playground/main.jsx --outFile playground/dist/main.js --jsx react --allowUmdGlobalAccess --allowJs --watch &
PID=$!
# Kill the TypeScript compiler when the script exits
trap "kill $PID" EXIT

sleep 1

# Replace the React dependency in the playground HTML file
REACT_UMD_LINK="https://esm.sh/react@$REACT_VERSION/?dev"
REACT_DOM_UMD_LINK="https://esm.sh/react-dom@$REACT_VERSION/client?dev"

# Before React 18, react-dom did not have a client build
if [ $REACT_MAJOR_VERSION -lt 18 ]; then
  REACT_DOM_UMD_LINK="https://esm.sh/react-dom@$REACT_VERSION/?dev"
fi

sed "s#__REACT_UMD_LINK__#$REACT_UMD_LINK#g" playground/index.html |
sed "s#__REACT_DOM_UMD_LINK__#$REACT_DOM_UMD_LINK#g" > playground/dist/index.html

# Run the local server
http-server playground/dist
