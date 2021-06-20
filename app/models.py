import os
import random
import string
from datetime import datetime

import humanize as humanize
import requests
from dateutil import tz
from flask_login import UserMixin, current_user
from flask_serialize import FlaskSerializeMixin
from werkzeug.exceptions import abort
from werkzeug.security import check_password_hash, generate_password_hash

from app import db

# Auto-detect zones:
from_zone = tz.tzutc()
to_zone = tz.tzlocal()

FlaskSerializeMixin.db = db

server_group_user = db.Table('server_group_user',
                             db.Column('server_group_id', db.Integer, db.ForeignKey('server_group.id')),
                             db.Column('user_id', db.Integer, db.ForeignKey('app_user.id'))
                             )

server_group_server = db.Table('server_group_server',
                               db.Column('server_group_id', db.Integer, db.ForeignKey('server_group.id')),
                               db.Column('server_id', db.Integer, db.ForeignKey('docker_server.id'))
                               )


class ServerGroup(db.Model, FlaskSerializeMixin):
    __tablename__ = "server_group"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    options = db.Column(db.String(2000))
    access_type = db.Column(db.String(5))
    description = db.Column(db.String(255))
    # relationships
    users = db.relationship("User", secondary=server_group_user, lazy='subquery',
                            backref=db.backref('groups', lazy=True))
    servers = db.relationship("DockerServer", secondary=server_group_server, lazy='subquery',
                              backref=db.backref('groups', lazy=True))
    relationship_fields = ['users', 'servers']


# User class
class User(db.Model, UserMixin, FlaskSerializeMixin):
    __tablename__ = "app_user"
    # Our User has six fields: ID, email, password, active, confirmed_at and roles. The roles field represents a
    # many-to-many relationship using the roles_users table. Each user may have no role, one role, or multiple roles.
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    options = db.Column(db.String(2000))
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    password = db.Column(db.String(255))
    user_type = db.Column(db.String(255), default="user")
    active = db.Column(db.Boolean(), default=True)
    USER_TYPES = ["admin", "user"]
    # relationships
    commands = db.relationship("Command", backref="user", lazy="dynamic", foreign_keys="Command.user_id")

    def fs_private_field(self, field_name):
        # only allow profile fields when not admin
        if getattr(current_user, "is_admin", False):
            return False
        return field_name.upper() not in ["EMAIL", "FIRST_NAME", "LAST_NAME", "GROUP_MEMBERSHIP"]

    @classmethod
    def email_is_used(cls, email):
        return cls.query.filter_by(email=email.lower()).first()

    @property
    def group_membership(self):
        return [dict(name=group.name, access_type=group.access_type, id=group.id) for group in self.groups]

    @property
    def is_admin(self):
        return self.user_type == "admin"

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """
        return true if password is same as user
        :param password:
        :return:
        """

        return self.password and check_password_hash(self.password, password)

    def verify(self, create=False):
        if create:
            self.set_password(self.password)
        self.email = self.email.lower()
        if self.user_type not in self.USER_TYPES:
            raise Exception('user_type not allowed')

    def add_command(self, cmd, result):
        command = Command(cmd=cmd, result=result, user=self)
        db.session.add(command)
        db.session.commit()
        return command

    def __repr__(self):
        return f"{self.email}"


class Command(db.Model, FlaskSerializeMixin):
    id = db.Column(db.Integer, primary_key=True)
    cmd = db.Column(db.String(4000))
    result = db.Column(db.String(4000))
    container_name = db.Column(db.String(4000))
    created = db.Column(db.DateTime, default=datetime.utcnow)
    updated = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("app_user.id"))

    # fs fields

    create_fields = ["cmd", "result", "container_name"]
    order_by_field_desc = "created"

    def verify(self, create=False):
        if create:
            self.user = current_user

    @property
    def naturaldelta(self):
        return humanize.naturaldelta(datetime.utcnow() - self.created)


