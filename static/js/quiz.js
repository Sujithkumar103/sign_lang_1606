/**
 * Quiz System for Sign Language Learning Platform
 * 
 * Provides interactive quizzes to test and reinforce sign language knowledge.
 */

// Quiz configuration
const QUIZ_CONFIG = {
    numberOfQuestions: 10,
    timePerQuestion: 20, // seconds
    quizTypes: ['recognition', 'matching', 'translation']
};

// Quiz state
let quizState = {
    type: null,
    difficulty: null,
    categories: [],
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: null,
    timeSpent: 0,
    timerInterval: null
};

// DOM Elements
const quizModal = document.getElementById('quiz-modal');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('quiz-results');
const reviewContainer = document.getElementById('answer-review');
const nextQuestionBtn = document.getElementById('next-question-btn');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start quiz buttons
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', function() {
            const quizType = this.getAttribute('data-quiz-type');
            startQuiz(quizType);
        });
    });
    
    // Next question button
    nextQuestionBtn.addEventListener('click', function() {
        // Check if answer is selected
        const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
        if (!selectedOption && quizState.type !== 'matching') {
            alert('Please select an answer');
            return;
        }
        
        // For matching quiz, check if all items are matched
        if (quizState.type === 'matching') {
            const unmatched = document.querySelectorAll('.matching-item:not(.matched)');
            if (unmatched.length > 0) {
                alert('Please match all items');
                return;
            }
        }
        
        // Save answer
        saveAnswer();
        
        // Move to next question or show results
        if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
            quizState.currentQuestionIndex++;
            renderCurrentQuestion();
        } else {
            showResults();
        }
    });
    
    // Review answers button
    document.getElementById('review-answers-btn').addEventListener('click', function() {
        const reviewSection = document.getElementById('answer-review');
        if (reviewSection.style.display === 'none') {
            reviewSection.style.display = 'block';
            this.innerHTML = '<i class="fas fa-eye-slash me-1"></i> Hide Review';
            renderAnswerReview();
        } else {
            reviewSection.style.display = 'none';
            this.innerHTML = '<i class="fas fa-search me-1"></i> Review Answers';
        }
    });
    
    // Retake quiz button
    document.getElementById('retake-quiz-btn').addEventListener('click', function() {
        startQuiz(quizState.type);
    });
    
    // Modal close events
    quizModal.addEventListener('hidden.bs.modal', function() {
        resetQuiz();
    });
});

/**
 * Start a new quiz
 * @param {string} quizType - Type of quiz to start
 */
function startQuiz(quizType) {
    // Reset quiz state
    resetQuiz();
    
    // Set quiz type
    quizState.type = quizType;
    
    // Get quiz difficulty
    const difficultySelector = document.querySelector(`input[name="${quizType}-difficulty"]:checked`);
    quizState.difficulty = difficultySelector ? difficultySelector.value : 'beginner';
    
    // Get quiz categories
    const allCategoriesCheckbox = document.getElementById(`${quizType}-all`);
    if (allCategoriesCheckbox && allCategoriesCheckbox.checked) {
        // Use all categories
        quizState.categories = Array.from(document.querySelectorAll(`.${quizType}-category`))
            .map(checkbox => checkbox.value);
    } else {
        // Use selected categories
        quizState.categories = Array.from(document.querySelectorAll(`.${quizType}-category:checked`))
            .map(checkbox => checkbox.value);
    }
    
    // If no categories selected, use all
    if (quizState.categories.length === 0) {
        quizState.categories = Array.from(document.querySelectorAll(`.${quizType}-category`))
            .map(checkbox => checkbox.value);
    }
    
    // Generate questions
    generateQuestions();
    
    // Set up the UI
    document.getElementById('quizModalLabel').textContent = `${capitalizeFirstLetter(quizType)} Quiz - ${capitalizeFirstLetter(quizState.difficulty)}`;
    document.getElementById('total-questions').textContent = quizState.questions.length;
    document.getElementById('current-question').textContent = 1;
    
    // Show the first question
    renderCurrentQuestion();
    
    // Record start time
    quizState.startTime = new Date();
    
    // Show the modal
    const modal = new bootstrap.Modal(quizModal);
    modal.show();
}

/**
 * Generate questions for the quiz based on type, difficulty, and categories
 */
