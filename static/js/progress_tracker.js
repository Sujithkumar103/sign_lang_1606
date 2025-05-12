/**
 * Progress Tracking System for Sign Language Learning
 */

class ProgressTracker {
    constructor() {
        this.storageKey = 'sign_language_progress';
        this.progress = this.loadProgress();
        this.initializeEvents();
    }
    
    /**
     * Load user progress from localStorage
     */
    loadProgress() {
        const savedProgress = localStorage.getItem(this.storageKey);
        if (savedProgress) {
            return JSON.parse(savedProgress);
        } else {
            // Initialize with default structure
            return {
                categories: {},
                totalPracticed: 0,
                totalMastered: 0,
                lastSession: null,
                sessions: [],
                achievements: []
            };
        }
    }
    
    /**
     * Save progress to localStorage
     */
    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }
    
    /**
     * Record a completed exercise
     * @param {string} category - Exercise category
     * @param {string} word - The word practiced
     * @param {boolean} completed - Whether exercise was completed successfully
     */
    recordPractice(category, word, completed = true) {
        // Initialize category if it doesn't exist
        if (!this.progress.categories[category]) {
            this.progress.categories[category] = {
                practiced: 0,
                mastered: 0,
                words: {}
            };
        }
        
        // Initialize word if it doesn't exist
        if (!this.progress.categories[category].words[word]) {
            this.progress.categories[category].words[word] = {
                timesPracticed: 0,
                lastPracticed: null,
                mastered: false,
                masteryProgress: 0
            };
        }
        
        const wordData = this.progress.categories[category].words[word];
        
        // Update word data
        wordData.timesPracticed++;
        wordData.lastPracticed = new Date().toISOString();
        
        // Update mastery progress (needs 5 successful practices to master)
        if (completed) {
            if (!wordData.mastered) {
                wordData.masteryProgress++;
                
                // Check if word is now mastered
                if (wordData.masteryProgress >= 5) {
                    wordData.mastered = true;
                    this.progress.categories[category].mastered++;
                    this.progress.totalMastered++;
                    
                    // Add achievement for mastering a word
                    this.progress.achievements.push({
                        type: 'mastery',
                        category,
                        word,
                        date: new Date().toISOString()
                    });
                    
                    // Show achievement notification
                    this.showMasteryAchievement(category, word);
                }
            }
        } else {
            // If practice was not successful, reduce mastery progress
            if (!wordData.mastered && wordData.masteryProgress > 0) {
                wordData.masteryProgress--;
            }
        }
        
        // Update category counts
        this.progress.categories[category].practiced = Object.keys(this.progress.categories[category].words).length;
        
        // Update total counts
        this.progress.totalPracticed = Object.values(this.progress.categories).reduce((sum, cat) => sum + cat.practiced, 0);
        
        // Record session data
        if (!this.progress.lastSession || new Date(this.progress.lastSession.date).toDateString() !== new Date().toDateString()) {
            // New day, new session
            this.progress.sessions.push({
                date: new Date().toISOString(),
                wordsPracticed: [{ category, word }]
            });
        } else {
            // Add to current session
            const currentSession = this.progress.sessions[this.progress.sessions.length - 1];
            if (!currentSession.wordsPracticed.some(w => w.word === word && w.category === category)) {
                currentSession.wordsPracticed.push({ category, word });
            }
        }
        
        // Set last session
        this.progress.lastSession = {
            date: new Date().toISOString(),
            category,
            word
        };
        
        // Save progress
        this.saveProgress();
        
        // Update UI
        this.updateProgressUI();
        
        return wordData;
    }
    
    /**
     * Clear all progress data
     */
    resetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
            this.progress = {
                categories: {},
                totalPracticed: 0,
                totalMastered: 0,
                lastSession: null,
                sessions: [],
                achievements: []
            };
            
            this.saveProgress();
            this.updateProgressUI();
            
            // Show confirmation
            const feedbackMessage = 'All progress has been reset.';
            if (typeof showFeedback === 'function') {
                showFeedback(feedbackMessage, 'info');
            } else {
                alert(feedbackMessage);
            }
        }
    }
    
    /**
     * Show achievement notification when a sign is mastered
     */
    showMasteryAchievement(category, word) {
        const achievementToast = document.createElement('div');
        achievementToast.className = 'achievement-toast';
        achievementToast.innerHTML = `
            <div class="achievement-icon">
                <i class="fas fa-star"></i>
            </div>
            <div class="achievement-content">
                <h4>Achievement Unlocked!</h4>
                <p>You've mastered the sign for <strong>${word}</strong> in ${category}!</p>
            </div>
            <button class="achievement-close">&times;</button>
        `;
        
        document.body.appendChild(achievementToast);
        
        // Add close button functionality
        achievementToast.querySelector('.achievement-close').addEventListener('click', function() {
            achievementToast.classList.add('achievement-toast-hiding');
            setTimeout(() => {
                document.body.removeChild(achievementToast);
            }, 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            achievementToast.classList.add('achievement-toast-hiding');
            setTimeout(() => {
                if (document.body.contains(achievementToast)) {
                    document.body.removeChild(achievementToast);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Update UI elements with progress data
     */
    updateProgressUI() {
        // Check if we're on the exercises page
        const exercisesContainer = document.querySelector('.exercises-container');
        if (exercisesContainer) {
            this.updateExercisesProgress();
        }
        
        // Always update the progress summary if it exists
        this.updateProgressSummary();
    }
    
    /**
     * Update exercise items with progress indicators
     */
    updateExercisesProgress() {
        const exerciseItems = document.querySelectorAll('.exercise-item');
        
        exerciseItems.forEach(item => {
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
            
            if (category && word && this.progress.categories[category] && this.progress.categories[category].words[word]) {
                const wordData = this.progress.categories[category].words[word];
                
                // Add or update progress indicator
                let progressIndicator = item.querySelector('.progress-indicator');
                if (!progressIndicator) {
                    progressIndicator = document.createElement('div');
                    progressIndicator.className = 'progress-indicator';
                    item.appendChild(progressIndicator);
                }
                
                // Update progress indicator content
                if (wordData.mastered) {
                    progressIndicator.innerHTML = '<i class="fas fa-star text-warning" title="Mastered"></i>';
                    progressIndicator.className = 'progress-indicator mastered';
                } else if (wordData.masteryProgress > 0) {
                    progressIndicator.innerHTML = `<span title="Progress: ${wordData.masteryProgress}/5">${wordData.masteryProgress}/5</span>`;
                    progressIndicator.className = 'progress-indicator in-progress';
                } else {
                    progressIndicator.innerHTML = '<i class="fas fa-circle text-secondary" title="Not Started"></i>';
                    progressIndicator.className = 'progress-indicator not-started';
                }
            }
        });
    }
    
    /**
     * Update progress summary section
     */
    updateProgressSummary() {
        const progressSummary = document.getElementById('progress-summary');
        
        if (!progressSummary) {
            // Create progress summary if it doesn't exist and we're on the exercises page
            const exercisesContainer = document.querySelector('.exercises-container');
            if (exercisesContainer) {
                this.createProgressSummary(exercisesContainer);
            }
            return;
        }
        
        // Update summary content
        const totalWords = this.progress.totalPracticed;
        const masteredWords = this.progress.totalMastered;
        const masteryPercentage = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
        
        // Get streak information
        const streak = this.calculateStreak();
        
        // Update summary statistics
        progressSummary.querySelector('#total-practiced').textContent = totalWords;
        progressSummary.querySelector('#total-mastered').textContent = masteredWords;
        progressSummary.querySelector('#mastery-percentage').textContent = `${masteryPercentage}%`;
        progressSummary.querySelector('#current-streak').textContent = streak;
        
        // Update progress bars
        const categoryProgressContainer = progressSummary.querySelector('#category-progress');
        categoryProgressContainer.innerHTML = '';
        
        // Add progress bars for each category
        Object.entries(this.progress.categories).forEach(([category, data]) => {
            const categoryProgress = document.createElement('div');
            categoryProgress.className = 'category-progress-item';
            
            const masteryPercentage = data.practiced > 0 ? Math.round((data.mastered / data.practiced) * 100) : 0;
            
            categoryProgress.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span class="category-name">${category}</span>
                    <span class="category-stats">${data.mastered}/${data.practiced} (${masteryPercentage}%)</span>
                </div>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${masteryPercentage}%"
                        aria-valuenow="${masteryPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            `;
            
            categoryProgressContainer.appendChild(categoryProgress);
        });
        
        // Update recent achievements
        const recentAchievements = progressSummary.querySelector('#recent-achievements');
        recentAchievements.innerHTML = '';
        
        const achievements = [...this.progress.achievements].reverse().slice(0, 5);
        
        if (achievements.length === 0) {
            recentAchievements.innerHTML = '<p class="text-muted">No achievements yet. Keep practicing!</p>';
        } else {
            achievements.forEach(achievement => {
                const achievementItem = document.createElement('div');
                achievementItem.className = 'achievement-item';
                
                const date = new Date(achievement.date);
                const formattedDate = date.toLocaleDateString();
                
                achievementItem.innerHTML = `
                    <div class="achievement-icon">
                        <i class="fas fa-star text-warning"></i>
                    </div>
                    <div class="achievement-details">
                        <div class="achievement-title">Mastered "${achievement.word}"</div>
                        <div class="achievement-category">${achievement.category}</div>
                        <div class="achievement-date">${formattedDate}</div>
                    </div>
                `;
                
                recentAchievements.appendChild(achievementItem);
            });
        }
    }
    
    /**
     * Create the progress summary section
     */
    createProgressSummary(container) {
        const progressSummary = document.createElement('div');
        progressSummary.id = 'progress-summary';
        progressSummary.className = 'card shadow-sm mb-4';
        
        progressSummary.innerHTML = `
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Your Learning Progress</h5>
                <button id="reset-progress-btn" class="btn btn-sm btn-outline-light">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="progress-stats">
                            <div class="row">
                                <div class="col-6 col-md-3 mb-3">
                                    <div class="progress-stat-item">
                                        <div class="stat-value" id="total-practiced">0</div>
                                        <div class="stat-label">Signs Practiced</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-3">
                                    <div class="progress-stat-item">
                                        <div class="stat-value" id="total-mastered">0</div>
                                        <div class="stat-label">Signs Mastered</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-3">
                                    <div class="progress-stat-item">
                                        <div class="stat-value" id="mastery-percentage">0%</div>
                                        <div class="stat-label">Mastery Rate</div>
                                    </div>
                                </div>
                                <div class="col-6 col-md-3 mb-3">
                                    <div class="progress-stat-item">
                                        <div class="stat-value" id="current-streak">0</div>
                                        <div class="stat-label">Day Streak</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="mt-4 mb-3">Category Progress</h6>
                        <div id="category-progress"></div>
                    </div>
                    
                    <div class="col-md-4">
                        <h6 class="mb-3">Recent Achievements</h6>
                        <div id="recent-achievements"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert at the top of the container
        container.prepend(progressSummary);
        
        // Add event listeners
        progressSummary.querySelector('#reset-progress-btn').addEventListener('click', () => {
            this.resetProgress();
        });
        
        // Update with current data
        this.updateProgressSummary();
    }
    
    /**
     * Calculate the user's current day streak
     */
    calculateStreak() {
        if (!this.progress.sessions || this.progress.sessions.length === 0) {
            return 0;
        }
        
        // Sort sessions by date (newest first)
        const sortedSessions = [...this.progress.sessions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        // Check if there's a session today
        const today = new Date().toDateString();
        const lastSessionDate = new Date(sortedSessions[0].date).toDateString();
        const hasSessionToday = today === lastSessionDate;
        
        if (!hasSessionToday) {
            // Check if there was a session yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toDateString();
            
            if (yesterdayString !== lastSessionDate) {
                // Streak broken - no session today or yesterday
                return 0;
            }
        }
        
        // Count consecutive days with sessions
        let streak = hasSessionToday ? 1 : 0;
        
        // Group sessions by date
        const sessionsByDate = {};
        sortedSessions.forEach(session => {
            const dateString = new Date(session.date).toDateString();
            sessionsByDate[dateString] = true;
        });
        
        // Start from today or yesterday depending on if there's a session today
        const checkDate = new Date();
        if (!hasSessionToday) {
            checkDate.setDate(checkDate.getDate() - 1);
        }
        
        // Check consecutive days
        let checking = true;
        while (checking) {
            checkDate.setDate(checkDate.getDate() - 1);
            const dateString = checkDate.toDateString();
            
            if (sessionsByDate[dateString]) {
                streak++;
            } else {
                checking = false;
            }
        }
        
        return streak;
    }
    
    /**
     * Generate and display a progress report
     */
    generateProgressReport() {
        // Create a modal to display the report
        const reportModal = document.createElement('div');
        reportModal.className = 'modal fade';
        reportModal.id = 'progressReportModal';
        reportModal.setAttribute('tabindex', '-1');
        reportModal.setAttribute('aria-hidden', 'true');
        
        // Calculate statistics
        const totalPracticed = this.progress.totalPracticed;
        const totalMastered = this.progress.totalMastered;
        const masteryRate = totalPracticed > 0 ? Math.round((totalMastered / totalPracticed) * 100) : 0;
        const streak = this.calculateStreak();
        
        // Get most practiced categories
        const categoriesArray = Object.entries(this.progress.categories).map(([name, data]) => ({
            name,
            practiced: data.practiced,
            mastered: data.mastered,
            masteryRate: data.practiced > 0 ? Math.round((data.mastered / data.practiced) * 100) : 0
        }));
        
        categoriesArray.sort((a, b) => b.practiced - a.practiced);
        const topCategories = categoriesArray.slice(0, 3);
        
        // Get most practiced words
        const allWords = [];
        Object.entries(this.progress.categories).forEach(([category, data]) => {
            Object.entries(data.words).forEach(([word, wordData]) => {
                allWords.push({
                    category,
                    word,
                    timesPracticed: wordData.timesPracticed,
                    mastered: wordData.mastered,
                    masteryProgress: wordData.masteryProgress
                });
            });
        });
        
        allWords.sort((a, b) => b.timesPracticed - a.timesPracticed);
        const topWords = allWords.slice(0, 5);
        
        // Calculate practice frequency
        const sessionDates = {};
        this.progress.sessions.forEach(session => {
            const dateString = new Date(session.date).toLocaleDateString();
            if (sessionDates[dateString]) {
                sessionDates[dateString] += session.wordsPracticed.length;
            } else {
                sessionDates[dateString] = session.wordsPracticed.length;
            }
        });
        
        const practiceFrequency = Object.entries(sessionDates).map(([date, count]) => ({
            date,
            count
        }));
        
        practiceFrequency.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivity = practiceFrequency.slice(0, 7);
        
        reportModal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Your Progress Report</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="report-section">
                                    <h4>Overall Progress</h4>
                                    <div class="report-stats">
                                        <div class="report-stat-item">
                                            <div class="stat-value">${totalPracticed}</div>
                                            <div class="stat-label">Signs Practiced</div>
                                        </div>
                                        <div class="report-stat-item">
                                            <div class="stat-value">${totalMastered}</div>
                                            <div class="stat-label">Signs Mastered</div>
                                        </div>
                                        <div class="report-stat-item">
                                            <div class="stat-value">${masteryRate}%</div>
                                            <div class="stat-label">Mastery Rate</div>
                                        </div>
                                        <div class="report-stat-item">
                                            <div class="stat-value">${streak}</div>
                                            <div class="stat-label">Day Streak</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="report-section">
                                    <h4>Top Categories</h4>
                                    <div class="report-top-categories">
                                        ${topCategories.length === 0 ? 
                                            '<p class="text-muted">No categories practiced yet.</p>' : 
                                            topCategories.map(category => `
                                                <div class="top-category-item">
                                                    <div class="category-name">${category.name}</div>
                                                    <div class="category-stats">${category.mastered}/${category.practiced} signs (${category.masteryRate}%)</div>
                                                    <div class="progress" style="height: 8px;">
                                                        <div class="progress-bar bg-success" role="progressbar" style="width: ${category.masteryRate}%"
                                                            aria-valuenow="${category.masteryRate}" aria-valuemin="0" aria-valuemax="100"></div>
                                                    </div>
                                                </div>
                                            `).join('')
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="report-section">
                                    <h4>Most Practiced Signs</h4>
                                    <div class="report-top-words">
                                        ${topWords.length === 0 ? 
                                            '<p class="text-muted">No signs practiced yet.</p>' : 
                                            `<div class="table-responsive">
                                                <table class="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Sign</th>
                                                            <th>Category</th>
                                                            <th>Practices</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${topWords.map(word => `
                                                            <tr>
                                                                <td>${word.word}</td>
                                                                <td>${word.category}</td>
                                                                <td>${word.timesPracticed}</td>
                                                                <td>${word.mastered ? 
                                                                    '<span class="badge bg-success">Mastered</span>' : 
                                                                    `<span class="badge bg-warning text-dark">Progress: ${word.masteryProgress}/5</span>`
                                                                }</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>`
                                        }
                                    </div>
                                </div>
                                
                                <div class="report-section">
                                    <h4>Recent Activity</h4>
                                    <div class="report-recent-activity">
                                        ${recentActivity.length === 0 ? 
                                            '<p class="text-muted">No recent activity.</p>' : 
                                            `<div class="table-responsive">
                                                <table class="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Signs Practiced</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${recentActivity.map(activity => `
                                                            <tr>
                                                                <td>${activity.date}</td>
                                                                <td>${activity.count}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="downloadReportBtn">
                            <i class="fas fa-download me-1"></i> Download Report
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(reportModal);
        
        // Initialize the modal
        const modal = new bootstrap.Modal(reportModal);
        modal.show();
        
        // Add event listener for downloading report
        document.getElementById('downloadReportBtn').addEventListener('click', () => {
            // Create a simple text report
            let reportText = 'SIGN LANGUAGE LEARNING PROGRESS REPORT\n';
            reportText += '=====================================\n\n';
            reportText += `Generated: ${new Date().toLocaleString()}\n\n`;
            reportText += 'OVERALL PROGRESS\n';
            reportText += '-----------------\n';
            reportText += `Signs Practiced: ${totalPracticed}\n`;
            reportText += `Signs Mastered: ${totalMastered}\n`;
            reportText += `Mastery Rate: ${masteryRate}%\n`;
            reportText += `Day Streak: ${streak}\n\n`;
            
            reportText += 'TOP CATEGORIES\n';
            reportText += '--------------\n';
            topCategories.forEach(category => {
                reportText += `${category.name}: ${category.mastered}/${category.practiced} signs (${category.masteryRate}%)\n`;
            });
            reportText += '\n';
            
            reportText += 'MOST PRACTICED SIGNS\n';
            reportText += '-------------------\n';
            topWords.forEach(word => {
                reportText += `${word.word} (${word.category}): Practiced ${word.timesPracticed} times, ${word.mastered ? 'Mastered' : `Progress: ${word.masteryProgress}/5`}\n`;
            });
            reportText += '\n';
            
            reportText += 'RECENT ACTIVITY\n';
            reportText += '---------------\n';
            recentActivity.forEach(activity => {
                reportText += `${activity.date}: ${activity.count} signs practiced\n`;
            });
            
            // Create a download link
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
            element.setAttribute('download', 'sign_language_progress_report.txt');
            element.style.display = 'none';
            
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
        
        // Remove modal from DOM when it's closed
        reportModal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(reportModal);
        });
    }
    
    /**
     * Initialize event listeners
     */
    initializeEvents() {
        // Listen for exercise click events
        document.addEventListener('click', (e) => {
            // Check if clicked element is an exercise link
            const exerciseLink = e.target.closest('.exercise-item a');
            if (exerciseLink) {
                const exerciseItem = exerciseLink.closest('.exercise-item');
                const categoryElement = exerciseItem.closest('[data-category]') || exerciseItem.closest('[id]');
                const wordElement = exerciseItem.querySelector('.exercise-name span') || exerciseItem;
                
                let category = '';
                if (categoryElement) {
                    category = categoryElement.dataset.category || categoryElement.id;
                }
                
                let word = '';
                if (wordElement.textContent) {
                    word = wordElement.textContent.trim();
                }
                
                if (category && word) {
                    // Record the practice
                    this.recordPractice(category, word);
                }
            }
        });
    }
}

// Create and add styles for the progress tracker
const progressStyles = document.createElement('style');
progressStyles.textContent = `
    /* Progress Tracker Styles */
    .progress-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        background-color: #f8f9fc;
        border: 1px solid #e3e6f0;
    }
    
    .progress-indicator.mastered {
        background-color: #f6e58d;
        border-color: #f0c419;
    }
    
    .progress-indicator.in-progress {
        background-color: #7bed9f;
        border-color: #2ed573;
        color: #2d3436;
    }
    
    /* Achievement Toast */
    .achievement-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        padding: 15px;
        display: flex;
        align-items: center;
        width: 300px;
        z-index: 1100;
        animation: achievementSlideIn 0.3s ease-out;
    }
    
    .achievement-toast-hiding {
        animation: achievementSlideOut 0.3s ease-in forwards;
    }
    
    .achievement-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #f6e58d;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        flex-shrink: 0;
    }
    
    .achievement-icon i {
        color: #f0c419;
        font-size: 20px;
    }
    
    .achievement-content {
        flex-grow: 1;
    }
    
    .achievement-content h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }
    
    .achievement-content p {
        margin: 5px 0 0 0;
        font-size: 14px;
    }
    
    .achievement-close {
        background: none;
        border: none;
        font-size: 20px;
        line-height: 1;
        padding: 0;
        margin-left: 10px;
        cursor: pointer;
        color: #718093;
    }
    
    /* Progress Summary */
    #progress-summary {
        margin-bottom: 30px;
    }
    
    .progress-stats {
        padding: 15px 0;
    }
    
    .progress-stat-item {
        text-align: center;
        padding: 10px;
        background-color: #f8f9fc;
        border-radius: 5px;
        height: 100%;
    }
    
    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #4e73df;
    }
    
    .stat-label {
        font-size: 12px;
        color: #5a5c69;
        margin-top: 5px;
    }
    
    .category-progress-item {
        margin-bottom: 15px;
    }
    
    .category-name {
        font-weight: 600;
    }
    
    .category-stats {
        font-size: 12px;
        color: #5a5c69;
    }
    
    /* Achievements List */
    .achievement-item {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: #f8f9fc;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    
    .achievement-details {
        margin-left: 10px;
    }
    
    .achievement-title {
        font-weight: 600;
        font-size: 14px;
    }
    
    .achievement-category, .achievement-date {
        font-size: 12px;
        color: #5a5c69;
    }
    
    /* Progress Report */
    .report-section {
        margin-bottom: 30px;
    }
    
    .report-section h4 {
        margin-bottom: 15px;
        padding-bottom: 5px;
        border-bottom: 1px solid #e3e6f0;
    }
    
    .report-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .report-stat-item {
        text-align: center;
        padding: 15px;
        background-color: #f8f9fc;
        border-radius: 5px;
        flex: 1;
        min-width: calc(50% - 10px);
    }
    
    .top-category-item {
        padding: 10px;
        background-color: #f8f9fc;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    
    .top-category-item .category-name {
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .top-category-item .category-stats {
        font-size: 12px;
        margin-bottom: 5px;
    }
    
    /* Animations */
    @keyframes achievementSlideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes achievementSlideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(progressStyles);

// Initialize progress tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.progressTracker = new ProgressTracker();
    
    // Add progress report button to the exercises page
    const exercisesContainer = document.querySelector('.exercises-container');
    if (exercisesContainer) {
        const reportButton = document.createElement('button');
        reportButton.className = 'btn btn-primary mb-4';
        reportButton.innerHTML = '<i class="fas fa-chart-bar me-2"></i> View Progress Report';
        reportButton.addEventListener('click', () => {
            window.progressTracker.generateProgressReport();
        });
        
        // Add button after progress summary
        const progressSummary = document.getElementById('progress-summary');
        if (progressSummary) {
            progressSummary.insertAdjacentElement('afterend', reportButton);
        } else {
            exercisesContainer.prepend(reportButton);
        }
    }
});