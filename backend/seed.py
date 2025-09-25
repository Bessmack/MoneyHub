# seed.py - run this to populate the DB with sample data
from app import app
from models import db, Transaction, Goal

with app.app_context():
    db.drop_all()
    db.create_all()

    sample_tx = [
        Transaction(title="Salary", date="2025-09-01", amount=5000.0),
        Transaction(title="Groceries", date="2025-09-05", amount=-300.0),
        Transaction(title="Electricity", date="2025-09-10", amount=-50.0),
        Transaction(title="Coffee", date="2025-09-12", amount=-4.5),
    ]

    sample_goals = [
        Goal(name="Emergency Fund", target=5000.0, progress=1200.0),
        Goal(name="New Laptop", target=1500.0, progress=400.0),
    ]

    db.session.add_all(sample_tx + sample_goals)
    db.session.commit()
    print("Seeded database with sample data.")