function generateQuestions() {
    // In a real implementation, this would fetch data from the server
    // For now, we'll simulate questions based on the type and difficulty
    
    // Get all available exercises from the page
    const exercises = [];
    const exerciseElements = document.querySelectorAll('.exercise-item');
    
    exerciseElements.forEach(element => {
        const categoryElement = element.closest('[data-category]') || element.closest('[id]');
        const wordElement = element.querySelector('.exercise-name span') || item;
        const difficultyBadge = element.querySelector('.badge');
        
        let category = '';
        if (categoryElement) {
            category = categoryElement.dataset.category || categoryElement.id;
        }
        
        let word = '';
        if (wordElement) {
            word = wordElement.textContent.trim();
        }
        
        let difficulty = 'beginner';
        if (difficultyBadge && difficultyBadge.textContent) {
            difficulty = difficultyBadge.textContent.trim().toLowerCase();
        }
        
        if (category && word) {
            exercises.push({
                category,
                word,
                difficulty,
                videoPath: `/static/videos/sign_language/${word.toLowerCase()}.mp4`
            });
        }
    });
    
    // If no exercises found on the page, use a default set
    if (exercises.length === 0) {
        exercises.push(
            { category: 'Alphabet', word: 'A', difficulty: 'beginner', videoPath: '/static/videos/sign_language/a.mp4' },
            { category: 'Alphabet', word: 'B', difficulty: 'beginner', videoPath: '/static/videos/sign_language/b.mp4' },
            { category: 'Alphabet', word: 'C', difficulty: 'beginner', videoPath: '/static/videos/sign_language/c.mp4' },
            { category: 'Numbers', word: '1', difficulty: 'beginner', videoPath: '/static/videos/sign_language/1.mp4' },
            { category: 'Numbers', word: '2', difficulty: 'beginner', videoPath: '/static/videos/sign_language/2.mp4' },
            { category: 'Numbers', word: '3', difficulty: 'beginner', videoPath: '/static/videos/sign_language/3.mp4' },
            { category: 'Greetings', word: 'Hello', difficulty: 'beginner', videoPath: '/static/videos/sign_language/hello.mp4' },
            { category: 'Greetings', word: 'Goodbye', difficulty: 'beginner', videoPath: '/static/videos/sign_language/goodbye.mp4' },
            { category: 'Common Phrases', word: 'Thank you', difficulty: 'intermediate', videoPath: '/static/videos/sign_language/thank_you.mp4' },
            { category: 'Common Phrases', word: 'Please', difficulty: 'intermediate', videoPath: '/static/videos/sign_language/please.mp4' }
        );
    }
    
    // Filter exercises by selected categories and difficulty
    let filteredExercises = exercises.filter(exercise => 
        quizState.categories.includes(exercise.category) &&
        exercise.difficulty === quizState.difficulty
    );
    
    // If not enough exercises with exact difficulty, include easier ones
    if (filteredExercises.length < QUIZ_CONFIG.numberOfQuestions) {
        const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
        const currentDifficultyIndex = difficultyLevels.indexOf(quizState.difficulty);
        
        // Include easier difficulties if needed
        for (let i = 0; i < currentDifficultyIndex; i++) {
            const easierDifficulty = difficultyLevels[i];
            const easierExercises = exercises.filter(exercise => 
                quizState.categories.includes(exercise.category) &&
                exercise.difficulty === easierDifficulty
            );
            
            filteredExercises = [...filteredExercises, ...easierExercises];
            
            if (filteredExercises.length >= QUIZ_CONFIG.numberOfQuestions) {
                break;
            }
        }
    }
    
    // If still not enough, just use all available exercises
    if (filteredExercises.length < QUIZ_CONFIG.numberOfQuestions) {
        filteredExercises = exercises;
    }
    
    // Shuffle the exercises
    shuffleArray(filteredExercises);
    
    // Take only the number of questions we need
    filteredExercises = filteredExercises.slice(0, QUIZ_CONFIG.numberOfQuestions);
    
    // Generate questions based on quiz type
    switch (quizState.type) {
        case 'recognition':
            quizState.questions = generateRecognitionQuestions(filteredExercises);
            break;
        case 'matching':
            quizState.questions = generateMatchingQuestions(filteredExercises);
            break;
        case 'translation':
            quizState.questions = generateTranslationQuestions(filteredExercises);
            break;
        default:
            quizState.questions = [];
    }
}

