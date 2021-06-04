import os
import random
import string
from datetime import datetime

import humanize as humanize
import requests
from dateutil import tz
from flask_login import UserMixin, current_user
from flask_serialize import FlaskSerializeMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app import db

# Auto-detect zones:
from_zone = tz.tzutc()
to_zone = tz.tzlocal()

FlaskSerializeMixin.db = db


# User class
class User(db.Model, UserMixin, FlaskSerializeMixin):
    __tablename__ = 'app_user'
    # Our User has six fields: ID, email, password, active, confirmed_at and roles. The roles field represents a
    # many-to-many relationship using the roles_users table. Each user may have no role, one role, or multiple roles.
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    user_type = db.Column(db.String(255), default='user')
    active = db.Column(db.Boolean(), default=True)
    commands = db.relationship('Command', backref='user', lazy='dynamic', foreign_keys='Command.user_id')

    @classmethod
    def name_is_unused(cls, name):
        user = cls.query.filter_by(name=name.lower()).first()
        return user is None

    @property
    def is_admin(self):
        return self.user_type == 'admin'

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """
        return true if password is same as user
        :param password:
        :return:
        """

        return self.password and check_password_hash(self.password, password)

    def add_command(self, cmd, result):
        command = Command(cmd=cmd, result=result, user=self)
        db.session.add(command)
        db.session.commit()
        return command

    def __repr__(self):
        return f'{self.email}'


class Command(db.Model, FlaskSerializeMixin):
    id = db.Column(db.Integer, primary_key=True)
    cmd = db.Column(db.String(4000))
    result = db.Column(db.String(4000))
    container_name = db.Column(db.String(4000))
    created = db.Column(db.DateTime, default=datetime.utcnow)
    updated = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('app_user.id'))

    # fs fields

    create_fields = ['cmd', 'result', 'container_name']
    order_by_field_desc = 'created'

    def verify(self, create=False):
        if create:
            self.user = current_user

    @property
    def naturaldelta(self):
        return humanize.naturaldelta(datetime.utcnow() - self.created)


# DockerServer class
class DockerServer(db.Model, FlaskSerializeMixin):
    __tablename__ = 'docker_server'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    credentials = db.Column(db.String(255))
    port = db.Column(db.String(255), default=5550)
    active = db.Column(db.Boolean(), default=True)
    protocol = 'http'

    # fs fields

    create_fields = ['name', 'credentials', 'port']
    update_fields = create_fields + ['active']

    @classmethod
    def name_is_unused(cls, name):
        """
        check if server name is unused

        """
        with db.session.no_autoflush:
            found = cls.query.filter_by(name=name.lower()).first()
            return found is None

    def get(self, d_type, verb, params=None):
        """
        return some information from the proxy

        :param d_type: container, volume
        :param verb: log, list, get, etc
        :param params: specific parameter for the verb
        :return:
        """
        # call the remote agent
        headers = {"Authorization": f"Bearer {self.credentials}"}
        r = requests.get(f'{self.protocol}://{self.name}:{self.port}/{d_type}/{verb}',
                         params=params, headers=headers)
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
        headers = {"authorization": f"Bearer {self.credentials}"}
        r = requests.post(f'{self.protocol}://{self.name}:{self.port}/{d_type}/{verb}/',
                          data=params, headers=headers)
        if r.ok:
            try:
                return r.json()
            except:
                return r.text

        raise Exception(r.text)

    def get_summary(self):
        # call the remote agent
        r = self.get('container', 'list')
        summary = dict(containers=0, volumes=0, error='', date='')
        for c in r:
            summary['containers'] += 1
        # call the remote agent
        r = self.get('container', 'date')
        summary['date'] = r.get('date')
        return summary

    def verify(self, create=False):
        if not all([self.name, self.port]):
            raise Exception('Missing values')

        if create:
            if not self.name_is_unused(self.name):
                raise Exception('Server name already in use')

        try:
            self.port = str(int(self.port))
        except Exception as e:
            raise Exception('Port is not numeric')

    @classmethod
    def test_connection(cls, name, port, credentials=None, protocol='http'):
        headers = {"authorization": f"Bearer {credentials}"}
        try:
            r = requests.get(f'{protocol}://{name}:{port}/container/list', headers=headers, timeout=1.50)
            if not r.ok:
                return r.text, 400
        except Exception as e:
            return f'{e}', 400
        return {'message': 'connected'}


class Setting(db.Model, FlaskSerializeMixin):
    id = db.Column(db.Integer, primary_key=True)

    setting_type = db.Column(db.String(120), index=True, default='misc')
    key = db.Column(db.String(120), index=True)
    value = db.Column(db.String(2000), default='')
    active = db.Column(db.String(1), default='Y')
    created = db.Column(db.DateTime)
    updated = db.Column(db.DateTime)

    fields = ['setting_type', 'value', 'key', 'active']

    def __repr__(self):
        return '<Setting %r %r %r>' % (self.id, self.setting_type, self.value)

    def verify(self, create=False):
        if not self.key or len(self.key) < 1:
            raise Exception('Missing key')

        if not self.setting_type or len(self.setting_type) < 1:
            raise Exception('Missing setting type')

        if not self.active:
            self.active = 'N'

        if self.active not in ['Y', 'N']:
            raise Exception('Invalid value for active')

        existing = Setting.query.filter_by(setting_type=self.setting_type, key=self.key)
        if not self.id:
            if existing.count() >= 1:
                raise Exception('key and setting type must be unique')
        elif not existing[0].id == self.id:
            raise Exception('key and setting type must be unique')


# Create a user to test with
def create_admin_user(app, admin_password: str = None):
    """
    Create or fix the ADMIN_USER

    :param app:
    :param admin_password:
    :return:
    """
    admin_email = os.environ.get('ADMIN_USER', 'admin@admin.com')
    new_admin_password = ''.join([random.choice(string.ascii_uppercase + string.digits) for r in range(20)])
    new_admin_password = os.environ.get('ADMIN_PASSWORD', new_admin_password)
    user = User.query.filter_by(email=admin_email).first()

    if not user:
        user = User(email=admin_email, user_type='admin')
        app.logger.warn('Creating default admin {} with password {}'.format(admin_email, admin_password))
        user.set_password(new_admin_password)
        db.session.add(user)
        db.session.commit()
        return True
    else:
        if not user.check_password(admin_password):
            app.logger.warn('Setting admin {} to password {}'.format(admin_email, new_admin_password))
            user.set_password(new_admin_password)
            db.session.add(user)
            db.session.commit()
            return True

    return False
