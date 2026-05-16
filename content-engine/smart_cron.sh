#!/bin/bash
# ============================================================
# TRIKAL VAANI - Smart Cron Wrapper v1.0
# ============================================================
# Runs daily at 5 AM IST
# Python engine checks Supabase festivals_master internally
# This wrapper handles logging, lock files, and timezone
# ============================================================

set -u  # error on undefined variables

# Paths
ENGINE_DIR="/home/vaanitrikal/trikal-vaani/content-engine"
VENV_PYTHON="/home/vaanitrikal/trikal-env/bin/python3"
ENGINE_SCRIPT="$ENGINE_DIR/trikal_content_engine.py"
LOG_FILE="/tmp/trikal_cron.log"
LOCK_FILE="/tmp/trikal_cron.lock"
MAX_LOG_SIZE=10485760  # 10 MB

# Timestamp helper
ts() {
  date '+%Y-%m-%d %H:%M:%S IST'
}

# Rotate log if too big
if [ -f "$LOG_FILE" ]; then
  size=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_LOG_SIZE" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
    echo "[$(ts)] Log rotated" > "$LOG_FILE"
  fi
fi

# Prevent overlap (if previous run hangs)
if [ -f "$LOCK_FILE" ]; then
  lock_age=$(($(date +%s) - $(stat -c%Y "$LOCK_FILE")))
  if [ "$lock_age" -lt 3600 ]; then
    echo "[$(ts)] Previous run still active (lock age ${lock_age}s). Exiting." >> "$LOG_FILE"
    exit 1
  else
    echo "[$(ts)] Stale lock removed (age ${lock_age}s)" >> "$LOG_FILE"
    rm -f "$LOCK_FILE"
  fi
fi

# Create lock
touch "$LOCK_FILE"

# Cleanup on exit
trap 'rm -f "$LOCK_FILE"' EXIT

# Banner
echo "" >> "$LOG_FILE"
echo "================================================" >> "$LOG_FILE"
echo "[$(ts)] TRIKAL CRON RUN START" >> "$LOG_FILE"
echo "================================================" >> "$LOG_FILE"

# Source env vars (cron doesn't inherit user bashrc by default)
if [ -f "/home/vaanitrikal/.bashrc" ]; then
  set +u
  source /home/vaanitrikal/.bashrc
  set -u
fi

# Verify required vars present
for var in GEMINI_API_KEY SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "[$(ts)] ERROR: $var not set. Aborting." >> "$LOG_FILE"
    exit 1
  fi
done

# Pull latest code from GitHub (optional - comment if not wanted)
cd /home/vaanitrikal/trikal-vaani 2>>"$LOG_FILE"
git pull origin main >> "$LOG_FILE" 2>&1

# Run engine
cd "$ENGINE_DIR"
echo "[$(ts)] Running engine..." >> "$LOG_FILE"
"$VENV_PYTHON" "$ENGINE_SCRIPT" >> "$LOG_FILE" 2>&1
exit_code=$?

echo "[$(ts)] Engine exited with code $exit_code" >> "$LOG_FILE"
echo "================================================" >> "$LOG_FILE"

exit $exit_code
