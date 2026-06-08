#!/usr/bin/env bash
# teardown.sh — stop and clean up the Synergy Fabric network
set -euo pipefail

cd "$(dirname "$0")/.."

echo "▶ Stopping containers..."
docker compose down --volumes --remove-orphans

echo "▶ Removing generated artifacts..."
rm -rf crypto-config channel-artifacts bin

echo "▶ Removing chaincode images..."
docker rmi $(docker images | grep "synergy" | awk '{print $3}') 2>/dev/null || true

echo "Network torn down."
