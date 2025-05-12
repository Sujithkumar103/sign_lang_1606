// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize accessibility controls
    initializeAccessibilityControls();
    
    // Set up sign language translation functionality
    const translateBtn = document.getElementById('translate-btn');
    const inputText = document.getElementById('input-text');
    const outputDisplay = document.getElementById('output-display');
    const speakBtn = document.getElementById('speak-btn');
    const recordBtn = document.getElementById('record-btn');
    const stopRecordBtn = document.getElementById('stop-record-btn');
    const clearBtn = document.getElementById('clear-btn');
    const statusMessage = document.getElementById('status-message');
    const speechModal = document.getElementById('speech-modal');
    const closeModal = document.querySelector('.close-modal');
    const speechStatusText = document.getElementById('speech-status-text');
    
    // Media recorder for speech recognition
    let mediaRecorder;
    let audioChunks = [];
    
    // Set up event listeners
    if (translateBtn) {
        translateBtn.addEventListener('click', translateText);
    }
    
    if (speakBtn) {
        speakBtn.addEventListener('click', speakText);
    }
    
    if (recordBtn) {
        recordBtn.addEventListener('click', startRecording);
    }
    
    if (stopRecordBtn) {
        stopRecordBtn.addEventListener('click', stopRecording);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }
    
    // Handle all close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Use Bootstrap's modal hide method
                const modal = bootstrap.Modal.getInstance(speechModal);
                if (modal) {
                    modal.hide();
                }
                
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            });
        }
    });
    
    // Initialize learning phrases if on the main page
    if (document.getElementById('learning-phrases')) {
        initLearningPhrases();
    }
});

