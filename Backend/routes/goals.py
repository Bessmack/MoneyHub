from flask import Blueprint, request, jsonify
from Backend.models import Goal
from Backend.extensions import db
from datetime import datetime

goals_bp = Blueprint("goals", __name__)

# -------------------------
# GET all goals
# -------------------------
@goals_bp.route("/", methods=["GET"])
def get_goals():
    goals = Goal.query.all()
    return jsonify([g.to_dict() for g in goals]), 200


# -------------------------
# GET single goal by ID
# -------------------------
@goals_bp.route("/<int:goal_id>", methods=["GET"])
def get_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    return jsonify(goal.to_dict()), 200


# -------------------------
# POST create a new goal
# -------------------------
@goals_bp.route("/", methods=["POST"])
def create_goal():
    data = request.get_json()

    try:
        deadline = (
            datetime.strptime(data["deadline"], "%Y-%m-%d").date()
            if "deadline" in data and data["deadline"]
            else None
        )

        goal = Goal(
            title=data["title"],
            target_amount=data["target_amount"],
            current_amount=data.get("current_amount", 0.0),
            deadline=deadline
        )

        db.session.add(goal)
        db.session.commit()

        return jsonify({"message": "Goal created", "id": goal.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -------------------------
# PUT update an existing goal
# -------------------------
@goals_bp.route("/<int:goal_id>", methods=["PUT", "PATCH"])
def update_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    data = request.get_json()

    try:
        if "title" in data:
            goal.title = data["title"]
        if "target_amount" in data:
            goal.target_amount = data["target_amount"]
        if "current_amount" in data:
            goal.current_amount = data["current_amount"]
        if "deadline" in data and data["deadline"]:
            goal.deadline = datetime.strptime(data["deadline"], "%Y-%m-%d").date()

        db.session.commit()
        return jsonify({"message": "Goal updated", "id": goal.id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# -------------------------
# DELETE a goal
# -------------------------
@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)

    try:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"message": "Goal deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
