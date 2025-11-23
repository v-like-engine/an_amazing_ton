/**
 * UI Controller - Manages all UI interactions and navigation
 * Integrates with Parser, Search, Timer, and Storage modules
 */

class UIController {
    constructor() {
        // State
        this.currentSection = 'timer';
        this.knowledgeBase = null;
        this.selectedTraining = null;
        this.tabataTimer = null;
        this.timerUI = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize UI
     */
    init() {
        this.bindNavigationEvents();
        this.bindUploadEvents();
        this.bindSearchEvents();
        this.bindTimerEvents();
        this.initializeTimer();

        // Check for saved data and show appropriate section
        this.checkForSavedData();

        // Show upload section if no data, otherwise show knowledge base
        if (this.knowledgeBase) {
            this.showSection('knowledge-base');
        } else {
            this.showSection('upload');
        }
    }

    /**
     * Bind navigation events
     */
    bindNavigationEvents() {
        // Desktop nav
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);

                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Bottom nav (mobile)
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);

                // Update active states
                bottomNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }

    /**
     * Show specific section
     */
    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => {
                targetSection.classList.add('active');
            }, 10);
        }

        this.currentSection = sectionName;

        // Update navigation active states
        document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
            if (link.dataset.section === sectionName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Bind file upload events
     */
    bindUploadEvents() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const btnUpload = document.getElementById('btn-upload');

        // Click to browse
        if (uploadArea && fileInput && btnUpload) {
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            btnUpload.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            // File selected
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');

                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        // Validate file type
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            this.showToast('Please upload an Excel file (.xlsx or .xls)', 'error');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            this.showToast('File too large. Maximum size is 10MB', 'error');
            return;
        }

        this.showLoadingState('Parsing your training file...');

        try {
            // Call Agent 1's parser (if available)
            if (typeof parseTrainingFile === 'function') {
                this.knowledgeBase = await parseTrainingFile(file);
                this.showToast('Training file loaded successfully!', 'success');
                this.populateKnowledgeBase();
                this.showSection('knowledge-base');

                // Save to storage (Agent 4)
                if (typeof saveToStorage === 'function') {
                    saveToStorage('knowledgeBase', this.knowledgeBase);
                }
            } else {
                console.warn('Parser not available yet');
                this.showToast('Parser module not loaded. This will be implemented by Agent 1.', 'warning');
            }
        } catch (error) {
            console.error('Error parsing file:', error);
            const userMessage = this.getUserFriendlyError(error.message);
            this.showToast(userMessage, 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Convert technical error messages to user-friendly ones
     */
    getUserFriendlyError(technicalError) {
        if (!technicalError) {
            return 'An unexpected error occurred. Please try again.';
        }

        const lowerError = technicalError.toLowerCase();

        // Map technical errors to user-friendly messages
        const errorMap = {
            'empty or contains no sheets': 'The Excel file is empty. Please upload a file with training data.',
            'first sheet is empty': 'The first sheet in your Excel file is empty. Please check the file.',
            'must contain at least 2 rows': 'Your Excel file needs at least a header row and one data row. Please check the file format.',
            'no training data found': 'We couldn\'t find any training data in your file. Please make sure it\'s formatted correctly with weeks and trainings.',
            'failed to read file': 'We couldn\'t read your file. It may be corrupted. Please try exporting it again.',
            'cannot read property': 'The file format seems incorrect. Please make sure it\'s a valid training plan Excel file.',
            'undefined': 'The file format seems incorrect. Please make sure it\'s a valid training plan Excel file.',
            'corrupt': 'The file appears to be corrupted. Please try exporting it again from Excel.',
            'invalid': 'The file format is not valid. Please upload a .xlsx or .xls file.'
        };

        // Find matching error message
        for (const [key, message] of Object.entries(errorMap)) {
            if (lowerError.includes(key)) {
                return message;
            }
        }

        // Default fallback message with hint
        return `We couldn't process your file. ${technicalError}. Please make sure it's a valid training plan Excel file.`;
    }

    /**
     * Populate knowledge base UI
     */
    populateKnowledgeBase() {
        if (!this.knowledgeBase) {
            return;
        }

        const weekList = document.getElementById('week-list');
        if (!weekList) return;

        weekList.innerHTML = '';

        // Group trainings by week
        const weekMap = new Map();

        if (this.knowledgeBase.trainings) {
            this.knowledgeBase.trainings.forEach((training, index) => {
                const weekKey = training.week || 'Week 1';
                if (!weekMap.has(weekKey)) {
                    weekMap.set(weekKey, []);
                }
                weekMap.get(weekKey).push({ training, index });
            });
        }

        // Create week items
        weekMap.forEach((trainings, weekName) => {
            const weekItem = document.createElement('div');
            weekItem.className = 'week-item';

            const weekHeader = document.createElement('div');
            weekHeader.className = 'week-header';
            weekHeader.innerHTML = `
                <h3>${weekName}</h3>
                <button class="expand-btn" aria-label="Expand week">
                    <i class="fas fa-chevron-down"></i>
                </button>
            `;

            const trainingList = document.createElement('div');
            trainingList.className = 'training-list';

            trainings.forEach(({ training, index }) => {
                const trainingItem = document.createElement('div');
                trainingItem.className = 'training-item';
                trainingItem.textContent = training.name || `Training ${index + 1}`;
                trainingItem.dataset.index = index;

                trainingItem.addEventListener('click', () => {
                    this.showTrainingDetail(training, index);
                });

                trainingList.appendChild(trainingItem);
            });

            weekHeader.addEventListener('click', () => {
                weekItem.classList.toggle('expanded');
            });

            weekItem.appendChild(weekHeader);
            weekItem.appendChild(trainingList);
            weekList.appendChild(weekItem);
        });

        // Expand first week
        const firstWeek = weekList.querySelector('.week-item');
        if (firstWeek) {
            firstWeek.classList.add('expanded');
        }
    }

    /**
     * Show training detail
     */
    showTrainingDetail(training, index) {
        this.selectedTraining = training;

        const trainingDetail = document.getElementById('training-detail');
        if (!trainingDetail) return;

        // Update active state
        document.querySelectorAll('.training-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.index) === index) {
                item.classList.add('active');
            }
        });

        // Build detail view
        let html = `
            <div class="training-header">
                <h1>${training.name || 'Training'}</h1>
                <div class="training-meta">
                    ${training.week ? `<span class="meta-item"><i class="fas fa-calendar"></i> ${training.week}</span>` : ''}
                    ${training.intensity ? `<span class="meta-item"><i class="fas fa-fire"></i> Intensity: ${training.intensity}%</span>` : ''}
                    ${training.totalExercises ? `<span class="meta-item"><i class="fas fa-list"></i> ${training.totalExercises} Exercises</span>` : ''}
                </div>
            </div>

            <div class="exercise-blocks">
        `;

        if (training.blocks && training.blocks.length > 0) {
            training.blocks.forEach(block => {
                html += `
                    <div class="block-card">
                        <h3 class="block-title">${block.name || 'Exercise Block'}</h3>
                        <div class="exercise-list">
                `;

                if (block.exercises && block.exercises.length > 0) {
                    block.exercises.forEach(exercise => {
                        html += `
                            <div class="exercise-item">
                                <div class="exercise-header">
                                    <span class="exercise-name">${exercise.name || 'Exercise'}</span>
                                    <span class="exercise-sets">${exercise.sets || ''}</span>
                                </div>
                                <div class="exercise-meta">
                                    ${exercise.setType ? `<span class="set-type">${exercise.setType}</span>` : ''}
                                    ${exercise.notes ? `<span class="exercise-notes">${exercise.notes}</span>` : ''}
                                </div>
                            </div>
                        `;
                    });
                }

                html += `
                        </div>
                    </div>
                `;
            });
        }

        html += '</div>';

        trainingDetail.innerHTML = html;
    }

    /**
     * Bind search events
     */
    bindSearchEvents() {
        const applyFilters = document.getElementById('apply-filters');
        const resetFilters = document.getElementById('reset-filters');
        const intensitySlider = document.getElementById('intensity-slider');
        const intensityValue = document.getElementById('intensity-value');

        // Intensity slider
        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                intensityValue.textContent = value === '0' ? 'Any' : value + '%';
            });
        }

        // Apply filters
        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applySearchFilters();
            });
        }

        // Reset filters
        if (resetFilters) {
            resetFilters.addEventListener('click', () => {
                this.resetSearchFilters();
            });
        }

        // Exercise autocomplete
        this.bindExerciseAutocomplete('include');
        this.bindExerciseAutocomplete('exclude');
    }

    /**
     * Bind exercise autocomplete
     */
    bindExerciseAutocomplete(type) {
        const input = document.getElementById(`${type}-exercises-input`);
        const dropdown = document.getElementById(`${type}-autocomplete`);
        const selected = document.getElementById(`${type}-selected`);

        if (!input || !dropdown || !selected) return;

        const selectedExercises = new Set();

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                dropdown.classList.remove('show');
                return;
            }

            // Search exercises (Agent 2's function)
            if (typeof searchExercises === 'function') {
                const results = searchExercises(query);
                this.showAutocompleteResults(dropdown, results, (exercise) => {
                    if (!selectedExercises.has(exercise)) {
                        selectedExercises.add(exercise);
                        this.addExerciseChip(selected, exercise, () => {
                            selectedExercises.delete(exercise);
                        });
                    }
                    input.value = '';
                    dropdown.classList.remove('show');
                });
            } else {
                // Mock data for now
                const mockExercises = ['Подтягивания', 'Отжимания', 'Приседания', 'Планка'];
                const filtered = mockExercises.filter(ex =>
                    ex.toLowerCase().includes(query.toLowerCase())
                );
                this.showAutocompleteResults(dropdown, filtered, (exercise) => {
                    if (!selectedExercises.has(exercise)) {
                        selectedExercises.add(exercise);
                        this.addExerciseChip(selected, exercise, () => {
                            selectedExercises.delete(exercise);
                        });
                    }
                    input.value = '';
                    dropdown.classList.remove('show');
                });
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    /**
     * Show autocomplete results
     */
    showAutocompleteResults(dropdown, results, onSelect) {
        if (results.length === 0) {
            dropdown.classList.remove('show');
            return;
        }

        dropdown.innerHTML = '';
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = result;
            item.addEventListener('click', () => onSelect(result));
            dropdown.appendChild(item);
        });

        dropdown.classList.add('show');
    }

    /**
     * Add exercise chip
     */
    addExerciseChip(container, exercise, onRemove) {
        const chip = document.createElement('span');
        chip.className = 'exercise-chip';
        chip.innerHTML = `
            ${exercise}
            <button class="chip-remove" aria-label="Remove ${exercise}">
                <i class="fas fa-times"></i>
            </button>
        `;

        const removeBtn = chip.querySelector('.chip-remove');
        removeBtn.addEventListener('click', () => {
            chip.remove();
            onRemove();
        });

        container.appendChild(chip);
    }

    /**
     * Apply search filters
     */
    applySearchFilters() {
        const filters = {
            includeExercises: this.getSelectedExercises('include'),
            excludeExercises: this.getSelectedExercises('exclude'),
            intensity: parseInt(document.getElementById('intensity-slider')?.value || 0),
            setType: document.getElementById('settype-filter')?.value || ''
        };

        this.showLoadingState('Searching...');

        try {
            // Call Agent 2's search function
            let results = [];
            if (typeof searchTrainings === 'function' && this.knowledgeBase) {
                results = searchTrainings(this.knowledgeBase, filters);
            } else {
                console.warn('Search function not available');
                this.showToast('Search module not yet implemented', 'warning');
            }

            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Error searching: ' + error.message, 'error');
        } finally {
            this.hideLoadingState();
        }
    }

    /**
     * Get selected exercises
     */
    getSelectedExercises(type) {
        const container = document.getElementById(`${type}-selected`);
        if (!container) return [];

        const chips = container.querySelectorAll('.exercise-chip');
        return Array.from(chips).map(chip => {
            return chip.textContent.trim().replace('×', '').trim();
        });
    }

    /**
     * Display search results
     */
    displaySearchResults(results) {
        const resultsGrid = document.getElementById('results-grid');
        const resultCount = document.getElementById('result-count');

        if (!resultsGrid) return;

        resultCount.textContent = `(${results.length})`;

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        resultsGrid.innerHTML = '';

        results.forEach((result, index) => {
            const card = document.createElement('div');
            card.className = 'result-card';

            const exercises = result.exercises || [];
            const exerciseChips = exercises.slice(0, 3).map(ex =>
                `<span class="exercise-chip">${ex}</span>`
            ).join('');
            const moreCount = exercises.length > 3 ? `<span class="exercise-chip">+${exercises.length - 3} more</span>` : '';

            card.innerHTML = `
                <div class="result-header">
                    <h3>${result.name || 'Training'}</h3>
                    ${result.intensity ? `<span class="intensity-badge">${result.intensity}%</span>` : ''}
                </div>
                <div class="result-exercises">
                    ${exerciseChips}
                    ${moreCount}
                </div>
                <button class="btn btn-sm btn-outline">View Details</button>
            `;

            card.addEventListener('click', () => {
                this.showTrainingDetail(result, index);
                this.showSection('knowledge-base');
            });

            resultsGrid.appendChild(card);
        });
    }

    /**
     * Reset search filters
     */
    resetSearchFilters() {
        document.getElementById('include-selected').innerHTML = '';
        document.getElementById('exclude-selected').innerHTML = '';
        document.getElementById('intensity-slider').value = 0;
        document.getElementById('intensity-value').textContent = 'Any';
        document.getElementById('settype-filter').value = '';
        document.getElementById('results-grid').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results yet</h3>
                <p>Apply filters to search for trainings</p>
            </div>
        `;
        document.getElementById('result-count').textContent = '(0)';
    }

    /**
     * Bind timer events
     */
    bindTimerEvents() {
        const applySettings = document.getElementById('apply-settings');
        const loadFromTraining = document.getElementById('load-from-training');

        if (applySettings) {
            applySettings.addEventListener('click', () => {
                this.applyTimerSettings();
            });
        }

        if (loadFromTraining) {
            loadFromTraining.addEventListener('click', () => {
                this.loadTimerFromTraining();
            });
        }
    }

    /**
     * Initialize timer
     */
    initializeTimer() {
        const config = {
            workDuration: 45,
            restDuration: 15,
            setsPerExercise: 3,
            restBetweenExercises: 60,
            exercises: ['Подтягивания', 'Отжимания', 'Приседания', 'Планка']
        };

        this.tabataTimer = new TabataTimer(config);
        this.timerUI = new TimerUI(this.tabataTimer);
    }

    /**
     * Apply timer settings
     */
    applyTimerSettings() {
        const workDuration = parseInt(document.getElementById('work-duration')?.value || 45);
        const restDuration = parseInt(document.getElementById('rest-duration')?.value || 15);
        const setsPerExercise = parseInt(document.getElementById('sets-per-exercise')?.value || 3);
        const exerciseRestDuration = parseInt(document.getElementById('exercise-rest-duration')?.value || 60);
        const exerciseList = document.getElementById('exercise-list')?.value || '';

        const exercises = exerciseList.split('\n')
            .map(ex => ex.trim())
            .filter(ex => ex.length > 0);

        if (exercises.length === 0) {
            this.showToast('Please enter at least one exercise', 'warning');
            return;
        }

        this.tabataTimer.updateConfig({
            workDuration,
            restDuration,
            setsPerExercise,
            restBetweenExercises: exerciseRestDuration,
            exercises
        });

        this.showToast('Timer settings updated!', 'success');
    }

    /**
     * Load timer from selected training
     */
    loadTimerFromTraining() {
        if (!this.selectedTraining) {
            this.showToast('Please select a training first', 'warning');
            return;
        }

        const exercises = [];
        if (this.selectedTraining.blocks) {
            this.selectedTraining.blocks.forEach(block => {
                if (block.exercises) {
                    block.exercises.forEach(ex => {
                        if (ex.name) {
                            exercises.push(ex.name);
                        }
                    });
                }
            });
        }

        if (exercises.length === 0) {
            this.showToast('No exercises found in selected training', 'warning');
            return;
        }

        document.getElementById('exercise-list').value = exercises.join('\n');
        this.applyTimerSettings();
        this.showToast(`Loaded ${exercises.length} exercises from training`, 'success');
    }

    /**
     * Check for saved data
     */
    checkForSavedData() {
        // Check if Agent 4's storage is available
        if (typeof loadFromStorage === 'function') {
            const savedKB = loadFromStorage('knowledgeBase');
            if (savedKB) {
                this.knowledgeBase = savedKB;
                this.populateKnowledgeBase();
                this.showToast('Previous training data loaded', 'info');
            }
        }
    }

    /**
     * Show loading state
     */
    showLoadingState(message) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const text = overlay.querySelector('p');
            if (text) {
                text.textContent = message;
            }
        }
    }

    /**
     * Hide loading state
     */
    hideLoadingState() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');

        messageEl.textContent = message;

        // Set icon based on type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        icon.className = `toast-icon fas ${icons[type] || icons.info}`;
        toast.className = `toast ${type}`;

        // Show toast
        toast.classList.add('show');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiController = new UIController();
    window.showToast = (message, type) => window.uiController.showToast(message, type);
});
