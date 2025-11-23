/**
 * Tabata Timer - Professional training timer with color-coded states
 * Designed for gym use with large, readable display
 */

class TabataTimer {
    constructor(config = {}) {
        // Configuration
        this.workDuration = config.workDuration || 45;
        this.restDuration = config.restDuration || 15;
        this.setsPerExercise = config.setsPerExercise || 3;
        this.restBetweenExercises = config.restBetweenExercises || 60;
        this.exercises = config.exercises || ['Exercise 1', 'Exercise 2', 'Exercise 3'];

        // State
        this.currentExercise = 0;
        this.currentSet = 0;
        this.timeRemaining = 0;
        this.state = 'idle'; // idle, work, rest, exercise-rest, finished
        this.intervalId = null;
        this.isPaused = false;

        // Event listeners
        this.onTick = null;
        this.onStateChange = null;
        this.onComplete = null;
    }

    /**
     * Start the timer
     */
    start() {
        if (this.state !== 'idle') {
            console.warn('Timer already running');
            return;
        }

        this.currentExercise = 0;
        this.currentSet = 0;
        this.isPaused = false;
        this._startWork();
    }

    /**
     * Pause the timer
     */
    pause() {
        if (this.state === 'idle' || this.state === 'finished') {
            return;
        }

        this.isPaused = true;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this._emitStateChange();
    }

    /**
     * Resume the timer
     */
    resume() {
        if (!this.isPaused) {
            return;
        }

        this.isPaused = false;
        this._startInterval();
    }

    /**
     * Stop the timer
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.currentExercise = 0;
        this.currentSet = 0;
        this.timeRemaining = 0;
        this.state = 'idle';
        this.isPaused = false;

        this._emitStateChange();
    }

    /**
     * Reset the timer to initial state
     */
    reset() {
        this.stop();
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        const wasRunning = this.state !== 'idle' && this.state !== 'finished';

        if (wasRunning) {
            this.stop();
        }

        if (config.workDuration !== undefined) this.workDuration = config.workDuration;
        if (config.restDuration !== undefined) this.restDuration = config.restDuration;
        if (config.setsPerExercise !== undefined) this.setsPerExercise = config.setsPerExercise;
        if (config.restBetweenExercises !== undefined) this.restBetweenExercises = config.restBetweenExercises;
        if (config.exercises !== undefined) this.exercises = config.exercises;
    }

    /**
     * Get current stage information
     */
    getCurrentStage() {
        return {
            state: this.state,
            isPaused: this.isPaused,
            exercise: this.exercises[this.currentExercise] || 'Unknown',
            exerciseIndex: this.currentExercise,
            set: this.currentSet + 1,
            totalSets: this.setsPerExercise,
            exerciseNum: this.currentExercise + 1,
            totalExercises: this.exercises.length,
            timeRemaining: this.timeRemaining,
            progress: this.getProgress()
        };
    }

    /**
     * Calculate overall progress percentage
     */
    getProgress() {
        const totalSets = this.exercises.length * this.setsPerExercise;
        const completedSets = this.currentExercise * this.setsPerExercise + this.currentSet;

        // Calculate progress within current set/rest
        let currentProgress = 0;
        if (this.state === 'work') {
            currentProgress = 1 - (this.timeRemaining / this.workDuration);
        } else if (this.state === 'rest') {
            currentProgress = 1 - (this.timeRemaining / this.restDuration);
        } else if (this.state === 'exercise-rest') {
            currentProgress = 1 - (this.timeRemaining / this.restBetweenExercises);
        }

        const overallProgress = ((completedSets + currentProgress) / totalSets) * 100;
        return Math.min(100, Math.max(0, overallProgress));
    }

    /**
     * Start work period
     * @private
     */
    _startWork() {
        this.state = 'work';
        this.timeRemaining = this.workDuration;
        this._startInterval();
        this._emitStateChange();
    }

    /**
     * Start rest period between sets
     * @private
     */
    _startRest() {
        this.state = 'rest';
        this.timeRemaining = this.restDuration;
        this._startInterval();
        this._emitStateChange();
    }