/**
 * Generate recognition quiz questions
 * @param {Array} exercises - Exercises to use for questions
 * @returns {Array} - Array of question objects
 */
function generateRecognitionQuestions(exercises) {
    return exercises.map(exercise => {
        // Get 3 random incorrect options
        const incorrectOptions = exercises
            .filter(e => e.word !== exercise.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(e => e.word);
        
        // Add the correct answer and shuffle
        const options = [exercise.word, ...incorrectOptions];
        shuffleArray(options);
        
        return {
            type: 'recognition',
            question: 'What word does this sign represent?',
            video: exercise.videoPath,
            options: options,
            correctAnswer: exercise.word,
            category: exercise.category
        };
    });
}

/**
 * Generate matching quiz questions
 * @param {Array} exercises - Exercises to use for questions
 * @returns {Array} - Array of question objects
 */
function generateMatchingQuestions(exercises) {
    // For matching, we'll do sets of 4 items to match
    const questions = [];
    
    // Process exercises in batches of 4
    for (let i = 0; i < exercises.length; i += 4) {
        const batch = exercises.slice(i, i + 4);
        
        // If we don't have enough exercises for a complete batch, skip
        if (batch.length < 4) {
            continue;
        }
        
        const words = batch.map(exercise => exercise.word);
        const videos = batch.map(exercise => exercise.videoPath);
        
        // Create pairs of word-video
        const pairs = batch.map(exercise => ({
            word: exercise.word,
            video: exercise.videoPath
        }));
        
        questions.push({
            type: 'matching',
            question: 'Match each sign to its correct word',
            pairs: pairs,
            category: batch.map(exercise => exercise.category).join(', ')
        });
    }
    
    return questions;
}

/**
 * Generate translation quiz questions
 * @param {Array} exercises - Exercises to use for questions
 * @returns {Array} - Array of question objects
 */
function generateTranslationQuestions(exercises) {
    return exercises.map(exercise => {
        // Get 3 random incorrect video options
        const incorrectOptions = exercises
            .filter(e => e.word !== exercise.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(e => e.videoPath);
        
        // Add the correct answer and shuffle
        const options = [exercise.videoPath, ...incorrectOptions];
        shuffleArray(options);
        
        return {
            type: 'translation',
            question: `Select the sign that represents: "${exercise.word}"`,
            word: exercise.word,
            options: options,
            correctAnswer: exercise.videoPath,
            category: exercise.category
        };
    });
}

/**
 * Render the current question
 */
function renderCurrentQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    if (!question) return;
    
    // Update question counter
    document.getElementById('current-question').textContent = quizState.currentQuestionIndex + 1;
    
    // Show quiz container, hide results
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    reviewContainer.style.display = 'none';
    
    // Show next button
    nextQuestionBtn.style.display = 'block';
    
    // Render question based on type
    switch (question.type) {
        case 'recognition':
            renderRecognitionQuestion(question);
            break;
        case 'matching':
            renderMatchingQuestion(question);
            break;
        case 'translation':
            renderTranslationQuestion(question);
            break;
    }
}

/**
 * Render a recognition question
 * @param {Object} question - The question to render
 */
function renderRecognitionQuestion(question) {
    let html = `
        <div class="question-container">
            <h3 class="question-text mb-4">${question.question}</h3>
            
            <div class="video-container text-center mb-4">
                <video class="sign-video" controls loop autoplay muted>
                    <source src="${question.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
            
            <div class="options-container">
    `;
    
    // Add options
    question.options.forEach((option, index) => {
        html += `
            <div class="form-check option-item mb-3">
                <input class="form-check-input" type="radio" name="quiz-option" id="option-${index}" value="${option}">
                <label class="form-check-label" for="option-${index}">
                    ${option}
                </label>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    quizContainer.innerHTML = html;
    
    // Add event listeners to options
    document.querySelectorAll('.form-check-input').forEach(input => {
        input.addEventListener('change', function() {
            // Enable the next button when an option is selected
            nextQuestionBtn.disabled = false;
        });
    });
}

/**
 * Render a matching question
 * @param {Object} question - The question to render
 */
function renderMatchingQuestion(question) {
    // Create arrays of words and videos
    const words = question.pairs.map(pair => pair.word);
    const videos = question.pairs.map(pair => pair.video);
    
    // Shuffle both arrays
    shuffleArray(words);
    shuffleArray(videos);
    
    let html = `
        <div class="question-container">
            <h3 class="question-text mb-4">${question.question}</h3>
            
            <div class="matching-container">
                <div class="row">
                    <div class="col-md-6">
                        <h4 class="text-center mb-3">Words</h4>
                        <div class="matching-words">
    `;
    
    // Add words
    words.forEach((word, index) => {
        html += `
            <div class="matching-item word-item" data-value="${word}" draggable="true">
                <span>${word}</span>
            </div>
        `;
    });
    
    html += `
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h4 class="text-center mb-3">Signs</h4>
                        <div class="matching-videos">
    `;
    
    // Add videos
    videos.forEach((video, index) => {
        html += `
            <div class="matching-item video-item" data-value="${video}">
                <video class="sign-video-small" loop muted>
                    <source src="${video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="matching-drop-zone">Drop word here</div>
            </div>
        `;
    });
    
    html += `
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    quizContainer.innerHTML = html;
    
    // Initialize drag and drop
    initializeMatchingDragDrop();
    
    // Auto-play videos on hover
    document.querySelectorAll('.sign-video-small').forEach(video => {
        video.addEventListener('mouseenter', function() {
            this.play();
        });
        
        video.addEventListener('mouseleave', function() {
            this.pause();
            this.currentTime = 0;
        });
    });
}

/**
 * Initialize drag and drop for matching questions
 */
function initializeMatchingDragDrop() {
    const wordItems = document.querySelectorAll('.word-item');
    const videoItems = document.querySelectorAll('.video-item');
    
    let draggedItem = null;
    
    // Set up drag events for word items
    wordItems.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.getAttribute('data-value'));
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Set up drop events for video items
    videoItems.forEach(item => {
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        item.addEventListener('dragleave', function() {
            this.classList.remove('dragover');
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            // Get the dragged word
            const wordValue = e.dataTransfer.getData('text/plain');
            
            // Check if this video already has a match
            if (this.querySelector('.matched-word')) {
                // Remove the old match
                const oldMatch = this.querySelector('.matched-word');
                const oldWordValue = oldMatch.getAttribute('data-value');
                
                // Return the old word to the words list
                const oldWordItem = document.querySelector(`.word-item[data-value="${oldWordValue}"]`);
                oldWordItem.classList.remove('matched');
                oldWordItem.style.display = 'block';
                
                // Remove the old match
                oldMatch.remove();
            }
            
            // Add the new match
            const dropZone = this.querySelector('.matching-drop-zone');
            dropZone.innerHTML = '';
            
            const matchedWord = document.createElement('div');
            matchedWord.className = 'matched-word';
            matchedWord.setAttribute('data-value', wordValue);
            matchedWord.textContent = wordValue;
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-match-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Remove the match
                matchedWord.remove();
                
                // Show the drop zone text again
                dropZone.textContent = 'Drop word here';
                
                // Show the word item again
                const wordItem = document.querySelector(`.word-item[data-value="${wordValue}"]`);
                wordItem.classList.remove('matched');
                wordItem.style.display = 'block';
                
                // Remove matched class from video item
                item.classList.remove('matched');
            });
            
            matchedWord.appendChild(removeBtn);
            dropZone.appendChild(matchedWord);
            
            // Hide the original word item
            const wordItem = document.querySelector(`.word-item[data-value="${wordValue}"]`);
            wordItem.classList.add('matched');
            wordItem.style.display = 'none';
            
            // Mark video item as matched
            item.classList.add('matched');
        });
    });
}

