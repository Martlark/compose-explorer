#!/usr/bin/env bash
# start the remote docker agent from the repository root directory
# keep the agent running, even if it errors
# AUTH_TOKEN is the header based security token to ensure
# only authorized UI is talking to the agent
export AUTH_TOKEN=${AUTH_TOKEN:-debug}
. ./venv3/bin/activate
COUNTER=1

quit(){
  exit
}

trap quit sigint

while : ; do
    date
    pip install -r requirements.txt
    gunicorn -c gunicorn_conf.py --chdir ./agent -w 4 --bind 0.0.0.0:5550 --reload wsgi:app
    echo "Sleeping $((10 * COUNTER)) seconds after exit"
    sleep $((10 * COUNTER))
    COUNTER=$((COUNTER + 1))
done
