/**
 * Spaced Repetition System for Sign Language Learning
 * 
 * Implements a spaced repetition algorithm based on the SM-2 algorithm
 * to optimize memory retention for learning sign language.
 */

class SpacedRepetitionSystem {
    constructor() {
        this.storageKey = 'sign_language_srs';
        this.cards = this.loadCards();
        this.currentSession = [];
        this.sessionInProgress = false;
    }
    
    /**
     * Load spaced repetition cards from localStorage
     */
    loadCards() {
        const savedCards = localStorage.getItem(this.storageKey);
        return savedCards ? JSON.parse(savedCards) : {};
    }
    
    /**
     * Save cards to localStorage
     */
    saveCards() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cards));
    }
    
    /**
     * Add a new card or update an existing one
     * @param {string} category - Category the sign belongs to
     * @param {string} word - The word/sign to learn
     */
    addCard(category, word) {
        const cardId = `${category}-${word}`;
        
        // If card doesn't exist, create it with default values
        if (!this.cards[cardId]) {
            this.cards[cardId] = {
                category,
                word,
                easeFactor: 2.5,         // Initial ease factor
                interval: 0,             // Current interval in days
                repetitions: 0,          // Number of correct repetitions
                dueDate: new Date().toISOString(),  // Initially due immediately
                lastReviewed: null
            };
        }
        
        this.saveCards();
        return this.cards[cardId];
    }
    
    /**
     * Process a review of a card
     * @param {string} cardId - ID of the card
     * @param {number} quality - Quality of response (0-5)
     */
    processReview(cardId, quality) {
        if (!this.cards[cardId]) {
            console.error('Card not found:', cardId);
            return null;
        }
        
        const card = this.cards[cardId];
        card.lastReviewed = new Date().toISOString();
        
        // SM-2 algorithm implementation
        if (quality >= 3) {
            // Correct response
            if (card.repetitions === 0) {
                card.interval = 1;
            } else if (card.repetitions === 1) {
                card.interval = 6;
            } else {
                card.interval = Math.round(card.interval * card.easeFactor);
            }
            card.repetitions++;
        } else {
            // Incorrect response, reset repetitions
            card.repetitions = 0;
            card.interval = 0;
        }
        
        // Update ease factor based on quality
        card.easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        
        // Calculate next due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + card.interval);
        card.dueDate = dueDate.toISOString();
        
        // Update card in storage
        this.saveCards();
        
        // If this was part of a study session, update session
        if (this.sessionInProgress) {
            this.updateSessionCard(cardId, quality);
        }
        
        return card;
    }
    
    /**
     * Get cards that are due for review
     * @param {number} limit - Maximum number of cards to return
     * @returns {Array} - Array of card objects due for review
     */
    getDueCards(limit = 20) {
        const now = new Date();
        
        // Find cards that are due for review
        const dueCards = Object.entries(this.cards)
            .filter(([_, card]) => new Date(card.dueDate) <= now)
            .map(([id, card]) => ({ id, ...card }));
        
        // Sort by most overdue first
        dueCards.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        return dueCards.slice(0, limit);
    }
    
    /**
     * Start a spaced repetition study session
     * @param {number} newCardLimit - Maximum number of new cards to include
     * @param {number} totalCardLimit - Maximum total cards in session
     */
    startSession(newCardLimit = 5, totalCardLimit = 20) {
        // Get cards that are due
        let dueCards = this.getDueCards();
        
        // Separate into new and review cards
        const newCards = dueCards.filter(card => card.repetitions === 0);
        const reviewCards = dueCards.filter(card => card.repetitions > 0);
        
        // Limit number of new cards
        const selectedNewCards = newCards.slice(0, newCardLimit);
        // Fill the rest with review cards
        const selectedReviewCards = reviewCards.slice(0, totalCardLimit - selectedNewCards.length);
        
        // Combine and shuffle
        this.currentSession = [...selectedNewCards, ...selectedReviewCards]
            .map(card => ({
                ...card,
                answered: false,
                quality: null
            }));
        
        // Shuffle cards
        this.shuffleSession();
        
        this.sessionInProgress = true;
        
        return {
            totalCards: this.currentSession.length,
            newCards: selectedNewCards.length,
            reviewCards: selectedReviewCards.length
        };
    }
    
    /**
     * Shuffle the current session cards
     */
    shuffleSession() {
        // Fisher-Yates shuffle
        for (let i = this.currentSession.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentSession[i], this.currentSession[j]] = [this.currentSession[j], this.currentSession[i]];
        }
    }
    
    /**
     * Get the next card in the session
     */
    getNextCard() {
        // Find first unanswered card
        const nextCard = this.currentSession.find(card => !card.answered);
        return nextCard || null;
    }
    
    /**
     * Update a card in the current session with response quality
     * @param {string} cardId - ID of the card
     * @param {number} quality - Quality of response (0-5)
     */
    updateSessionCard(cardId, quality) {
        const cardIndex = this.currentSession.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            this.currentSession[cardIndex].answered = true;
            this.currentSession[cardIndex].quality = quality;
        }
    }
    
    /**
     * End the current session and return stats
     */
    endSession() {
        if (!this.sessionInProgress) {
            return { message: 'No active session' };
        }
        
        const stats = {
            totalCards: this.currentSession.length,
            cardsCompleted: this.currentSession.filter(card => card.answered).length,
            averageQuality: 0
        };
        
        // Calculate average quality
        const completedCards = this.currentSession.filter(card => card.answered);
        if (completedCards.length > 0) {
            const totalQuality = completedCards.reduce((sum, card) => sum + card.quality, 0);
            stats.averageQuality = totalQuality / completedCards.length;
        }
        
        this.sessionInProgress = false;
        this.currentSession = [];
        
        return stats;
    }
    
    /**
     * Get statistics about the spaced repetition system
     */
    getStats() {
        const totalCards = Object.keys(this.cards).length;
        const cardsWithRepetitions = Object.values(this.cards).filter(card => card.repetitions > 0).length;
        const masteredCards = Object.values(this.cards).filter(card => card.interval >= 30).length;
        
        const now = new Date();
        const dueCards = Object.values(this.cards).filter(card => new Date(card.dueDate) <= now).length;
        
        return {
            totalCards,
            cardsWithRepetitions,
            masteredCards,
            dueCards
        };
    }
    
    /**
     * Create and display the spaced repetition study UI
     */
    showStudyInterface() {
        // Start a new session
        const sessionInfo = this.startSession();
        
        if (sessionInfo.totalCards === 0) {
            showFeedback('No cards available for study at this time. Check back later or add more signs to your practice list.', 'info');
            return;
        }
        
        // Create modal for study session
        const modalElement = document.createElement('div');
        modalElement.className = 'modal fade';
        modalElement.id = 'srsStudyModal';
        modalElement.setAttribute('tabindex', '-1');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.setAttribute('data-bs-backdrop', 'static');
        
        modalElement.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Practice Session</h5>
                        <div class="session-progress ms-3">
                            <span id="current-card">1</span>/<span id="total-cards">${sessionInfo.totalCards}</span>
                        </div>
                        <button type="button" class="btn-close" id="end-session-btn" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="study-container">
                            <div id="card-question" class="card-section">
                                <div class="text-center mb-4">
                                    <h3 id="card-word" class="mb-3"></h3>
                                    <span class="badge mb-2" id="card-category"></span>
                                </div>
                                
                                <div class="sign-video-container text-center">
                                    <video id="card-video" class="sign-video" controls loop>
                                        <source src="" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                            
                            <div id="card-answer" class="card-section mt-4" style="display: none;">
                                <h4 class="text-center mb-3">How well did you recall this sign?</h4>
                                
                                <div class="rating-buttons">
                                    <button class="btn btn-outline-danger rating-btn" data-quality="0">
                                        <span class="rating-number">0</span>
                                        <span class="rating-text">Failed<br>Completely</span>
                                    </button>
                                    <button class="btn btn-outline-danger rating-btn" data-quality="1">
                                        <span class="rating-number">1</span>
                                        <span class="rating-text">Failed<br>Mostly</span>
                                    </button>
                                    <button class="btn btn-outline-warning rating-btn" data-quality="2">
                                        <span class="rating-number">2</span>
                                        <span class="rating-text">Failed<br>Partially</span>
                                    </button>
                                    <button class="btn btn-outline-warning rating-btn" data-quality="3">
                                        <span class="rating-number">3</span>
                                        <span class="rating-text">Difficult<br>Recall</span>
                                    </button>
                                    <button class="btn btn-outline-success rating-btn" data-quality="4">
                                        <span class="rating-number">4</span>
                                        <span class="rating-text">Good<br>Recall</span>
                                    </button>
                                    <button class="btn btn-outline-success rating-btn" data-quality="5">
                                        <span class="rating-number">5</span>
                                        <span class="rating-text">Perfect<br>Recall</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="session-complete" style="display: none;">
                            <div class="text-center py-4">
                                <div class="mb-4">
                                    <i class="fas fa-check-circle fa-5x text-success mb-3"></i>
                                    <h3>Practice Session Complete!</h3>
                                </div>
                                
                                <div class="session-stats">
                                    <div class="session-stat">
                                        <span class="stat-value" id="cards-studied">0</span>
                                        <span class="stat-label">Cards Studied</span>
                                    </div>
                                    <div class="session-stat">
                                        <span class="stat-value" id="cards-learned">0</span>
                                        <span class="stat-label">Signs Learned</span>
                                    </div>
                                    <div class="session-stat">
                                        <span class="stat-value" id="avg-rating">0.0</span>
                                        <span class="stat-label">Avg. Rating</span>
                                    </div>
                                </div>
                                
                                <div class="next-review mt-4">
                                    <h5>Next review session will be available:</h5>
                                    <p id="next-review-time">Tomorrow</p>
                                </div>
                                
                                <div class="mt-4">
                                    <button class="btn btn-primary btn-lg" data-bs-dismiss="modal">
                                        <i class="fas fa-check"></i> Finish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="show-answer-btn">Show Answer</button>
                        <button type="button" class="btn btn-primary" id="next-card-btn" style="display: none;">Next Card</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalElement);
        
        // Initialize modal and show it
        const studyModal = new bootstrap.Modal(modalElement);
        studyModal.show();
        
        // Track current card index
        let currentCardIndex = 0;
        let currentCard = null;
        
        // Function to load the current card
        const loadCurrentCard = () => {
            // Update progress counter
            document.getElementById('current-card').textContent = currentCardIndex + 1;
            
            // Get the next card
            currentCard = this.getNextCard();
            
            if (!currentCard) {
                // No more cards, show the completion screen
                document.getElementById('study-container').style.display = 'none';
                document.getElementById('session-complete').style.display = 'block';
                document.getElementById('show-answer-btn').style.display = 'none';
                document.getElementById('next-card-btn').style.display = 'none';
                
                // Update stats
                const stats = this.endSession();
                document.getElementById('cards-studied').textContent = stats.cardsCompleted;
                document.getElementById('cards-learned').textContent = stats.cardsCompleted;
                document.getElementById('avg-rating').textContent = stats.averageQuality.toFixed(1);
                
                return;
            }
            
            // Reset the UI for a new card
            document.getElementById('card-answer').style.display = 'none';
            document.getElementById('show-answer-btn').style.display = 'block';
            document.getElementById('next-card-btn').style.display = 'none';
            
            // Update card content
            document.getElementById('card-word').textContent = currentCard.word;
            
            // Set category badge
            const categoryBadge = document.getElementById('card-category');
            categoryBadge.textContent = currentCard.category;
            categoryBadge.className = `badge badge-${currentCard.category.toLowerCase().replace(' ', '-')}`;
            
            // Set video source
            const videoPath = `/static/videos/sign_language/${currentCard.word.toLowerCase()}.mp4`;
            const videoElement = document.getElementById('card-video');
            videoElement.querySelector('source').src = videoPath;
            videoElement.load();
            
            // Reset rating buttons
            document.querySelectorAll('.rating-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        };
        
        // Load the first card
        loadCurrentCard();
        
        // Event handlers
        document.getElementById('show-answer-btn').addEventListener('click', () => {
            document.getElementById('card-answer').style.display = 'block';
            document.getElementById('show-answer-btn').style.display = 'none';
        });
        
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Highlight the selected button
                document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Get the quality rating (0-5)
                const quality = parseInt(btn.getAttribute('data-quality'));
                
                // Process the review
                this.processReview(currentCard.id, quality);
                
                // Show the next button
                document.getElementById('next-card-btn').style.display = 'block';
            });
        });
        
        document.getElementById('next-card-btn').addEventListener('click', () => {
            currentCardIndex++;
            loadCurrentCard();
        });
        
        // End session handler
        document.getElementById('end-session-btn').addEventListener('click', () => {
            if (confirm('End this study session? Your progress will be saved.')) {
                this.endSession();
                studyModal.hide();
            }
        });
        
        // Cleanup when modal is closed
        modalElement.addEventListener('hidden.bs.modal', () => {
            this.endSession();
            modalElement.remove();
        });
    }
}

