import nltk
from nltk.stem import WordNetLemmatizer
import os
import logging
from flask import current_app

# Download NLTK data if not already downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger')
    
# This is the correct name for the tagger model - using both to ensure compatibility
try:
    nltk.data.find('taggers/averaged_perceptron_tagger_eng')  
except LookupError:
    nltk.download('averaged_perceptron_tagger')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

def process_text(text):
    """
    Process text using NLP techniques to prepare for sign language translation
    
    Args:
        text (str): Input text to process
        
    Returns:
        list: List of processed words
    """
    if not text:
        return []
    
    try:
        # Tokenize the text into words
        words = nltk.word_tokenize(text.lower())
        
        # Part-of-speech tagging
        tagged = nltk.pos_tag(words)
        
        # Process each word based on its part of speech
        processed_words = []
        for word, tag in tagged:
            # Remove punctuation
            if all(char in '.,?!;:"\'()[]{}' for char in word):
                continue
                
            # Lemmatize word based on POS
            if tag.startswith('N'):  # Noun
                lemma = lemmatizer.lemmatize(word, 'n')
            elif tag.startswith('V'):  # Verb
                lemma = lemmatizer.lemmatize(word, 'v')
            elif tag.startswith('J'):  # Adjective
                lemma = lemmatizer.lemmatize(word, 'a')
            elif tag.startswith('R'):  # Adverb
                lemma = lemmatizer.lemmatize(word, 'r')
            else:
                lemma = lemmatizer.lemmatize(word)
                
            processed_words.append(lemma)
        
        return processed_words
    except Exception as e:
        # Fallback if NLTK processing fails
        logging.error(f"Error in process_text: {str(e)}")
        
        # Just return the words split by whitespace as a simple fallback
        return [w for w in text.lower().split() if w and not all(char in '.,?!;:"\'()[]{}' for char in w)]

def find_sign_video(word, video_dir='static/videos/sign_language/'):
    """
    Find a matching sign language video for a word, trying different case variants
    
    Args:
        word (str): Word to find a video for
        video_dir (str): Directory path where videos are stored
        
    Returns:
        tuple: (path, title) where path is the path to the video file and title is the exact name 
              without extension, or (None, None) if not found
    """
    # Get root path for static files
    app_root = current_app.root_path
    full_video_dir = os.path.join(app_root, video_dir)
    
    # Create the directory if it doesn't exist
    if not os.path.exists(full_video_dir):
        try:
            os.makedirs(full_video_dir)
            logging.info(f"Created directory: {full_video_dir}")
        except Exception as e:
            logging.error(f"Error creating directory {full_video_dir}: {str(e)}")
    
    # Try exact match
    filename = f"{word}.mp4"
    video_path = os.path.join(video_dir, filename)
    if check_video_exists(os.path.join(app_root, video_path)):
        return video_path, word
    
    # Try lowercase
    filename = f"{word.lower()}.mp4"
    video_path = os.path.join(video_dir, filename)
    if check_video_exists(os.path.join(app_root, video_path)):
        return video_path, word.lower()
    
    # Try capitalizing first letter
    filename = f"{word.capitalize()}.mp4"
    video_path = os.path.join(video_dir, filename)
    if check_video_exists(os.path.join(app_root, video_path)):
        return video_path, word.capitalize()
    
    # Try uppercase
    filename = f"{word.upper()}.mp4"
    video_path = os.path.join(video_dir, filename)
    if check_video_exists(os.path.join(app_root, video_path)):
        return video_path, word.upper()
    
    # No match found
    return None, None

def check_video_exists(path):
    """
    Check if a video file exists at the specified path
    
    Args:
        path (str): Full path to check
        
    Returns:
        bool: True if the file exists, False otherwise
    """
    return os.path.exists(path) and os.path.isfile(path)