    /**
     * Start rest period between exercises
     * @private
     */
    _startExerciseRest() {
        this.state = 'exercise-rest';
        this.timeRemaining = this.restBetweenExercises;
        this._startInterval();
        this._emitStateChange();
    }

    /**
     * Start the interval
     * @private
     */
    _startInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this._tick();
        }, 1000);

        // Emit initial tick
        this._emitTick();
    }

    /**
     * Timer tick - called every second
     * @private
     */
    _tick() {
        if (this.isPaused) {
            return;
        }

        this.timeRemaining--;
        this._emitTick();

        if (this.timeRemaining <= 0) {
            this._handleTimerComplete();
        }
    }

    /**
     * Handle timer completion for current state
     * @private
     */
    _handleTimerComplete() {
        clearInterval(this.intervalId);
        this.intervalId = null;

        if (this.state === 'work') {
            // Work period complete
            this.currentSet++;

            if (this.currentSet >= this.setsPerExercise) {
                // All sets for this exercise complete
                this.currentSet = 0;
                this.currentExercise++;

                if (this.currentExercise >= this.exercises.length) {
                    // All exercises complete
                    this._finish();
                } else {
                    // Move to next exercise
                    this._startExerciseRest();
                }
            } else {
                // More sets to do
                this._startRest();
            }
        } else if (this.state === 'rest') {
            // Rest period complete, start next set
            this._startWork();
        } else if (this.state === 'exercise-rest') {
            // Exercise rest complete, start next exercise
            this._startWork();
        }
    }

    /**
     * Finish the timer
     * @private
     */
    _finish() {
        this.state = 'finished';
        this.timeRemaining = 0;
        this._emitStateChange();

        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Emit tick event
     * @private
     */
    _emitTick() {
        if (this.onTick) {
            this.onTick(this.getCurrentStage());
        }
    }

    /**
     * Emit state change event
     * @private
     */
    _emitStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getCurrentStage());
        }
    }

    /**
     * Format time as MM:SS
     */
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}


/**
 * TimerUI - Controls the timer display and interactions
 */
