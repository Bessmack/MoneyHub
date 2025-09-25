from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def generate_token(self):
        payload = {
            'user_id': self.id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        
        # ALTERNATIVE: Try different JWT encoding approaches
        try:
            # Method 1: Standard approach
            token = jwt.encode(payload, os.getenv('JWT_SECRET', 'fallback-secret'), algorithm='HS256')
            # If token is bytes, decode to string
            if isinstance(token, bytes):
                return token.decode('utf-8')
            return token
        except AttributeError:
            # Method 2: Alternative if encode doesn't exist
            import json
            import base64
            import hmac
            import hashlib
            
            header = {"alg": "HS256", "typ": "JWT"}
            secret = os.getenv('JWT_SECRET', 'fallback-secret')
            
            # Encode header and payload
            header_encoded = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
            payload_encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
            
            # Create signature
            message = f"{header_encoded}.{payload_encoded}"
            signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
            signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')
            
            return f"{header_encoded}.{payload_encoded}.{signature_encoded}"
    
    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(
                token, 
                os.getenv('JWT_SECRET', 'fallback-secret'), 
                algorithms=['HS256']
            )
            return User.query.get(payload['user_id'])
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    category = db.Column(db.String(50), nullable=False, default='Other')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'category': self.category,
            'user_id': self.user_id
        }

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    saved = db.Column(db.Float, default=0)
    target = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'saved': self.saved,
            'target': self.target,
            'progress': (self.saved / self.target) * 100 if self.target > 0 else 0,
            'user_id': self.user_id
        }