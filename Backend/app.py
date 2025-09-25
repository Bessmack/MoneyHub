from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Transaction, Goal
from auth import token_required
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

CORS(app)
db.init_app(app)

# Create tables and admin user
@app.before_request
def create_tables():
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', email='admin@moneyhub.com')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

# AUTHENTICATION ROUTES
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists!'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists!'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = user.generate_token()
        
        return jsonify({
            'message': 'User created successfully!',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid credentials!'}), 401
        
        # Generate token
        token = user.generate_token()
        
        return jsonify({
            'message': 'Login successful!',
            'token': token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()})

# PROTECTED API ROUTES (All routes now require authentication)
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.date.desc()).all()
    return jsonify([t.to_dict() for t in transactions])

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction(current_user):
    try:
        data = request.get_json()
        transaction = Transaction(
            title=data['title'],
            amount=float(data['amount']),
            category=data.get('category', 'Other'),
            date=datetime.fromisoformat(data.get('date', datetime.utcnow().isoformat())),
            user_id=current_user.id
        )
        db.session.add(transaction)
        db.session.commit()
        return jsonify(transaction.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(current_user, transaction_id):
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=current_user.id).first_or_404()
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted successfully'})

@app.route('/api/goals', methods=['GET'])
@token_required
def get_goals(current_user):
    goals = Goal.query.filter_by(user_id=current_user.id).all()
    return jsonify([g.to_dict() for g in goals])

@app.route('/api/goals', methods=['POST'])
@token_required
def add_goal(current_user):
    data = request.get_json()
    goal = Goal(
        name=data['name'],
        target=float(data['target']),
        saved=float(data.get('saved', 0)),
        user_id=current_user.id
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify(goal.to_dict()), 201

@app.route('/api/goals/<int:goal_id>', methods=['PUT'])
@token_required
def update_goal(current_user, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if 'saved' in data:
        goal.saved = float(data['saved'])
    if 'target' in data:
        goal.target = float(data['target'])
    if 'name' in data:
        goal.name = data['name']
    
    db.session.commit()
    return jsonify(goal.to_dict())

@app.route('/api/goals/<int:goal_id>', methods=['DELETE'])
@token_required
def delete_goal(current_user, goal_id):
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user.id).first_or_404()
    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted successfully'})

# ENHANCED DASHBOARD WITH CHARTS DATA
@app.route('/api/dashboard')
@token_required
def get_dashboard_data(current_user):
    transactions = Transaction.query.filter_by(user_id=current_user.id).all()
    
    # Basic calculations
    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = abs(sum(t.amount for t in transactions if t.amount < 0))
    cash_flow = total_income - total_expenses
    
    # Monthly data for line chart
    monthly_data = {}
    for t in transactions:
        month_key = t.date.strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {'income': 0, 'expenses': 0, 'balance': 0}
        
        if t.amount > 0:
            monthly_data[month_key]['income'] += t.amount
        else:
            monthly_data[month_key]['expenses'] += abs(t.amount)
        monthly_data[month_key]['balance'] += t.amount
    
    # Sort months chronologically
    sorted_months = sorted(monthly_data.keys())
    
    # Category data for doughnut chart
    category_data = {}
    for t in transactions:
        if t.amount < 0:  # Only expenses for category breakdown
            category = t.category
            if category not in category_data:
                category_data[category] = 0
            category_data[category] += abs(t.amount)
    
    # Weekly data for bar chart (last 8 weeks)
    weekly_data = {}
    today = datetime.utcnow()
    
    # Create empty weekly slots for last 8 weeks
    for i in range(8):
        week_start = today - timedelta(weeks=(7-i))
        week_key = week_start.strftime('%Y-W%U')  # Format: 2024-W35
        weekly_data[week_key] = {'income': 0, 'expenses': 0}
    
    # Fill weekly data with transactions from last 8 weeks
    eight_weeks_ago = today - timedelta(weeks=8)
    recent_transactions = [t for t in transactions if t.date >= eight_weeks_ago]
    
    for t in recent_transactions:
        week_key = t.date.strftime('%Y-W%U')
        if week_key in weekly_data:
            if t.amount > 0:
                weekly_data[week_key]['income'] += t.amount
            else:
                weekly_data[week_key]['expenses'] += abs(t.amount)
    
    # Sort weekly keys chronologically
    sorted_weeks = sorted(weekly_data.keys())
    
    return jsonify({
        "summary": {
            "cashFlow": cash_flow,
            "expenses": total_expenses,
            "totalBalance": total_income - total_expenses,
            "budget": 75
        },
        "monthlyData": {
            "labels": sorted_months,
            "income": [monthly_data[month]['income'] for month in sorted_months],
            "expenses": [monthly_data[month]['expenses'] for month in sorted_months],
            "balance": [monthly_data[month]['balance'] for month in sorted_months]
        },
        "categoryData": category_data,
        "weeklyData": {
            "labels": sorted_weeks,
            "income": [weekly_data[week]['income'] for week in sorted_weeks],
            "expenses": [weekly_data[week]['expenses'] for week in sorted_weeks]
        },
        "recentTransactions": [t.to_dict() for t in transactions[-5:]]  # Last 5 transactions
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
