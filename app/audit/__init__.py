from flask import Blueprint

bp = Blueprint("audit", __name__)

from app.audit import routes
