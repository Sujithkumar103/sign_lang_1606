import os
import uuid
import logging
from datetime import datetime
import tempfile
from flask import render_template, request, jsonify, send_file, session
from gtts import gTTS
import speech_recognition as sr

from app import app, db
from models import SignLanguageEntry, SessionActivity
from utils import process_text, find_sign_video

# Generate or get session ID
def get_session_id():
    """Get or create a session ID for tracking user activity"""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return session['session_id']

# Main routes
@app.route('/')
def index():
    """Render the home page"""
    return render_template('index.html')

@app.route('/about')
def about():
    """Render the about page"""
    return render_template('about.html')

@app.route('/exercises')
def exercises():
    """Render the exercises page"""
    # Get categories and exercises from database
    categories = db.session.query(SignLanguageEntry.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]  # Remove None values
    
    exercises_data = {}
    for category in categories:
        exercises = SignLanguageEntry.query.filter_by(category=category).all()
        exercises_data[category] = exercises
    
    return render_template('exercises.html', categories=categories, exercises_data=exercises_data)

@app.route('/quiz')
def quiz():
    """Render the quiz page"""
    # Get categories for the quiz page
    categories = db.session.query(SignLanguageEntry.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]  # Remove None values
    
    return render_template('quiz.html', categories=categories)

# API endpoints
@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """Convert text to speech and return audio file"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Log activity
        session_id = get_session_id()
        activity = SessionActivity(
            session_id=session_id,
            text_to_speech_used=True,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
        db.session.commit()
        
        # Create a temporary file for the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            temp_filename = temp_file.name
            
            # Generate speech from text
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(temp_filename)
            
            # Return the audio file
            return send_file(
                temp_filename,
                mimetype='audio/mp3',
                as_attachment=True,
                download_name='speech.mp3'
            )
    except Exception as e:
        logging.error(f"Error in text_to_speech: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    """Convert speech to text from an audio file"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save the file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            temp_filename = temp_file.name
            audio_file.save(temp_filename)
            
            # Initialize recognizer
            recognizer = sr.Recognizer()
            
            # Load audio file
            with sr.AudioFile(temp_filename) as source:
                audio_data = recognizer.record(source)
                
                # Convert speech to text
                text = recognizer.recognize_google(audio_data)
                
                # Process the text
                processed_text = ' '.join(process_text(text))
                
                # Log activity
                session_id = get_session_id()
                activity = SessionActivity(
                    session_id=session_id,
                    speech_to_text_used=True,
                    word_searched=text[:100],  # Store first 100 chars
                    timestamp=datetime.utcnow()
                )
                db.session.add(activity)
                db.session.commit()
                
                return jsonify({
                    'original_text': text,
                    'processed_text': processed_text
                })
    except sr.UnknownValueError:
        return jsonify({'error': 'Could not understand audio'}), 400
    except sr.RequestError as e:
        logging.error(f"Error in speech recognition: {str(e)}")
        return jsonify({'error': f'Speech recognition error: {str(e)}'}), 500
    except Exception as e:
        logging.error(f"Error in speech_to_text: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temp file
        if 'temp_filename' in locals():
            try:
                if os.path.exists(temp_filename):
                    os.unlink(temp_filename)
            except Exception as e:
                logging.error(f"Error removing temp file: {str(e)}")

@app.route('/api/find-sign-video', methods=['POST'])
def find_sign_language_video():
    """Find sign language video for a word or phrase"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Process the text to get the base form
        processed_words = process_text(text)
        if not processed_words:
            return jsonify({'error': 'No valid words found'}), 400
            
        # For simplicity, we'll just use the first word
        word = processed_words[0]
        
        # Log activity
        session_id = get_session_id()
        activity = SessionActivity(
            session_id=session_id,
            word_searched=word,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
        db.session.commit()
        
        # Try to find a video for the word
        video_path, video_title = find_sign_video(word)
        
        if video_path:
            # Return the video path and the exact video title
            return jsonify({
                'word': word,
                'video_path': '/' + video_path,
                'video_title': video_title
            })
        else:
            # Check if the word exists in the database
            entry = SignLanguageEntry.query.filter(
                db.func.lower(SignLanguageEntry.word) == db.func.lower(word)
            ).first()
            
            if entry and entry.video_path:
                # Extract the video title from the path
                filename = os.path.basename(entry.video_path)
                video_title = os.path.splitext(filename)[0]  # Remove the extension
                
                return jsonify({
                    'word': word,
                    'video_path': entry.video_path,
                    'video_title': video_title
                })
            else:
                # No video found
                return jsonify({
                    'word': word,
                    'video_path': None
                })
    except Exception as e:
        logging.error(f"Error in find_sign_language_video: {str(e)}")
        return jsonify({'error': str(e)}), 500