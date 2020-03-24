from flask import Blueprint

bp = Blueprint('proxy', __name__)

from app.proxy import routes
