# WSGI start script

from app import create_app
from app.models import User, AuditRecord, ServerGroup, Command, DockerServer, Setting

app = create_app()
