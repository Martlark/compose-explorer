#!/bin/sh
export FLASK_APP=main.py
flask db upgrade
gunicorn -c gunicorn_conf.py main:app --threads 2 -b 0.0.0.0:80
