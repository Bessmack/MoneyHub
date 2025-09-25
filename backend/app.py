from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
from models import db, Transaction, Goal
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    CORS(app)
    return app

app = create_app()

# -------------- Transactions ----------------
@app.route("/transactions", methods=["GET"])
def get_transactions():
    txs = Transaction.query.order_by(Transaction.id.desc()).all()
    return jsonify([t.to_dict() for t in txs]), 200

@app.route("/transactions/<int:tx_id>", methods=["GET"])
def get_transaction(tx_id):
    t = Transaction.query.get_or_404(tx_id)
    return jsonify(t.to_dict()), 200

@app.route("/transactions", methods=["POST"])
def add_transaction():
    data = request.get_json() or {}
    title = data.get("title")
    date = data.get("date")
    amount = data.get("amount")
    if title is None or date is None or amount is None:
        return jsonify({"error": "title, date, amount required"}), 400
    t = Transaction(title=title, date=date, amount=float(amount))
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201

@app.route("/transactions/<int:tx_id>", methods=["DELETE"])
def delete_transaction(tx_id):
    t = Transaction.query.get_or_404(tx_id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200

# ---------------- Goals ----------------
@app.route("/goals", methods=["GET"])
def get_goals():
    goals = Goal.query.order_by(Goal.id.desc()).all()
    return jsonify([g.to_dict() for g in goals]), 200

@app.route("/goals/<int:goal_id>", methods=["GET"])
def get_goal(goal_id):
    g = Goal.query.get_or_404(goal_id)
    return jsonify(g.to_dict()), 200

@app.route("/goals", methods=["POST"])
def add_goal():
    data = request.get_json() or {}
    name = data.get("name")
    target = data.get("target")
    progress = data.get("progress", 0)
    if name is None or target is None:
        return jsonify({"error": "name and target required"}), 400
    g = Goal(name=name, target=float(target), progress=float(progress))
    db.session.add(g)
    db.session.commit()
    return jsonify(g.to_dict()), 201

@app.route("/goals/<int:goal_id>", methods=["PATCH"])
def update_goal(goal_id):
    g = Goal.query.get_or_404(goal_id)
    data = request.get_json() or {}
    if "name" in data: g.name = data["name"]
    if "target" in data: g.target = float(data["target"])
    if "progress" in data: g.progress = float(data["progress"])
    db.session.commit()
    return jsonify(g.to_dict()), 200

@app.route("/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    g = Goal.query.get_or_404(goal_id)
    db.session.delete(g)
    db.session.commit()
    return jsonify({"message": "deleted"}), 200

# -------------- Health ----------------
@app.route("/ping")
def ping():
    return jsonify({"message": "pong"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # debug True for development only
    app.run(debug=True)
# done