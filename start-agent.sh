#!/usr/bin/env bash
# start the remote docker agent
# keep the agent running, even if it errors
while : ; do
    date
    venv3/bin/python agent.py
    sleep 10
done