class TimerUI {
    constructor(timer) {
        this.timer = timer;
        this.soundEnabled = true;
        this.isFullscreen = false;

        // DOM elements
        this.timerDisplay = document.getElementById('timer-display');
        this.exerciseName = document.getElementById('exercise-name');
        this.countdown = document.getElementById('countdown');
        this.stateIndicator = document.getElementById('state-indicator');
        this.progressFill = document.getElementById('timer-progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.currentSet = document.getElementById('current-set');
        this.currentExercise = document.getElementById('current-exercise');

        // Buttons
        this.btnStart = document.getElementById('btn-start');
        this.btnPause = document.getElementById('btn-pause');
        this.btnStop = document.getElementById('btn-stop');
        this.btnFullscreen = document.getElementById('btn-fullscreen');

        // Settings
        this.soundCheckbox = document.getElementById('sound-enabled');

        // Audio context for beeps
        this.audioContext = null;
        this._initAudio();

        // Bind events
        this._bindEvents();

        // Initial update
        this.updateDisplay(this.timer.getCurrentStage());
    }

    /**
     * Initialize audio context
     * @private
     */
    _initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Bind event listeners
     * @private
     */
    _bindEvents() {
        // Timer events
        this.timer.onTick = (stage) => this.updateDisplay(stage);
        this.timer.onStateChange = (stage) => this.handleStateChange(stage);
        this.timer.onComplete = () => this.handleComplete();

        // Button events
        this.btnStart.addEventListener('click', () => this.handleStart());
        this.btnPause.addEventListener('click', () => this.handlePause());
        this.btnStop.addEventListener('click', () => this.handleStop());
        this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

        // Settings
        this.soundCheckbox.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                if (this.timer.state === 'idle' || this.timer.state === 'finished') {
                    this.handleStart();
                } else if (this.timer.isPaused) {
                    this.handlePause();
                } else {
                    this.handlePause();
                }
            } else if (e.code === 'Escape') {
                if (this.isFullscreen) {
                    this.exitFullscreen();
                } else {
                    this.handleStop();
                }
            } else if (e.code === 'KeyF') {
                this.toggleFullscreen();
            }
        });
    }

    /**
     * Handle start button
     */
    handleStart() {
        this.timer.start();
        this.btnStart.style.display = 'none';
        this.btnPause.style.display = 'flex';
        this.playSound('start');
    }

    /**
     * Handle pause/resume button
     */
    handlePause() {
        if (this.timer.isPaused) {
            this.timer.resume();
            this.btnPause.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        } else {
            this.timer.pause();
            this.btnPause.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
        }
    }

    /**
     * Handle stop button
     */
    handleStop() {
        this.timer.stop();
        this.btnStart.style.display = 'flex';
        this.btnPause.style.display = 'none';
        this.btnPause.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
    }

    /**
     * Handle state change
     */
    handleStateChange(stage) {
        this.updateDisplay(stage);

        // Play sounds
        if (stage.state === 'work') {
            this.playSound('start');
        } else if (stage.state === 'rest') {
            this.playSound('rest');
        } else if (stage.state === 'exercise-rest') {
            this.playSound('exercise-change');
        }
    }

    /**
     * Handle timer completion
     */
    handleComplete() {
        this.playSound('finished');
        this.showNotification('Training Complete! 🎉');
        this.btnStart.style.display = 'flex';
        this.btnPause.style.display = 'none';
    }

    /**
     * Update display with current stage
     */
    updateDisplay(stage) {
        // Update exercise name
        this.exerciseName.textContent = stage.exercise;

        // Update countdown
        this.countdown.textContent = TabataTimer.formatTime(stage.timeRemaining);

        // Update state indicator
        const stateLabels = {
            idle: 'READY',
            work: 'WORK',
            rest: 'REST',
            'exercise-rest': 'REST BETWEEN EXERCISES',
            finished: 'FINISHED!'
        };
        this.stateIndicator.textContent = stateLabels[stage.state] || stage.state.toUpperCase();
        if (stage.isPaused) {
            this.stateIndicator.textContent = 'PAUSED';
        }

        // Update state class for color coding
        this.timerDisplay.className = 'timer-display state-' + stage.state;

        // Update progress
        this.progressFill.style.width = stage.progress + '%';
        this.progressText.textContent = Math.round(stage.progress) + '%';

        // Update set and exercise info
        this.currentSet.textContent = `${stage.set} / ${stage.totalSets}`;
        this.currentExercise.textContent = `${stage.exerciseNum} / ${stage.totalExercises}`;
    }

    /**
     * Play sound notification
     */
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) {
            return;
        }

        const now = this.audioContext.currentTime;

        const beep = (frequency, duration, delay = 0) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, now + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration);

            oscillator.start(now + delay);
            oscillator.stop(now + delay + duration);
        };

        switch (type) {
            case 'start':
                beep(880, 0.1);
                break;
            case 'rest':
                beep(660, 0.1, 0);
                beep(660, 0.1, 0.15);
                break;
            case 'exercise-change':
                beep(880, 0.1, 0);
                beep(1046, 0.1, 0.15);
                beep(1318, 0.15, 0.3);
                break;
            case 'finished':
                beep(880, 0.2, 0);
                beep(1046, 0.2, 0.25);
                beep(1318, 0.3, 0.5);
                break;
        }
    }

    /**
     * Show browser notification
     */
    showNotification(message) {
        if (window.showToast) {
            window.showToast(message, 'success');
        }

        // Browser notification (if permitted)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TrainingPlan Timer', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!this.isFullscreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        const elem = this.timerDisplay;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }

        this.isFullscreen = true;
        this.btnFullscreen.innerHTML = '<i class="fas fa-compress"></i><span>Exit Fullscreen</span>';
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        this.isFullscreen = false;
        this.btnFullscreen.innerHTML = '<i class="fas fa-expand"></i><span>Fullscreen</span>';
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.TabataTimer = TabataTimer;
    window.TimerUI = TimerUI;
}
