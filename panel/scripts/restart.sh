#!/bin/bash

if ! tmux has-session -t minecraft 2>/dev/null; then
    echo "Server is offline, starting the server instead..."
    bash ~/panel/scripts/start.sh
    exit 0
fi

echo "Shutting down the server..."
tmux send-keys -t minecraft "stop" Enter

echo "Waiting for the server to stop...(10 seconds)"
sleep 10

echo "Starting server..."
bash ~/panel/scripts/start.sh

echo "Server restarted."