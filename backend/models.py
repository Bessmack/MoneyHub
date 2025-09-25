from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Transaction(db.Model):
    __tablename__ = "transactions"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "date": self.date, "amount": self.amount}

class Goal(db.Model):
    __tablename__ = "goals"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    target = db.Column(db.Float, nullable=False)
    progress = db.Column(db.Float, default=0)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "target": self.target, "progress": self.progress}
