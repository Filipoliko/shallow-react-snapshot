#!/bin/bash

# Exit on error as the http-server command clears the console and all errors are lost
set -e

# @TODO: Add React 19, it has a different file structure and needs to be handled a bit differently
REACT_VERSION_LIST="16 17 18"

# React version selector
echo "Select React version:"
select REACT_VERSION in $REACT_VERSION_LIST; do
  break
done

function findDependency() {
  local dependency=$1
  node -e "const findDependency = require('./scripts/lib/findDependency.js'); console.log(findDependency('$dependency', 'react-$REACT_VERSION'))"
}

# Cleanup playground/dist
rm -r playground/dist || echo "No dist folder to remove"
mkdir -p playground/dist

# Copy react files to playground
cp $(findDependency react)/umd/react.development.js playground/dist/
cp $(findDependency react-dom)/umd/react-dom.development.js playground/dist/

# Run the TypeScript compiler in watch mode
tsc ./playground/main.jsx --outFile playground/dist/main.js --jsx react --allowUmdGlobalAccess --allowJs --watch &

PID=$!

# Kill the TypeScript compiler when the script exits
trap "kill $PID" EXIT

# Run the local server
http-server playground
