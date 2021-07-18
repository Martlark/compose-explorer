# WSGI start script for gunicorn in docker
# usage: gunicorn -c gunicorn_conf.py main:app --threads 2 -b 0.0.0.0:80

from app import create_app

app = create_app()
