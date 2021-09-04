# Compose Explorer

A project to allow remote management of docker-compose containers on remote servers.

There is a Flask app to run the interface, and an agent to control the containers.

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

 * Clone the repo to the docker server.  
 * Create and activate a virtual env named venv3 with Python 3.
 * Install the requirements.
 * Export AUTH_TOKEN or edit the start-agent.sh file and set the AUTH_TOKEN value to a suitable security string.
 * Make sure the user running the agent is in the `docker` group.
 * Start the agent by running `./agent/start-agent.sh` from the repo root.

#### Agent communication security

To ensure only authorized access to your server agent make an AUTH_TOKEN environment
variable that will be used as the credentials in the UI.

### UI

#### Native

 * Clone the repo to the docker server.  
 * Create and activate virtual env named venv3 with Python 3.
 * Install the requirements.
 * Use `entrypoint.sh` to start with Gunicorn

#### Docker

Use the included `docker-compose.yaml` to start in a docker container.
Adjust environment variables as required.

## LDAP

User authentication via LDAP is supported.

### Environment Setup.

The LDAP connection can be configured by adding environment variables before
the server starts.   These defaults NEED to be changed.

|  Env name    | default   | description
| -------- | --------- | -----------
| LDAP_SERVER | ldap://andrew:389 | server address and port
| LDAP_ROOT_DN | dc=andrew,dc=local, cn=users | LDAP group where users are located
| LDAP_USER_DN_FORMAT | cn={cn},{LDAP_ROOT_DN} | Python format with username to lookup using {LDAP_ROOT_DN}.  {cn} is the name from the login screen
| LDAP_USER_EMAIL_FORMAT | {uid}@ldap.com | Python format to create the _required_ email address after login {uid} is sourced as a user attribute 
| LDAP_ATTRIBUTES_FILTER | (objectClass=*) | LDAP filter for searching user
| LDAP_ADMIN_MATCH | attributes.get('businessCategory') in ['admin'] | Python filter to determine who is an admin
| LDAP_FIRST_NAME | givenName | LDAP attribute for first name
| LDAP_LAST_NAME | sn | LDAP attribute for last name

#### LDAP_USER_EMAIL_FORMAT

Compose Explorer uses this format string to store and lookup LDAP users in its 
internal user directory.  Each generated email must be unique.

#### LDAP_ADMIN_MATCH

Admin users, who have special privileges, are determined on first login.  The LDAP_ADMIN_MATCH
setting is a Python evaluation string when evaluating to True makes this user an admin.

attributes is a Python dictionary with all the attributes from the LDAP user.  As 
LDAP attributes are always lists and before values are put into `attributes` the 
first value of each attribute is extracted.

In the example the `businessCategory` attribute should be `admin`.
