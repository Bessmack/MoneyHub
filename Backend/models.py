# Backend/models.py
from datetime import datetime
from Backend.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    #  related transactions
    transactions = db.relationship("Transaction", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}


class Goal(db.Model):
    __tablename__ = "goals"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.Date)
    transactions = db.relationship("Transaction", backref="goal", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "target_amount": self.target_amount,
            "current_amount": self.current_amount,
            "deadline": self.deadline.isoformat() if self.deadline else None,
        }

class Transaction(db.Model):
    __tablename__ = "transactions"
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100))
    type = db.Column(db.String(50), nullable=False)  # "deposit" or "withdrawal"
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    goal_id = db.Column(db.Integer, db.ForeignKey("goals.id"), nullable=True)

    # ✅ user_id should not be nullable
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "amount": self.amount,
            "category": self.category,
            "type": self.type,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "goal_id": self.goal_id,
            "user_id": self.user_id,
        }
