import os
import random
import string

import requests
from dateutil import tz
from flask_login import UserMixin
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

    @classmethod
    def name_is_unused(cls, name):
        user = cls.query.filter_by(name=name.lower()).first()
        return user is None

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """
        return true if password is same as user
        :param password:
        :return:
        """

        return self.password and check_password_hash(self.password, password)


# DockerServer class
class DockerServer(db.Model, FlaskSerializeMixin):
    __tablename__ = 'docker_server'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True)
    credentials = db.Column(db.String(255))
    port = db.Column(db.String(255), default=5550)
    active = db.Column(db.Boolean(), default=True)
    protocol = 'http'

    @classmethod
    def name_is_unused(cls, name):
        found = cls.query.filter_by(name=name.lower()).first()
        return found is None

    def get(self, d_type, verb):
        r = requests.get(f'{self.protocol}://{self.name}:{self.port}/d_type/{verb}', auth=('explorer', self.credentials))
        return r.json()


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

    def verify(self):
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
def create_admin_user(app):
    """
    Create or fix the ADMIN_USER

    :param app:
    :return:
    """
    admin_email = os.environ.get('ADMIN_USER', 'admin@admin.com')
    admin_password = ''.join([random.choice(string.ascii_uppercase + string.digits) for r in range(20)])
    admin_password = os.environ.get('ADMIN_PASSWORD', admin_password)
    user = User.query.filter_by(email=admin_email).first()

    if not user:
        user = User(email=admin_email, user_type='admin')
        app.logger.warn('Creating default admin {} with password {}'.format(admin_email, admin_password))
        user.set_password(admin_password)
        db.session.add(user)
        db.session.commit()
        return True
    else:
        if not user.check_password(admin_password):
            app.logger.warn('Setting admin {} to password {}'.format(admin_email, admin_password))
            user.set_password(admin_password)
            db.session.add(user)
            db.session.commit()
            return True

    return False
