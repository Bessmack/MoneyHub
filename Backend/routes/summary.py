from flask import Blueprint, jsonify
from Backend.models import Transaction
from Backend.extensions import db
from sqlalchemy import func

summary_bp = Blueprint("summary", __name__)

# -------------------------
# Overall summary
# -------------------------
@summary_bp.route("/", methods=["GET"])
def get_summary():
    total_deposits = db.session.query(func.sum(Transaction.amount))\
        .filter(Transaction.type == "deposit").scalar() or 0
    total_withdrawals = db.session.query(func.sum(Transaction.amount))\
        .filter(Transaction.type == "withdrawal").scalar() or 0
    balance = total_deposits - total_withdrawals

    return jsonify({
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "balance": balance
    }), 200


# -------------------------
# Withdrawals by category (optional)
# -------------------------
@summary_bp.route("/categories", methods=["GET"])
def get_category_summary():
    results = (
        db.session.query(Transaction.category, func.sum(Transaction.amount))
        .filter(Transaction.type == "withdrawal")
        .group_by(Transaction.category)
        .all()
    )
    category_summary = {category: amount for category, amount in results}
    return jsonify(category_summary), 200
