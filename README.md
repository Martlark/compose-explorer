# Docker Explorer

A project to allow remote management of docker-compose containers on remote servers.

There is a Flask app to run the interface, and a gunicorn agent to control the containers.

The agent runs on the same server as the docker-compose containers.

## Goals

* View all containers on a server (done)
* Allow start, stop and restart of containers (done)
* View logs (done)
* Explore files on a container (done)
* Download logs (done)
* Copy out of a container (done)
* Run commands on a container (done)
* Improve understanding of React JS

## Installation

### Agent

Clone the repo to the docker server.  
Create a virtual env named venv3 with Python 3.
Install the requirements.
Edit the start-agent.sh file and set the AUTH_TOKEN value to a suitable security string.
Start the agent by running start-agent.sh

### UI

Clone the repo to the docker server.  
Create a virtual env named venv3 with Python 3.
Install the requirements.