// Accessibility Controls
function initializeAccessibilityControls() {
    const increaseTextBtn = document.getElementById('increase-text');
    const decreaseTextBtn = document.getElementById('decrease-text');
    const colorOptions = document.querySelectorAll('.color-options button[data-color]');
    const highContrastBtn = document.getElementById('high-contrast-toggle');
    
    // Initialize font size from storage if available
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
        document.documentElement.style.setProperty('--font-size-base', storedFontSize);
    }
    
    // Initialize text color from storage if available
    const storedColor = localStorage.getItem('textColor');
    if (storedColor) {
        setTextColor(storedColor);
        colorOptions.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.color === storedColor) {
                button.classList.add('active');
            }
        });
    }
    
    // Initialize high contrast mode if previously enabled
    const highContrastEnabled = localStorage.getItem('highContrast') === 'true';
    if (highContrastEnabled) {
        document.body.classList.add('high-contrast');
        if (highContrastBtn) {
            highContrastBtn.classList.add('active');
        }
    }
    
    // Font size controls
    if (increaseTextBtn) {
        increaseTextBtn.addEventListener('click', function() {
            adjustFontSize(1);
        });
    }
    
    if (decreaseTextBtn) {
        decreaseTextBtn.addEventListener('click', function() {
            adjustFontSize(-1);
        });
    }
    
    // Text color controls
    colorOptions.forEach(button => {
        button.addEventListener('click', function() {
            colorOptions.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const color = this.dataset.color;
            setTextColor(color);
            localStorage.setItem('textColor', color);
        });
    });
    
    // High contrast toggle
    if (highContrastBtn) {
        highContrastBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            document.body.classList.toggle('high-contrast');
            
            // Store preference
            const isHighContrast = document.body.classList.contains('high-contrast');
            localStorage.setItem('highContrast', isHighContrast);
            
            // Apply current text color if high contrast is enabled
            if (isHighContrast) {
                // Get current color from one of the color option buttons
                const activeColorBtn = document.querySelector('.color-options button.active');
                if (activeColorBtn) {
                    const color = activeColorBtn.dataset.color || 'default';
                    setTextColor(color); // Re-apply color in high contrast mode
                }
            }
            
            // Show feedback
            showFeedback(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`, 'info');
        });
    }
}

// Adjust the font size based on the adjustment value
function adjustFontSize(adjustment) {
    const root = document.documentElement;
    const currentSize = getComputedStyle(root).getPropertyValue('--font-size-base');
    const currentValue = parseFloat(currentSize);
    const newValue = Math.max(12, Math.min(24, currentValue + adjustment));
    
    root.style.setProperty('--font-size-base', `${newValue}px`);
    localStorage.setItem('fontSize', `${newValue}px`);
}

// Set the text color across the application
function setTextColor(color) {
    const root = document.documentElement;
    const isHighContrast = document.body.classList.contains('high-contrast');
    
    // Remove any previous text color classes
    document.body.classList.remove('text-color-orange', 'text-color-red', 'text-color-yellow', 'text-color-default');
    
    // Add the appropriate class for the current color
    document.body.classList.add(`text-color-${color}`);
    
    if (isHighContrast) {
        // High contrast mode has specific text colors
        switch (color) {
            case 'orange':
                root.style.setProperty('--high-contrast-text', '#ff9933');
                break;
            case 'red':
                root.style.setProperty('--high-contrast-text', '#ff6666');
                break;
            case 'yellow':
                root.style.setProperty('--high-contrast-text', '#ffdd44');
                break;
            default:
                root.style.setProperty('--high-contrast-text', '#ffffff');
                break;
        }
    } else {
        // Normal mode text colors
        switch (color) {
            case 'orange':
                root.style.setProperty('--text-color', '#ff8800');
                break;
            case 'red':
                root.style.setProperty('--text-color', '#ff3333');
                break;
            case 'yellow':
                root.style.setProperty('--text-color', '#ffcc00');
                break;
            default:
                root.style.setProperty('--text-color', '#333333');
                break;
        }
    }
}

// Initialize the learning phrases section
function initLearningPhrases() {
    const phraseBtns = document.querySelectorAll('.phrase-btn');
    const inputText = document.getElementById('input-text');
    
    phraseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const phrase = this.dataset.phrase;
            inputText.value = phrase;
            
            // Trigger translation if translate button exists
            const translateBtn = document.getElementById('translate-btn');
            if (translateBtn) {
                translateBtn.click();
            }
        });
    });
}

// Translate text to sign language
function translateText() {
    const inputText = document.getElementById('input-text');
    const videoPlayer = document.getElementById('videoPlayer');
    const wordList = document.getElementById('word-list');
    const videoLoading = document.getElementById('video-loading');
    const videoEmptyState = document.getElementById('video-empty-state');
    const text = inputText.value.trim();
    
    if (!text) {
        showFeedback('Please enter some text to translate', 'error');
        return;
    }
    
    // Show loading state specifically in the video area
    if (videoLoading) videoLoading.classList.remove('hidden');
    if (videoEmptyState) videoEmptyState.classList.add('hidden');
    if (videoPlayer) videoPlayer.classList.add('hidden');
    
    // Also show global loading for slow connections
    showLoading(true);
    
    // Get words from the text
    const words = text.split(/\s+/);
    
    // Clear the word list
    wordList.innerHTML = '';
    
    // Generate word list elements
    words.forEach((word, index) => {
        const wordItem = document.createElement('span');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.dataset.index = index;
        wordList.appendChild(wordItem);
    });
    
    // Store video and audio sources globally
    window.videoSources = [];
    window.audioSources = [];
    let currentWordIndex = 0;
    let videosLoaded = 0;
    
    // Optimize loading by fetching videos and audio concurrently for each word
    const fetchPromises = words.map((word, index) => {
        // For each word, we'll create an object to store both video and audio
        window.mediaResources = window.mediaResources || [];
        window.mediaResources[index] = {
            word: word,
            videoReady: false,
            audioReady: false,
            videoPath: '',
            audioBlob: null,
            audioElement: null
        };
        
        // Create two promises for each word - one for video, one for audio
        const videoPromise = fetch('/api/find-sign-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: word })
        })
        .then(response => response.json())
        .then(data => {
            // Store the video path and title
            window.videoSources[index] = data.video_path || '';
            window.mediaResources[index].videoPath = data.video_path || '';
            window.mediaResources[index].videoTitle = data.video_title || word;
            window.mediaResources[index].videoReady = true;
            videosLoaded++;
            
            // Update the word item with a class if video is available
            const wordItem = wordList.querySelector(`[data-index="${index}"]`);
            if (wordItem) {
                if (data.video_path) {
                    wordItem.classList.add('has-video');
                } else {
                    wordItem.classList.add('no-video');
                }
            }
            
            return data;
        })
        .catch(error => {
            console.error(`Error fetching video for word "${word}":`, error);
            window.videoSources[index] = '';
            window.mediaResources[index].videoReady = true;
            videosLoaded++;
            return null;
        });
        
        // Audio generation completely removed as per user request
        const audioPromise = Promise.resolve(null);
        window.mediaResources[index].audioReady = true;
        
        // Return a promise that resolves when both video and audio are ready
        return Promise.all([videoPromise, audioPromise]);
    });
    
    // After all videos are fetched
    Promise.all(fetchPromises)
        .then(() => {
            // Hide both global and local loading indicators
            showLoading(false);
            if (videoLoading) videoLoading.classList.add('hidden');
            
            // Show video player if we have videos
            if (window.videoSources.length > 0 && window.videoSources.some(src => src)) {
                if (videoPlayer) videoPlayer.classList.remove('hidden');
                if (videoEmptyState) videoEmptyState.classList.add('hidden');
                
                // Find the first video that exists
                const firstVideoIndex = window.videoSources.findIndex(src => src);
                if (firstVideoIndex >= 0) {
                    playVideoAtIndex(firstVideoIndex);
                }
            } else {
                // No videos found, show empty state
                if (videoPlayer) videoPlayer.classList.add('hidden');
                if (videoEmptyState) videoEmptyState.classList.remove('hidden');
                showFeedback('No sign language videos available for these words', 'warning');
            }
        })
        .catch(error => {
            // Hide loading indicators
            showLoading(false);
            if (videoLoading) videoLoading.classList.add('hidden');
            
            // Show empty state
            if (videoPlayer) videoPlayer.classList.add('hidden');
            if (videoEmptyState) videoEmptyState.classList.remove('hidden');
            
            showFeedback('Error loading sign language videos', 'error');
            console.error('Error loading videos:', error);
        });
    
    // Setup video player event listeners
    if (videoPlayer) {
        // When video ends, play the next one
        videoPlayer.addEventListener('ended', function() {
            const nextIndex = currentWordIndex + 1;
            if (nextIndex < words.length) {
                playVideoAtIndex(nextIndex);
            }
        });
        
        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                if (videoPlayer.paused) {
                    videoPlayer.play();
                    this.innerHTML = '<i class="fas fa-pause"></i> Pause';
                } else {
                    videoPlayer.pause();
                    this.innerHTML = '<i class="fas fa-play"></i> Play';
                }
            });
        }
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                playVideoAtIndex(0);
            });
        }
    }
    
    // Add click events to word items
    const wordItems = wordList.querySelectorAll('.word-item');
    wordItems.forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (!isNaN(index) && window.videoSources[index]) {
                playVideoAtIndex(index);
            }
        });
    });
    
    // Function to play video at specific index
    function playVideoAtIndex(index) {
        if (index >= 0 && index < window.videoSources.length) {
            const videoPath = window.videoSources[index];
            
            if (!videoPath) {
                // Skip words without videos
                const nextIndex = index + 1;
                if (nextIndex < window.videoSources.length) {
                    playVideoAtIndex(nextIndex);
                }
                return;
            }
            
            // Update current index
            currentWordIndex = index;
            
            // Get the preloaded media resources for this word
            const mediaResource = window.mediaResources && window.mediaResources[index];
            
            // Update video source
            if (videoPlayer.querySelector('source')) {
                videoPlayer.querySelector('source').src = videoPath;
            } else {
                const source = document.createElement('source');
                source.src = videoPath;
                source.type = 'video/mp4';
                videoPlayer.appendChild(source);
            }
            
            // Reset and load the video
            videoPlayer.load();
            
            // Audio completely removed as per user request
            
            // Update play/pause button
            const playPauseBtn = document.getElementById('play-pause-btn');
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                
                // Update play/pause button (audio removed)
                playPauseBtn.onclick = function() {
                    if (videoPlayer.paused) {
                        videoPlayer.play();
                        this.innerHTML = '<i class="fas fa-pause"></i> Pause';
                    } else {
                        videoPlayer.pause();
                        this.innerHTML = '<i class="fas fa-play"></i> Play';
                    }
                };
            }
            
            // Start playing the video after a brief delay to ensure everything is ready
            setTimeout(() => {
                videoPlayer.play().catch(e => {
                    console.log("Error playing video:", e);
                });
            }, 50);
            
            // Update active word highlighting
            const wordItems = wordList.querySelectorAll('.word-item');
            wordItems.forEach(item => {
                item.classList.remove('active');
            });
            
            const activeWord = wordList.querySelector(`[data-index="${index}"]`);
            if (activeWord) {
                activeWord.classList.add('active');
                
                // Scroll to the active word if needed
                activeWord.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }
}

// Display sign language representation for a word
function displaySignForWord(word) {
    const outputDisplay = document.getElementById('output-display');
    const videoContainer = outputDisplay.querySelector('.sign-videos');
    
    // Check if we have sign data for this word
    const signData = getSignData(word.toLowerCase());
    
    if (signData) {
        // Create container for this word
        const signItem = document.createElement('div');
        signItem.className = 'sign-video-item';
        
        const wordLabel = document.createElement('div');
        wordLabel.className = 'word-label';
        wordLabel.textContent = word;
        
        const svgContainer = document.createElement('div');
        svgContainer.className = 'svg-container';
        svgContainer.innerHTML = signData;
        
        // Animate the SVG if possible
        const svgElement = svgContainer.querySelector('svg');
        if (svgElement) {
            animateSign(svgElement);
        }
        
        signItem.appendChild(wordLabel);
        signItem.appendChild(svgContainer);
        videoContainer.appendChild(signItem);
    } else {
        // Display a message for words without sign representation
        const signItem = document.createElement('div');
        signItem.className = 'sign-video-item missing-sign';
        
        const wordLabel = document.createElement('div');
        wordLabel.className = 'word-label';
        wordLabel.textContent = word;
        
        const missingMsg = document.createElement('div');
        missingMsg.className = 'missing-message';
        missingMsg.textContent = 'No sign available';
        
        signItem.appendChild(wordLabel);
        signItem.appendChild(missingMsg);
        videoContainer.appendChild(signItem);
    }
}

// Convert text to speech
function speakText() {
    const inputText = document.getElementById('input-text');
    const text = inputText.value.trim();
    
    if (!text) {
        showFeedback('Please enter some text to speak', 'error');
        return;
    }
    
    showLoading(true);
    showFeedback('Generating speech...', 'info');
    
    // Send request to the server
    fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob();
    })
    .then(blob => {
        // Create audio element and play the speech
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = function() {
            URL.revokeObjectURL(audioUrl);
        };
        audio.play();
        
        showLoading(false);
        showFeedback('Playing speech...', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showLoading(false);
        showFeedback('Error generating speech', 'error');
    });
}

// Start recording speech
function startRecording() {
    const recordBtn = document.getElementById('record-btn');
    const stopRecordBtn = document.getElementById('stop-record-btn');
    const speechModal = document.getElementById('speech-modal');
    const speechStatusText = document.getElementById('speech-status-text');
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioChunks = [];
            
            // Show the recording modal using Bootstrap
            const modal = new bootstrap.Modal(speechModal);
            modal.show();
            speechStatusText.textContent = 'Listening...';
            
            // Hide record button, show stop button
            if (recordBtn) recordBtn.classList.add('hidden');
            if (stopRecordBtn) stopRecordBtn.classList.remove('hidden');
            
            // Create media recorder
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener('stop', () => {
                // Release microphone
                stream.getTracks().forEach(track => track.stop());
                
                // Process the recorded audio
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    sendAudioToServer(audioBlob);
                }
                
                // Reset UI
                if (recordBtn) recordBtn.classList.remove('hidden');
                if (stopRecordBtn) stopRecordBtn.classList.add('hidden');
            });
            
            // Start recording
            mediaRecorder.start();
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            showFeedback('Error accessing microphone. Please make sure you have given permission.', 'error');
        });
}

// Stop recording speech
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        const speechStatusText = document.getElementById('speech-status-text');
        if (speechStatusText) {
            speechStatusText.textContent = 'Processing speech...';
        }
    }
}

// Send recorded audio to the server for processing
function sendAudioToServer(audioBlob) {
    const inputText = document.getElementById('input-text');
    const speechModal = document.getElementById('speech-modal');
    const speechStatusText = document.getElementById('speech-status-text');
    
    showLoading(true);
    
    // Create form data to send audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    // Send to server
    fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update input text with recognized speech
        inputText.value = data.original_text;
        
        // Close the modal using Bootstrap
        const modal = bootstrap.Modal.getInstance(speechModal);
        if (modal) {
            modal.hide();
        }
        
        // Trigger translation
        const translateBtn = document.getElementById('translate-btn');
        if (translateBtn) {
            translateBtn.click();
        }
        
        showLoading(false);
    })
    .catch(error => {
        console.error('Error:', error);
        
        speechStatusText.textContent = 'Error: ' + error.message;
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(speechModal);
            if (modal) {
                modal.hide();
            }
        }, 2000);
        
        showLoading(false);
        showFeedback('Error processing speech: ' + error.message, 'error');
    });
}

// Display feedback message
function showFeedback(message, type = 'info') {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) return;
    
    statusMessage.textContent = message;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(type);
    statusMessage.classList.remove('hidden');
    
    // Hide message after a delay
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

// Show/hide loading indicator
function showLoading(show) {
    const loadingIndicator = document.querySelector('.loading-indicator');
    
    if (!loadingIndicator) {
        // Create loading indicator if it doesn't exist
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator' + (show ? '' : ' hidden');
        indicator.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
        document.body.appendChild(indicator);
    } else {
        // Toggle existing indicator
        if (show) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Clear all input and output
function clearAll() {
    const inputText = document.getElementById('input-text');
    const videoPlayer = document.getElementById('videoPlayer');
    const wordList = document.getElementById('word-list');
    const statusMessage = document.getElementById('status-message');
    const videoLoading = document.getElementById('video-loading');
    const videoEmptyState = document.getElementById('video-empty-state');
    
    // Clear input text
    if (inputText) {
        inputText.value = '';
    }
    
    // Clear word list
    if (wordList) {
        wordList.innerHTML = '';
    }
    
    // Reset video player
    if (videoPlayer) {
        // Reset video source
        if (videoPlayer.querySelector('source')) {
            videoPlayer.querySelector('source').src = '';
        }
        videoPlayer.load(); // Reload to clear the video
        videoPlayer.classList.add('hidden');
        
        // Reset play/pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }
    }
    
    // Make sure loading is hidden
    if (videoLoading) {
        videoLoading.classList.add('hidden');
    }
    
    // Show empty state
    if (videoEmptyState) {
        videoEmptyState.classList.remove('hidden');
    }
    
    // Clear status message
    if (statusMessage) {
        statusMessage.classList.add('hidden');
    }
    
    // Reset global video and audio sources
    window.videoSources = [];
    
    // Release audio resources
    if (window.audioSources) {
        for (let i = 0; i < window.audioSources.length; i++) {
            if (window.audioSources[i]) {
                URL.revokeObjectURL(window.audioSources[i]);
            }
        }
        window.audioSources = [];
    }
    
    // Clean up preloaded media resources
    if (window.mediaResources) {
        for (let i = 0; i < window.mediaResources.length; i++) {
            if (window.mediaResources[i] && window.mediaResources[i].audioElement) {
                // Stop any playing audio
                const audio = window.mediaResources[i].audioElement;
                audio.pause();
                audio.src = '';
                
                // Release the blob URL
                if (audio.src && audio.src.startsWith('blob:')) {
                    URL.revokeObjectURL(audio.src);
                }
            }
        }
        window.mediaResources = [];
    }
    
    showFeedback('Cleared all content', 'info');
}