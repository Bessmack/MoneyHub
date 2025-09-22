# Backend/__init__.py

from flask import Flask
from Backend.extensions import db, migrate, cors  # use absolute imports

def create_app():
    app = Flask(__name__)
    app.config.from_object("Backend.config.Config")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Import blueprints here to avoid circular imports
    from Backend.routes.goals import goals_bp
    from Backend.routes.transactions import transactions_bp
    from Backend.routes.summary import summary_bp

    # Register blueprints
    app.register_blueprint(goals_bp, url_prefix="/goals")
    app.register_blueprint(transactions_bp, url_prefix="/transactions")
    app.register_blueprint(summary_bp, url_prefix="/summary")

    @app.route("/")
    def home():
        return "MoneyHub Backend running!"

    return app
