import os
import logging
from datetime import datetime

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# configure the database
db_url = os.environ.get("DATABASE_URL")
if db_url:
    # Use PostgreSQL in production
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
else:
    # Use SQLite for development
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///sign_language.db"

app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Make sure to import the models here or their tables won't be created
    import models  # noqa: F401
    
    # Create database tables if they don't exist
    db.create_all()

# Import Flask's render_template
from flask import render_template

# Register error handlers
@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    return render_template('500.html'), 500

# Import views after app is fully configured
from routes import *

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)