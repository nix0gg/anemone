#!/bin/bash

if ! tmux has-session -t minecraft 2>/dev/null; then
    echo "Server is already offline, exiting with code 1."
    exit 1

fi

tmux send-keys -t minecraft "stop" Enter

echo "Server stopped."