/**
 * Render a translation question
 * @param {Object} question - The question to render
 */
function renderTranslationQuestion(question) {
    let html = `
        <div class="question-container">
            <h3 class="question-text mb-4">${question.question}</h3>
            
            <div class="options-container video-options">
                <div class="row">
    `;
    
    // Add options
    question.options.forEach((videoPath, index) => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="form-check video-option">
                    <input class="form-check-input" type="radio" name="quiz-option" id="option-${index}" value="${videoPath}">
                    <label class="form-check-label video-label" for="option-${index}">
                        <video class="sign-video-option" loop>
                            <source src="${videoPath}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        <div class="video-option-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </label>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    quizContainer.innerHTML = html;
    
    // Add event listeners to options
    document.querySelectorAll('.video-label').forEach(label => {
        label.addEventListener('click', function() {
            // Play/pause video when clicked
            const video = this.querySelector('video');
            if (video.paused) {
                // Pause all other videos
                document.querySelectorAll('.sign-video-option').forEach(v => {
                    if (v !== video) {
                        v.pause();
                        v.currentTime = 0;
                    }
                });
                
                video.play();
                this.classList.add('playing');
            } else {
                video.pause();
                video.currentTime = 0;
                this.classList.remove('playing');
            }
        });
    });
    
    // Add event listeners to radio inputs
    document.querySelectorAll('.form-check-input').forEach(input => {
        input.addEventListener('change', function() {
            // Enable the next button when an option is selected
            nextQuestionBtn.disabled = false;
            
            // Add selected class to parent
            document.querySelectorAll('.video-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            this.closest('.video-option').classList.add('selected');
        });
    });
}

/**
 * Save the current answer
 */
function saveAnswer() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    
    switch (question.type) {
        case 'recognition': {
            const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
            const userAnswer = selectedOption ? selectedOption.value : '';
            const isCorrect = userAnswer === question.correctAnswer;
            
            quizState.answers.push({
                questionIndex: quizState.currentQuestionIndex,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
            break;
        }
        case 'matching': {
            const userMatches = {};
            const videoItems = document.querySelectorAll('.video-item');
            
            videoItems.forEach(item => {
                const videoPath = item.getAttribute('data-value');
                const matchedWord = item.querySelector('.matched-word');
                
                if (matchedWord) {
                    const wordValue = matchedWord.getAttribute('data-value');
                    userMatches[videoPath] = wordValue;
                }
            });
            
            // Check if matches are correct
            let correctMatches = 0;
            question.pairs.forEach(pair => {
                if (userMatches[pair.video] === pair.word) {
                    correctMatches++;
                }
            });
            
            quizState.answers.push({
                questionIndex: quizState.currentQuestionIndex,
                userAnswer: userMatches,
                correctAnswer: question.pairs.reduce((obj, pair) => {
                    obj[pair.video] = pair.word;
                    return obj;
                }, {}),
                isCorrect: correctMatches === question.pairs.length,
                correctMatches,
                totalMatches: question.pairs.length
            });
            break;
        }
        case 'translation': {
            const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
            const userAnswer = selectedOption ? selectedOption.value : '';
            const isCorrect = userAnswer === question.correctAnswer;
            
            quizState.answers.push({
                questionIndex: quizState.currentQuestionIndex,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
            break;
        }
    }
}

/**
 * Show quiz results
 */
function showResults() {
    // Calculate score
    const correctAnswers = quizState.answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = quizState.questions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate time spent
    const endTime = new Date();
    quizState.timeSpent = Math.floor((endTime - quizState.startTime) / 1000);
    
    // Update results UI
    document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('total-questions-result').textContent = totalQuestions;
    
    // Hide quiz and show results
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    nextQuestionBtn.style.display = 'none';
    
    // Save to history
    saveQuizHistory(correctAnswers, totalQuestions);
}

/**
 * Save quiz to history
 * @param {number} score - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 */
function saveQuizHistory(score, totalQuestions) {
    const quizHistory = JSON.parse(localStorage.getItem('sign_language_quiz_history') || '[]');
    
    quizHistory.push({
        type: quizState.type,
        difficulty: quizState.difficulty,
        score,
        totalQuestions,
        timeSpent: quizState.timeSpent,
        date: new Date().toISOString()
    });
    
    // Limit history size
    if (quizHistory.length > 50) {
        quizHistory.shift();
    }
    
    localStorage.setItem('sign_language_quiz_history', JSON.stringify(quizHistory));
    
    // Update history display
    if (typeof renderQuizHistory === 'function') {
        renderQuizHistory();
    }
}

/**
 * Render the answer review
 */
function renderAnswerReview() {
    const reviewContainer = document.getElementById('review-container');
    let reviewHtml = '';
    
    quizState.answers.forEach((answer, index) => {
        const question = quizState.questions[answer.questionIndex];
        
        reviewHtml += `
            <div class="review-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-question">
                    <span class="question-number">${index + 1}.</span>
                    <span class="question-text">${question.question}</span>
                </div>
        `;
        
        switch (question.type) {
            case 'recognition':
                reviewHtml += `
                    <div class="review-details">
                        <div class="review-video">
                            <video class="sign-video-small" controls loop>
                                <source src="${question.video}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div class="review-answers">
                            <div class="correct-answer">
                                <span class="answer-label">Correct Answer:</span>
                                <span class="answer-value">${answer.correctAnswer}</span>
                            </div>
                            <div class="user-answer">
                                <span class="answer-label">Your Answer:</span>
                                <span class="answer-value ${answer.isCorrect ? 'correct-text' : 'incorrect-text'}">${answer.userAnswer}</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'matching':
                reviewHtml += `
                    <div class="review-details">
                        <div class="review-matching-results">
                            <div class="matching-score">
                                <span class="score-label">Score:</span>
                                <span class="score-value">${answer.correctMatches} / ${answer.totalMatches}</span>
                            </div>
                            <div class="matching-pairs">
                `;
                
                // Display each pair and whether it was correct
                Object.entries(answer.correctAnswer).forEach(([video, word]) => {
                    const userAnswer = answer.userAnswer[video] || 'No match';
                    const isCorrect = userAnswer === word;
                    
                    reviewHtml += `
                        <div class="matching-pair ${isCorrect ? 'correct' : 'incorrect'}">
                            <div class="pair-video">
                                <video class="sign-video-mini" loop>
                                    <source src="${video}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            <div class="pair-answers">
                                <div class="correct-answer">
                                    <span class="answer-label">Correct:</span>
                                    <span class="answer-value">${word}</span>
                                </div>
                                <div class="user-answer">
                                    <span class="answer-label">Your:</span>
                                    <span class="answer-value ${isCorrect ? 'correct-text' : 'incorrect-text'}">${userAnswer}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                reviewHtml += `
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'translation':
                // Extract word from video path
                const videoFileName = answer.correctAnswer.split('/').pop();
                const wordFromFile = videoFileName.split('.')[0];
                
                reviewHtml += `
                    <div class="review-details">
                        <div class="review-translation">
                            <div class="translation-word">
                                <span class="answer-label">Word:</span>
                                <span class="answer-value">${question.word}</span>
                            </div>
                            <div class="translation-videos">
                                <div class="correct-video">
                                    <span class="answer-label">Correct Sign:</span>
                                    <video class="sign-video-small" controls loop>
                                        <source src="${answer.correctAnswer}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                ${answer.isCorrect ? '' : `
                                <div class="user-video">
                                    <span class="answer-label">Your Choice:</span>
                                    <video class="sign-video-small" controls loop>
                                        <source src="${answer.userAnswer}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        reviewHtml += `
            </div>
        `;
    });
    
    reviewContainer.innerHTML = reviewHtml;
    
    // Initialize videos to play on hover
    document.querySelectorAll('.sign-video-small, .sign-video-mini').forEach(video => {
        video.addEventListener('mouseenter', function() {
            this.play();
        });
        
        video.addEventListener('mouseleave', function() {
            this.pause();
            this.currentTime = 0;
        });
    });
}

/**
 * Reset the quiz state
 */
function resetQuiz() {
    quizState = {
        type: null,
        difficulty: null,
        categories: [],
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        startTime: null,
        timeSpent: 0,
        timerInterval: null
    };
    
    // Clear quiz container
    quizContainer.innerHTML = '';
    
    // Reset UI elements
    document.getElementById('current-question').textContent = '1';
    document.getElementById('total-questions').textContent = '10';
    nextQuestionBtn.disabled = false;
    nextQuestionBtn.style.display = 'block';
    
    // Hide results and review
    resultsContainer.style.display = 'none';
    reviewContainer.style.display = 'none';
    document.getElementById('review-answers-btn').innerHTML = '<i class="fas fa-search me-1"></i> Review Answers';
}

/**
 * Utility function to shuffle an array in place
 * @param {Array} array - The array to shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add CSS for quiz system
const quizStyles = document.createElement('style');
quizStyles.textContent = `
    /* Quiz System Styles */
    .quiz-type-card {
        transition: all 0.3s ease;
        border: none;
        border-radius: var(--border-radius);
        overflow: hidden;
    }
    
    .quiz-type-card:hover {
        transform: translateY(-5px);
    }
    
    .quiz-progress {
        background-color: #f8f9fc;
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
        font-weight: 600;
        color: #4e73df;
    }
    
    .question-container {
        padding: 1.5rem;
    }
    
    .question-text {
        text-align: center;
        color: var(--primary-color);
        margin-bottom: 1.5rem;
    }
    
    .options-container {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .option-item {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        margin-bottom: 0.75rem;
        transition: all 0.3s ease;
    }
    
    .option-item:hover {
        background-color: #f8f9fc;
        transform: translateX(5px);
    }
    
    .form-check-input:checked + .form-check-label {
        font-weight: 600;
        color: var(--primary-color);
    }
    
    .video-container {
        max-width: 400px;
        margin: 0 auto 2rem;
    }
    
    .sign-video {
        width: 100%;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
    
    .sign-video-small {
        width: 150px;
        height: 150px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
    }
    
    .sign-video-mini {
        width: 80px;
        height: 80px;
        border-radius: var(--border-radius);
    }
    
    /* Matching Question Styles */
    .matching-container {
        padding: 1rem;
    }
    
    .matching-words, .matching-videos {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .matching-item {
        padding: 1rem;
        background-color: white;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .word-item {
        text-align: center;
        font-weight: 600;
        color: var(--primary-color);
    }
    
    .video-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .matching-drop-zone {
        margin-top: 0.5rem;
        padding: 0.5rem;
        border: 1px dashed var(--border-color);
        border-radius: var(--border-radius);
        text-align: center;
        color: var(--text-color);
        opacity: 0.7;
        width: 100%;
    }
    
    .matched-word {
        background-color: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius);
        position: relative;
        width: 100%;
        text-align: center;
    }
    
    .remove-match-btn {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: var(--danger-color);
        color: white;
        border: none;
        font-size: 12px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    .dragging {
        opacity: 0.5;
    }
    
    .dragover {
        background-color: #f8f9fc;
        transform: scale(1.05);
    }
    
    /* Translation Question Styles */
    .video-options {
        max-width: 100%;
    }
    
    .video-option {
        text-align: center;
        padding: 0;
        position: relative;
    }
    
    .video-label {
        cursor: pointer;
        display: block;
        position: relative;
    }
    
    .sign-video-option {
        width: 100%;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        max-height: 200px;
    }
    
    .video-option-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        border-radius: var(--border-radius);
        transition: all 0.3s ease;
    }
    
    .video-label:hover .video-option-overlay {
        background-color: rgba(0, 0, 0, 0.2);
    }
    
    .video-label.playing .video-option-overlay {
        opacity: 0;
    }
    
    .video-option.selected {
        transform: scale(1.05);
    }
    
    .video-option.selected .video-label:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 3px solid var(--primary-color);
        border-radius: var(--border-radius);
        pointer-events: none;
    }
    
    /* Results Styles */
    .score-display {
        padding: 2rem 0;
    }
    
    .score-circle {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        background-color: var(--light-color);
        border: 8px solid var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--primary-color);
    }
    
    /* Review Styles */
    .review-heading {
        margin: 1.5rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
    }
    
    .review-item {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border-radius: var(--border-radius);
        background-color: white;
        border-left: 5px solid var(--border-color);
    }
    
    .review-item.correct {
        border-left-color: var(--success-color);
    }
    
    .review-item.incorrect {
        border-left-color: var(--danger-color);
    }
    
    .review-question {
        margin-bottom: 1rem;
    }
    
    .question-number {
        font-weight: 700;
        margin-right: 0.5rem;
    }
    
    .review-details {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .review-answers, .review-matching-results, .review-translation {
        flex: 1;
    }
    
    .answer-label, .score-label {
        font-weight: 600;
        margin-right: 0.5rem;
    }
    
    .correct-text {
        color: var(--success-color);
        font-weight: 600;
    }
    
    .incorrect-text {
        color: var(--danger-color);
        font-weight: 600;
    }
    
    .matching-pairs {
        margin-top: 1rem;
    }
    
    .matching-pair {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        background-color: #f8f9fc;
    }
    
    .matching-pair.correct {
        background-color: rgba(28, 200, 138, 0.1);
    }
    
    .matching-pair.incorrect {
        background-color: rgba(231, 74, 59, 0.1);
    }
    
    .translation-videos {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .correct-video, .user-video {
        text-align: center;
    }
    
    /* Responsive Adjustments */
    @media (max-width: 768px) {
        .review-details {
            flex-direction: column;
        }
        
        .translation-videos {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(quizStyles);