// Initialize spaced repetition system
document.addEventListener('DOMContentLoaded', () => {
    window.srs = new SpacedRepetitionSystem();
    
    // Add SRS button to user interface
    const userControls = document.querySelector('.accessibility-controls .container');
    if (userControls) {
        const srsButton = document.createElement('button');
        srsButton.className = 'btn btn-sm btn-outline-success me-2';
        srsButton.innerHTML = '<i class="fas fa-graduation-cap me-1"></i> Practice Mode';
        srsButton.addEventListener('click', () => {
            window.srs.showStudyInterface();
        });
        
        userControls.appendChild(srsButton);
    }
    
    // Add SRS exercise buttons to each exercise
    document.querySelectorAll('.exercise-item').forEach(item => {
        const categoryElement = item.closest('[data-category]') || item.closest('[id]');
        const wordElement = item.querySelector('.exercise-name span') || item;
        
        let category = '';
        if (categoryElement) {
            category = categoryElement.dataset.category || categoryElement.id;
        }
        
        let word = '';
        if (wordElement.textContent) {
            word = wordElement.textContent.trim();
        }
        
        if (category && word) {
            // Add the sign to the SRS system
            window.srs.addCard(category, word);
            
            // Add a button to add to practice
            const actionsContainer = item.querySelector('a').parentNode;
            const practiceButton = document.createElement('button');
            practiceButton.className = 'btn btn-sm btn-outline-success ms-2';
            practiceButton.innerHTML = '<i class="fas fa-plus"></i>';
            practiceButton.title = 'Add to practice';
            practiceButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.srs.addCard(category, word);
                showFeedback(`Added "${word}" to your practice deck!`, 'success');
            });
            
            actionsContainer.appendChild(practiceButton);
        }
    });
});

