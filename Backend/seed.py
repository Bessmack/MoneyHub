# seed.py
from Backend.extensions import db
from Backend.models import User, Goal, Transaction
from flask import Flask
from manage import create_app  # adjust if your app factory is named differently

app = create_app()

with app.app_context():
    # Drop and recreate all tables (⚠️ WARNING: this clears data!)
    db.drop_all()
    db.create_all()

    # ---- Seed User ----
    user = User(username="testuser", email="test@example.com")
    user.set_password("password123")
    db.session.add(user)
    db.session.commit()

    # ---- Seed Goal ----
    goal = Goal(
        title="Buy a Laptop",
        target_amount=1000.0,
        current_amount=200.0,
        deadline=None,
    )
    db.session.add(goal)
    db.session.commit()

    # ---- Seed Transaction ----
    txn = Transaction(
        description="Initial deposit",
        amount=200.0,
        category="Savings",
        type="deposit",
        goal_id=goal.id,
        user_id=user.id,
    )
    db.session.add(txn)

    # Update goal balance
    goal.current_amount += txn.amount

    db.session.commit()

    print("✅ Seed data inserted!")
    print(f"User ID: {user.id}, Goal ID: {goal.id}, Transaction ID: {txn.id}")
