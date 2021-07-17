#!/usr/bin/env bash
# start the remote docker agent
# keep the agent running, even if it errors
export AUTH_TOKEN=${AUTH_TOKEN:-debug}
. ../venv3/bin/activate
while : ; do
    date
    gunicorn -w 4 --bind 0.0.0.0:5550 --reload wsgi:app
    sleep 10
done
