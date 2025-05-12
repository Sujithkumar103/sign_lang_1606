from datetime import datetime
from app import db

class SignLanguageEntry(db.Model):
    """Sign language entry model for storing sign language vocabulary"""
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    difficulty = db.Column(db.String(20), default='beginner')  # beginner, intermediate, advanced
    video_path = db.Column(db.String(255), nullable=True)      # Path to the sign language video if available
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        """Return string representation of the model"""
        return f"<SignLanguageEntry {self.word}>"

class SessionActivity(db.Model):
    """Session activity model for tracking user interactions"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False)  # Random session identifier
    word_searched = db.Column(db.String(100), nullable=True)
    text_to_speech_used = db.Column(db.Boolean, default=False)
    speech_to_text_used = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        """Return string representation of the model"""
        return f"<SessionActivity {self.id}>"