import os
import logging
from app import app, db
from models import SignLanguageEntry

def seed_database():
    """Seed the database with initial sign language vocabulary"""
    try:
        # Check if we already have entries
        existing_count = SignLanguageEntry.query.count()
        if existing_count > 0:
            print(f"Database already has {existing_count} entries. Skipping seed operation.")
            return

        print("Seeding database with initial sign language vocabulary...")
        
        # Create a list of sign language entries
        entries = [
            # Alphabet
            {"word": "A", "category": "Alphabet", "difficulty": "beginner"},
            {"word": "B", "category": "Alphabet", "difficulty": "beginner"},
            {"word": "C", "category": "Alphabet", "difficulty": "beginner"},
            {"word": "Z", "category": "Alphabet", "difficulty": "beginner"},
            
            # Numbers
            {"word": "1", "category": "Numbers", "difficulty": "beginner"},
            {"word": "2", "category": "Numbers", "difficulty": "beginner"},
            {"word": "3", "category": "Numbers", "difficulty": "beginner"},
            {"word": "10", "category": "Numbers", "difficulty": "beginner"},
            
            # Greetings
            {"word": "Hello", "category": "Greetings", "difficulty": "beginner"},
            {"word": "Goodbye", "category": "Greetings", "difficulty": "beginner"},
            {"word": "Thank you", "category": "Greetings", "difficulty": "beginner"},
            {"word": "Please", "category": "Greetings", "difficulty": "beginner"},
            {"word": "How are you", "category": "Greetings", "difficulty": "intermediate"},
            
            # Common Phrases
            {"word": "I need help", "category": "Common Phrases", "difficulty": "intermediate"},
            {"word": "Where is the bathroom", "category": "Common Phrases", "difficulty": "intermediate"},
            {"word": "My name is", "category": "Common Phrases", "difficulty": "intermediate"},
            {"word": "Nice to meet you", "category": "Common Phrases", "difficulty": "intermediate"},
            
            # Emotions
            {"word": "Happy", "category": "Emotions", "difficulty": "beginner"},
            {"word": "Sad", "category": "Emotions", "difficulty": "beginner"},
            {"word": "Angry", "category": "Emotions", "difficulty": "beginner"},
            {"word": "Surprised", "category": "Emotions", "difficulty": "beginner"},
            
            # Questions
            {"word": "What", "category": "Questions", "difficulty": "beginner"},
            {"word": "Where", "category": "Questions", "difficulty": "beginner"},
            {"word": "When", "category": "Questions", "difficulty": "beginner"},
            {"word": "Why", "category": "Questions", "difficulty": "beginner"},
            {"word": "Who", "category": "Questions", "difficulty": "beginner"},
            {"word": "How", "category": "Questions", "difficulty": "beginner"},
            
            # Food and Drink
            {"word": "Water", "category": "Food and Drink", "difficulty": "beginner"},
            {"word": "Food", "category": "Food and Drink", "difficulty": "beginner"},
            {"word": "Eat", "category": "Food and Drink", "difficulty": "beginner"},
            {"word": "Drink", "category": "Food and Drink", "difficulty": "beginner"},
            
            # Time
            {"word": "Time", "category": "Time", "difficulty": "beginner"},
            {"word": "Today", "category": "Time", "difficulty": "beginner"},
            {"word": "Tomorrow", "category": "Time", "difficulty": "intermediate"},
            {"word": "Yesterday", "category": "Time", "difficulty": "intermediate"},
            
            # Colors
            {"word": "Red", "category": "Colors", "difficulty": "beginner"},
            {"word": "Blue", "category": "Colors", "difficulty": "beginner"},
            {"word": "Green", "category": "Colors", "difficulty": "beginner"},
            {"word": "Yellow", "category": "Colors", "difficulty": "beginner"},
            {"word": "Black", "category": "Colors", "difficulty": "beginner"},
            {"word": "White", "category": "Colors", "difficulty": "beginner"},
            
            # Family
            {"word": "Mother", "category": "Family", "difficulty": "beginner"},
            {"word": "Father", "category": "Family", "difficulty": "beginner"},
            {"word": "Sister", "category": "Family", "difficulty": "beginner"},
            {"word": "Brother", "category": "Family", "difficulty": "beginner"},
            {"word": "Family", "category": "Family", "difficulty": "beginner"},
        ]
        
        # Add all entries to database
        for entry_data in entries:
            entry = SignLanguageEntry(**entry_data)
            db.session.add(entry)
        
        # Commit the changes
        db.session.commit()
        print(f"Successfully added {len(entries)} sign language entries to the database.")
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error seeding database: {str(e)}")
        print(f"Error seeding database: {str(e)}")

if __name__ == "__main__":
    with app.app_context():
        seed_database()