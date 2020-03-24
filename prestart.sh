#!/usr/bin/env bash
# upgrade script only for sql lite and sqlaclchemy-migrate
# see: https://sqlalchemy-migrate.readthedocs.io/en/latest/versioning.html#upgrade-the-database
if [ -z "${DATABASE_URI}" ]; then
    echo DATABASE_URI not set.
    exit 1
fi
flask db upgrade
