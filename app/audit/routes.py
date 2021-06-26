# admin management
# routes.py

from app import admin_required
from app.audit import bp
from app.models import AuditRecord


@bp.route("/<int:item_id>/", methods=["GET", "PUT", "POST", "DELETE"])
@bp.route("/", methods=["GET", "POST"])
@admin_required
def admin_route_audit(item_id=None):
    return AuditRecord.get_delete_put_post(item_id=item_id)
