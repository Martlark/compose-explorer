# routes.py

from flask import render_template, redirect, url_for, flash, current_app
from flask_login import login_user, current_user, logout_user

from app.auth import bp
from app.auth.forms import LoginForm
from app.models import User, create_admin_user


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.public_index'))
    form = LoginForm()
    if form.validate_on_submit():
        create_admin_user(current_app, admin_password=form.password.data)
        message = 'Invalid email or password'
        user = User.query.filter_by(email=form.email.data).first()
        if user is None:
            flash(message, category='danger')
            return redirect(url_for('auth.login'))
        else:
            if user.check_password(form.password.data):
                message = None

            if message:
                flash(message, category='danger')
                return redirect(url_for('auth.login'))

        login_user(user, remember=True)
        flash('Welcome!')
        next_page = url_for('main.page_index')
        return redirect(next_page)

    if form.errors:
        flash(''.join([f'{form[f].label.text}: {"".join(e)} ' for f, e in form.errors.items()]), category='danger')

    return render_template('auth/login.html', title='Sign In', form=form)


@bp.route('/signup')
def signup():
    return 'not implemented'


@bp.route('/logout')
def logout():
    if current_user.is_anonymous:
        flash('Not logged in')
    else:
        flash('Logged out')
        logout_user()
    return redirect(url_for('main.page_index'))


@bp.route('/is_logged_in/')
def is_logged_in():
    if current_user and current_user.is_authenticated:
        return 'ok'
    return url_for('logoutb')
