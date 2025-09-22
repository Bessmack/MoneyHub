from flask import Blueprint, request, jsonify
from Backend.models import Transaction, Goal
from Backend.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

transactions_bp = Blueprint("transactions", __name__)

# -------------------------
# GET all transactions (for current user)
# -------------------------
@transactions_bp.route("/", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    result = [t.to_dict() for t in transactions]
    return jsonify(result), 200


# -------------------------
# GET transactions for a specific goal
# -------------------------
@transactions_bp.route("/goal/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_transactions_for_goal(goal_id):
    user_id = get_jwt_identity()
    transactions = Transaction.query.filter_by(goal_id=goal_id, user_id=user_id).all()
    result = [t.to_dict() for t in transactions]
    return jsonify(result), 200


# -------------------------
# POST create a transaction
# -------------------------
@transactions_bp.route("/", methods=["POST"])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    # ✅ validate
    if "amount" not in data or "type" not in data:
        return jsonify({"error": "amount and type are required"}), 400

    if data["type"] not in ("deposit", "withdrawal"):
        return jsonify({"error": "type must be 'deposit' or 'withdrawal'"}), 400

    goal_id = data.get("goal_id")
    goal = None
    if goal_id:
        goal = Goal.query.get_or_404(goal_id)
        if goal.current_amount is None:
            goal.current_amount = 0.0

    transaction = Transaction(
        user_id=user_id,
        goal_id=goal_id,
        amount=float(data["amount"]),
        type=data["type"],
        category=data.get("category"),
        description=data.get("description"),
    )

    # ✅ adjust goal balance if linked
    if goal:
        if transaction.type == "deposit":
            goal.current_amount += transaction.amount
        else:
            goal.current_amount -= transaction.amount

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Transaction created", "id": transaction.id}), 201
