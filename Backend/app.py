from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Transaction, Goal
from auth import token_required
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

CORS(app)
db.init_app(app)

 Create tables and admin user
@app.before_request
def create_tables():
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@moneyhub.com')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()