// Add CSS for spaced repetition interface
const srsStyles = document.createElement('style');
srsStyles.textContent = `
    /* Spaced Repetition System Styles */
    .session-progress {
        background-color: #f8f9fc;
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
        font-weight: 600;
        color: #4e73df;
    }
    
    .card-section {
        padding: 1.5rem;
        border-radius: 0.35rem;
        background-color: white;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.05);
    }
    
    .sign-video-container {
        margin: 1rem auto;
        max-width: 400px;
    }
    
    .sign-video {
        width: 100%;
        border-radius: 0.35rem;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
    }
    
    .rating-buttons {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        margin: 1rem 0;
    }
    
    .rating-btn {
        flex: 1;
        min-width: 70px;
        margin: 0.25rem;
        padding: 0.5rem;
        text-align: center;
        border-radius: 0.35rem;
        transition: all 0.3s ease;
    }
    
    .rating-btn:hover {
        transform: translateY(-2px);
    }
    
    .rating-btn.active {
        transform: translateY(-3px);
        font-weight: 600;
    }
    
    .rating-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
    }
    
    .rating-text {
        display: block;
        font-size: 0.8rem;
        line-height: 1.2;
    }
    
    .session-stats {
        display: flex;
        justify-content: center;
        margin: 1.5rem 0;
    }
    
    .session-stat {
        text-align: center;
        padding: 0.75rem 1.5rem;
        background-color: #f8f9fc;
        border-radius: 0.35rem;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        margin: 0 0.75rem;
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 768px) {
        .rating-buttons {
            flex-direction: column;
        }
        
        .rating-btn {
            flex: none;
            margin: 0.25rem 0;
        }
        
        .session-stats {
            flex-direction: column;
        }
        
        .session-stat {
            margin: 0.5rem 0;
        }
    }
`;
document.head.appendChild(srsStyles);