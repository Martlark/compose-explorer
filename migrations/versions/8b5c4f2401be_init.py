"""init

Revision ID: 8b5c4f2401be
Revises: 
Create Date: 2021-06-26 08:52:29.705567

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8b5c4f2401be'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('app_user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('options', sa.String(length=2000), nullable=True),
    sa.Column('first_name', sa.String(length=255), nullable=True),
    sa.Column('last_name', sa.String(length=255), nullable=True),
    sa.Column('password', sa.String(length=255), nullable=True),
    sa.Column('user_type', sa.String(length=255), nullable=True),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('audit_record',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('action', sa.String(length=4000), nullable=True),
    sa.Column('email', sa.String(length=300), nullable=True),
    sa.Column('server_name', sa.String(length=300), nullable=True),
    sa.Column('container_name', sa.String(length=300), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('docker_server',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('credentials', sa.String(length=255), nullable=True),
    sa.Column('port', sa.String(length=255), nullable=True),
    sa.Column('active', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('server_group',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('options', sa.String(length=2000), nullable=True),
    sa.Column('access_type', sa.String(length=5), nullable=True),
    sa.Column('description', sa.String(length=255), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    op.create_table('setting',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('setting_type', sa.String(length=120), nullable=True),
    sa.Column('key', sa.String(length=120), nullable=True),
    sa.Column('value', sa.String(length=2000), nullable=True),
    sa.Column('active', sa.String(length=1), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('updated', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_setting_key'), 'setting', ['key'], unique=False)
    op.create_index(op.f('ix_setting_setting_type'), 'setting', ['setting_type'], unique=False)
    op.create_table('command',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('cmd', sa.String(length=4000), nullable=True),
    sa.Column('result', sa.String(length=4000), nullable=True),
    sa.Column('container_name', sa.String(length=4000), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('updated', sa.DateTime(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('server_group_server',
    sa.Column('server_group_id', sa.Integer(), nullable=True),
    sa.Column('server_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['server_group_id'], ['server_group.id'], ),
    sa.ForeignKeyConstraint(['server_id'], ['docker_server.id'], )
    )
    op.create_table('server_group_user',
    sa.Column('server_group_id', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['server_group_id'], ['server_group.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], )
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('server_group_user')
    op.drop_table('server_group_server')
    op.drop_table('command')
    op.drop_index(op.f('ix_setting_setting_type'), table_name='setting')
    op.drop_index(op.f('ix_setting_key'), table_name='setting')
    op.drop_table('setting')
    op.drop_table('server_group')
    op.drop_table('docker_server')
    op.drop_table('audit_record')
    op.drop_table('app_user')
    # ### end Alembic commands ###