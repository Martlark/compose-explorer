# Docker Explorer

A project to allow remote management of docker-compose containers on remote servers.

There is a Flask app to run the interface, and a gunicorn agent to control the containers.

The agent runs on the same server as the docker-compose containers.

## Features

* View all containers on a server.
* Start, stop and restart of containers.
* View and download logs.
* Explore files, edit, delete, upload and download of a container.
* Run commands on a container.
* Use git commands on docker-compose directories.
* Run docker-compose commands in a docker-compose directory.

## Installation

### Agent

The agent is required to be run on each server that hosts your docker-container
instances.

#### Instructions

Clone the repo to the docker server.  
Create a virtual env named venv3 with Python 3.
Install the requirements.
Edit the start-agent.sh file and set the AUTH_TOKEN value to a suitable security string.
Make sure the user running the agent is in the `docker` group.
Start the agent by running start-agent.sh

#### Agent communication security

To ensure only authorized access to your server agent make an AUTH_TOKEN environment
variable that will be used as the credentials in the UI.

### UI

#### Native

Clone the repo to the docker server.  
Create a virtual env named venv3 with Python 3.
Install the requirements.

#### Docker



