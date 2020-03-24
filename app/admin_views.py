from flask_admin.contrib import sqla
from flask_login import current_user
from wtforms.fields import PasswordField


def is_current_admin():
    return current_user and current_user.is_authenticated and current_user.user_type == 'admin'


class SettingAdmin(sqla.ModelView):

    # Prevent administration of Users unless the currently logged-in user has the "admin" role
    def is_accessible(self):
        return is_current_admin()


class DockerServerAdmin(sqla.ModelView):

    # Prevent administration of Users unless the currently logged-in user has the "admin" role
    def is_accessible(self):
        return is_current_admin()


# Customized User model for SQL-Admin
class UserAdmin(sqla.ModelView):
    # Don't display the password on the list of Users
    column_exclude_list = list = ('password',)

    # Don't include the standard password field when creating or editing a User (but see below)
    form_excluded_columns = ('password',)

    # Automatically display human-readable names for the current and available Roles when creating or editing a User
    column_auto_select_related = True

    # Prevent administration of Users unless the currently logged-in user has the "admin" role
    def is_accessible(self):
        return is_current_admin()

    # On the form for creating or editing a User, don't display a field corresponding to the model's password field.
    # There are two reasons for this. First, we want to encrypt the password before storing in the database. Second,
    # we want to use a password field (with the input masked) rather than a regular text field.
    def scaffold_form(self):
        # Start with the standard form as provided by Flask-Admin. We've already told Flask-Admin to exclude the
        # password field from this form.
        form_class = super(UserAdmin, self).scaffold_form()

        # Add a password field, naming it "password2" and labeling it "New Password".
        form_class.password2 = PasswordField('New Password')
        return form_class

    # This callback executes when the user saves changes to a newly-created or edited User -- before the changes are
    # committed to the database.
    def on_model_change(self, form, model, is_created):
        # If the password field isn't blank...
        if len(model.password2):
            # ... then encrypt the new password prior to storing it in the database. If the password field is blank,
            # the existing password in the database will be retained.
            model.set_password(model.password2)

