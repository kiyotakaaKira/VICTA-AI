#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# Forensic AI Platform — Quick Start Script
# Run: bash start.sh
# ══════════════════════════════════════════════════════════

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

echo -e "\n${CYAN}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║    FORENSIC AI PLATFORM — STARTUP SEQUENCE       ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n"

# Check required tools
for cmd in node npm; do
  if ! command -v $cmd &>/dev/null; then
    echo -e "${RED}✗ $cmd is not installed. Please install Node.js 18+.${RESET}"
    exit 1
  fi
done

echo -e "${GREEN}✓ Node $(node -v) detected${RESET}"

# Check env files
if [ ! -f "./frontend/.env.local" ]; then
  echo -e "${YELLOW}⚠  frontend/.env.local not found — copying from template${RESET}"
  cp ./frontend/.env.local.example ./frontend/.env.local 2>/dev/null || true
  echo -e "${YELLOW}   → Fill in your API keys in frontend/.env.local before running${RESET}"
fi

if [ ! -f "./backend/.env" ]; then
  echo -e "${YELLOW}⚠  backend/.env not found — copying from template${RESET}"
  cp ./backend/.env.example ./backend/.env 2>/dev/null || true
  echo -e "${YELLOW}   → Fill in your API keys in backend/.env before running${RESET}"
fi

# Install dependencies
echo -e "\n${CYAN}[1/4] Installing backend dependencies...${RESET}"
cd backend && npm install --silent && cd ..

echo -e "${CYAN}[2/4] Installing frontend dependencies...${RESET}"
cd frontend && npm install --silent && cd ..

echo -e "${GREEN}✓ Dependencies installed${RESET}\n"

# Start both servers
echo -e "${CYAN}[3/4] Starting Express backend on port 5000...${RESET}"
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

echo -e "${CYAN}[4/4] Starting Next.js frontend on port 3000...${RESET}"
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║  ✓ FORENSIC AI PLATFORM IS RUNNING               ║${RESET}"
echo -e "${GREEN}║                                                    ║${RESET}"
echo -e "${GREEN}║  Frontend:  http://localhost:3000                  ║${RESET}"
echo -e "${GREEN}║  Backend:   http://localhost:5000                  ║${RESET}"
echo -e "${GREEN}║  Health:    http://localhost:5000/api/health       ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${RESET}\n"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${RESET}\n"

# Trap Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '\n${RED}Servers stopped.${RESET}'" INT
wait
