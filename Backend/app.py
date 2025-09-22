from flask import Flask
from Backend.config import Config
from Backend.extensions import db, migrate, cors, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app) 
    cors.init_app(app)

    # Register blueprints
    from Backend.routes.goals import goals_bp
    from Backend.routes.transactions import transactions_bp
    from Backend.routes.summary import summary_bp
    from Backend.routes.auth import auth_bp   # ✅ import auth_bp

    app.register_blueprint(goals_bp, url_prefix="/api/goals")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
    app.register_blueprint(summary_bp, url_prefix="/api/summary")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")  # ✅ register auth_bp

    # Home route
    @app.route("/")
    def home():
        return "MoneyHub Backend is running!"

    return app