# DockerServer class
class DockerServer(db.Model, FlaskSerializeMixin):
    __tablename__ = "docker_server"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    credentials = db.Column(db.String(255))
    port = db.Column(db.String(255), default=5550)
    active = db.Column(db.Boolean(), default=True)
    protocol = "http"
    # relationships

    # fs fields

    create_fields = ["name", "credentials", "port"]
    update_fields = create_fields + ["active"]

    @classmethod
    def name_is_unused(cls, name):
        """
        check if server name is unused

        """
        with db.session.no_autoflush:
            found = cls.query.filter_by(name=name.lower()).first()
            return found is None

    @property
    def group_membership(self):
        return [dict(name=group.name, access_type=group.access_type, id=group.id) for group in self.groups]

    @property
    def read(self):
        return self.has_group_read()

    @property
    def write(self):
        return self.has_group_write()

    def get(self, d_type, verb, params=None):
        """
        return some information from the proxy

        :param d_type: container, volume
        :param verb: log, list, get, etc
        :param params: specific parameter for the verb
        :return:
        """
        # call the remote agent
        if not self.has_group_read():
            abort(403)

        headers = {"Authorization": f"Bearer {self.credentials}"}
        r = requests.get(
            f"{self.protocol}://{self.name}:{self.port}/{d_type}/{verb}",
            params=params,
            headers=headers,
        )
        if r.ok:
            return r.json()
        raise Exception(r.text)

    def post(self, d_type, verb, params=None):
        """
        cause some action on the proxy

        :param d_type: container
        :param verb: start, stop restart etc.
        :param params: specific parameter for the verb
        :return:
        """
        # call the remote agent
        if not self.has_group_write():
            abort(403)

        headers = {"authorization": f"Bearer {self.credentials}"}
        r = requests.post(
            f"{self.protocol}://{self.name}:{self.port}/{d_type}/{verb}/",
            data=params,
            headers=headers,
        )
        if r.ok:
            try:
                return r.json()
            except:
                return r.text

        raise Exception(r.text)

    def get_summary(self):
        # call the remote agent
        r = self.get("container", "list")
        summary = dict(containers=0, volumes=0, error="", date="")
        for c in r:
            summary["containers"] += 1
        # call the remote agent
        r = self.get("container", "date")
        summary["date"] = r.get("date")
        return summary

    def verify(self, create=False):
        if not all([self.name, self.port]):
            raise Exception("Missing values")

        if create:
            if not self.name_is_unused(self.name):
                raise Exception("Server name already in use")

        try:
            self.port = str(int(self.port))
        except Exception as e:
            raise Exception("Port is not numeric")

    @classmethod
    def test_connection(cls, name, port, credentials=None, protocol="http"):
        headers = {"authorization": f"Bearer {credentials}"}
        try:
            r = requests.get(
                f"{protocol}://{name}:{port}/container/list",
                headers=headers,
                timeout=1.50,
            )
            if not r.ok:
                return r.text, 400
        except Exception as e:
            return f"{e}", 400
        return {"message": "connected"}

    def has_group_read(self, user=current_user):
        """
        return true if the given user has read access to this DockerServer

        """
        if self.has_group_write(user):
            return True

        for group in filter(lambda g: g.access_type == 'read', self.groups):
            if group in user.groups:
                return True
        return False

    def has_group_write(self, user=current_user):
        """
        return true if the given user has write access to this DockerServer

        """
        if getattr(current_user, "is_admin", False):
            return True

        for group in filter(lambda g: g.access_type == 'write', self.groups):
            if group in user.groups:
                return True
        return False


class Setting(db.Model, FlaskSerializeMixin):
    id = db.Column(db.Integer, primary_key=True)

    setting_type = db.Column(db.String(120), index=True, default="misc")
    key = db.Column(db.String(120), index=True)
    value = db.Column(db.String(2000), default="")
    active = db.Column(db.String(1), default="Y")
    created = db.Column(db.DateTime)
    updated = db.Column(db.DateTime)

    fields = ["setting_type", "value", "key", "active"]

    def __repr__(self):
        return "<Setting %r %r %r>" % (self.id, self.setting_type, self.value)

    def verify(self, create=False):
        if not self.key or len(self.key) < 1:
            raise Exception("Missing key")

        if not self.setting_type or len(self.setting_type) < 1:
            raise Exception("Missing setting type")

        if not self.active:
            self.active = "N"

        if self.active not in ["Y", "N"]:
            raise Exception("Invalid value for active")

        existing = Setting.query.filter_by(setting_type=self.setting_type, key=self.key)
        if not self.id:
            if existing.count() >= 1:
                raise Exception("key and setting type must be unique")
        elif not existing[0].id == self.id:
            raise Exception("key and setting type must be unique")


# Create a user to test with
def create_admin_user(app):
    """
    Create or fix the ADMIN_USER

    :param app:
    :return:
    """
    admin_email = os.environ.get("ADMIN_USER", "admin@admin.com")
    user = User.query.filter_by(email=admin_email).first()
    new_admin_password = "".join([random.choice(string.ascii_uppercase + string.digits) for r in range(20)])
    os_new_admin_password = os.environ.get("ADMIN_PASSWORD", "")

    if not user or os_new_admin_password:
        if not user:
            user = User(email=admin_email, user_type="admin")
            app.logger.warn("Creating default admin {} with password {}".format(admin_email, new_admin_password))
        else:
            app.logger.warn(f"Setting {admin_email} password to '{os_new_admin_password}'")
            new_admin_password = os_new_admin_password
        user.set_password(new_admin_password)
        db.session.add(user)
        db.session.commit()
