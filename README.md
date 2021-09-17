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

## Configuration 

Numerous configuration values can be changed by adding an environment
string with new values.  Configuration values are:

| env name | default | description
| -------- | ------- | -----------
| SECRET_KEY | NOT-VERY-SECRET | CSRF secret key
| DATABASE_URI | sql lite db | connection string to the user and project db
| SECURITY_PASSWORD_HASH | pbkdf2_sha512 | password algorithm
| SECURITY_PASSWORD_SALT |  | password salt
| TITLE | Compose Explorer | application title
| WTF_CSRF_TIME_LIMIT | two days | token expiry in seconds
| LOGIN_MESSAGE | Login email | User prompt on login page

## Security

You can use either the builtin database or an external LDAP service.

Defining `LDAP_SERVER` configuration environment variable will
enable the LDAP security mode.

### Users

Users are stored in the user database with their email address as 
the unique key.  First and Last name can be added if you like.  When operating
in LDAP security mode users cannot edit their details.

#### User types

Users can be either `user` or `admin`.  Admin users can:

* add groups
* edit users
* change passwords
* remove users
* view and manage audit records
* add servers

In addition, they have full control on all projects and containers.

An ordinary `user` has only those privileges as allowed by security
groups.  They may update their own passwords and details using the profile 
page.

### Groups

Read and write access to projects is controlled using security groups.

*Read* access allows:

* viewing logs, status and directories.

*Write* access allows:

* start, stop, restart of containers
* edit files in containers
* delete files in containers
* git and compose actions
* execute commands on a container

## Usage

### Projects

A project is the folder container a docker-compose file.  Open a project to see the related containers.  Only
projects that have been brought up by docker-compose can be viewed.  Compose Explorer cannot manage any
docker-compose containers that have not already been started.

#### Logs

Logs for a container / service can be viewed in a separate window.

#### Directory

Files and directories in a container can be browsed, deleted, downloaded and edited. 

##### Edit a file

Click on the pencil icon next to a file to open a file editing window.  You can change and save any file
back to the container.  Note: only edit text files.

##### Delete a file
.
Select files and then click the trash can icon to delete.

##### Download a file

Select files and then click the down arrow button to download the selected files.

#### Git

Certain Git commands are available when using the 'git' tab of a project.

| command | description |
| ------ | ----- |
| status | show the status of the branch |
| Pull | pull from origin |
| Fetch | fetch from origin |
| Log | show last bits of the git log |
| Branch | display the current branch |
| Clear | Clear the display |


#### Compose

Certain docker-compose commands are available when using the 'compose' tab of a project.

| command | description |
| ------ | ----- |
| up | bring up services |
| ps | show status of services |
| up-build | build and then bring up services |
| build | build services |
| stop | stop all services |
| logs | view last part of logs |
| restart | restart all services |
| clear | clear the display |


### Audit