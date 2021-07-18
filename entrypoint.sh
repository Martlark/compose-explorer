#!/bin/sh
# wait for the database to be ready
python db_ready.py
# apply any upgrades
export FLASK_APP=main.py
flask db upgrade
# start the server
gunicorn -c gunicorn_conf.py main:app --threads 2 -b 0.0.0.0:80
