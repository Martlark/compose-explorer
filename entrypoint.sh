#!/bin/sh
python run.py
# gunicorn -c gunicorn_conf.py main:app --threads 2 -b 0.0.0.0:80
