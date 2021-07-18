"""
Script to wait for the database to be ready.  Often when db starts at the same time as the
main app you have to wait for it to become ready.
"""
import os
import sys
import time
from sqlalchemy_utils import database_exists
import config
import logging

logging.basicConfig(format="%(levelname)s:%(message)s", level=os.getenv("LOG_LEVEL", "DEBUG"))

retries = int(os.getenv("DB_READY_RETRIES", 20))
sleep_seconds = int(os.getenv("DB_READY_SLEEP_SECONDS", 6))
count = 0

while True:
    count += 1
    try:
        logging.info(f"Connecting to: {config.SQLALCHEMY_DATABASE_URI}")
        time.sleep(sleep_seconds)
        database_exists(config.SQLALCHEMY_DATABASE_URI)
        logging.info(f"Database ready after {sleep_seconds*count} seconds")
        break
    except Exception as e:
        logging.exception(e)
        if count >= retries:
            logging.info(f"db_ready retries {retries} exceeded.  Database not ready")
            sys.exit(1)
