#!/bin/bash

if tmux has-session -t minecraft 2>/dev/null; then
    echo "Server is already running, exiting with code 1"
    exit 1

fi 

tmux new-session -d -s minecraft -x 220 -y 50
tmux send-keys -t minecraft "cd ~/minecraft && java -jar server.jar nogui" Enter

echo "Server started."