/**
 * TrainingEditor - Handles editing and adding training plan content
 *
 * Features:
 * - Edit existing exercises, blocks, trainings, weeks
 * - Add new exercises, blocks, trainings, weeks
 * - Validation and error handling
 * - Auto-save integration
 * - Undo/redo support
 *
 * Data integrity is critical - validate all changes!
 */

class TrainingEditor {
  constructor(knowledgeBase, storageManager) {
    this.kb = knowledgeBase;
    this.storage = storageManager;

    // History for undo/redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;

    // Change tracking
    this.changeListeners = [];
    this.hasUnsavedChanges = false;
  }

  // ============================================================================
  // EDIT METHODS
  // ============================================================================

  /**
   * Update an exercise
   *
   * @param {string} exerciseId - The exercise ID
   * @param {Object} updates - Fields to update { name, repetitions, weight }
   * @returns {boolean} Success status
   */
  updateExercise(exerciseId, updates) {
    try {
      // Find the exercise
      const result = this._findExercise(exerciseId);

      if (!result) {
        throw new Error(`Exercise ${exerciseId} not found`);
      }

      const { exercise, block } = result;

      // Save state for undo
      this._saveHistory('updateExercise', {
        exerciseId,
        oldData: { ...exercise },
        newData: updates
      });

      // Validate updates
      if (updates.name !== undefined) {
        if (typeof updates.name !== 'string' || updates.name.trim() === '') {
          throw new Error('Exercise name must be a non-empty string');
        }
        exercise.name = updates.name.trim();
      }

      if (updates.repetitions !== undefined) {
        exercise.repetitions = this._validateRepetitions(updates.repetitions);
      }

      if (updates.weight !== undefined) {
        exercise.weight = updates.weight;
        exercise.weightType = this._detectWeightType(updates.weight);
      }

      // Trigger auto-save
      this._notifyChange('exercise_updated', { exerciseId, exercise });

      console.log(`[Editor] Updated exercise ${exerciseId}`);
      return true;

    } catch (error) {
      console.error('[Editor] updateExercise failed:', error);
      throw error;
    }
  }

  /**
   * Update a block
   *
   * @param {string} blockId - The block ID
   * @param {Object} updates - Fields to update { rounds, restInfo, setType }
   * @returns {boolean} Success status
   */
  updateBlock(blockId, updates) {
    try {
      const result = this._findBlock(blockId);

      if (!result) {
        throw new Error(`Block ${blockId} not found`);
      }

      const { block } = result;

      // Save state for undo
      this._saveHistory('updateBlock', {
        blockId,
        oldData: { ...block },
        newData: updates
      });

      // Update fields
      if (updates.rounds !== undefined) {
        const rounds = parseInt(updates.rounds, 10);
        if (isNaN(rounds) || rounds < 1) {
          throw new Error('Rounds must be a positive number');
        }
        block.rounds = rounds;
      }

      if (updates.restInfo !== undefined) {
        block.restInfo = updates.restInfo;
      }

      if (updates.setType !== undefined) {
        block.setType = this._validateSetType(updates.setType);
      }

      if (updates.blockNumber !== undefined) {
        const blockNumber = parseInt(updates.blockNumber, 10);
        if (isNaN(blockNumber) || blockNumber < 1) {
          throw new Error('Block number must be a positive number');
        }
        block.blockNumber = blockNumber;
      }

      // Trigger auto-save
      this._notifyChange('block_updated', { blockId, block });

      console.log(`[Editor] Updated block ${blockId}`);
      return true;

    } catch (error) {
      console.error('[Editor] updateBlock failed:', error);
      throw error;
    }
  }

  /**
   * Update a training
   *
   * @param {string} trainingId - The training ID
   * @param {Object} updates - Fields to update { intensityPercent, date, trainingNumber }
   * @returns {boolean} Success status
   */
  updateTraining(trainingId, updates) {
    try {
      const result = this._findTraining(trainingId);

      if (!result) {
        throw new Error(`Training ${trainingId} not found`);
      }

      const { training } = result;

      // Save state for undo
      this._saveHistory('updateTraining', {
        trainingId,
        oldData: { ...training },
        newData: updates
      });

      // Update fields
      if (updates.intensityPercent !== undefined) {
        training.intensityPercent = updates.intensityPercent;
      }

      if (updates.date !== undefined) {
        training.date = updates.date;
      }

      if (updates.trainingNumber !== undefined) {
        const num = parseInt(updates.trainingNumber, 10);
        if (isNaN(num) || num < 1) {
          throw new Error('Training number must be a positive number');
        }
        training.trainingNumber = num;
      }

      // Trigger auto-save
      this._notifyChange('training_updated', { trainingId, training });

      console.log(`[Editor] Updated training ${trainingId}`);
      return true;

    } catch (error) {
      console.error('[Editor] updateTraining failed:', error);
      throw error;
    }
  }

  /**
   * Update a week
   *
   * @param {string} weekId - The week ID
   * @param {Object} updates - Fields to update { dateRange, description, intensity }
   * @returns {boolean} Success status
   */
  updateWeek(weekId, updates) {
    try {
      const week = this._findWeek(weekId);

      if (!week) {
        throw new Error(`Week ${weekId} not found`);
      }

      // Save state for undo
      this._saveHistory('updateWeek', {
        weekId,
        oldData: { ...week },
        newData: updates
      });

      // Update fields
      if (updates.dateRange !== undefined) {
        if (typeof updates.dateRange !== 'string' || updates.dateRange.trim() === '') {
          throw new Error('Date range must be a non-empty string');
        }
        week.dateRange = updates.dateRange.trim();
      }

      if (updates.description !== undefined) {
        week.description = updates.description;
      }

      if (updates.intensity !== undefined) {
        week.intensity = updates.intensity;
      }

      // Trigger auto-save
      this._notifyChange('week_updated', { weekId, week });

      console.log(`[Editor] Updated week ${weekId}`);
      return true;

    } catch (error) {
      console.error('[Editor] updateWeek failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // ADD METHODS
  // ============================================================================

  /**
   * Add a new exercise to a block
   *
   * @param {string} blockId - The block ID
   * @param {Object} exerciseData - { name, repetitions, weight }
   * @returns {Object} The created exercise
   */
  addExerciseToBlock(blockId, exerciseData) {
    try {
      const result = this._findBlock(blockId);

      if (!result) {
        throw new Error(`Block ${blockId} not found`);
      }

      const { block } = result;

      // Validate exercise data
      if (!exerciseData.name || typeof exerciseData.name !== 'string') {
        throw new Error('Exercise name is required');
      }

      // Generate new ID
      const exerciseId = this._generateId('ex');

      // Create exercise
      const exercise = {
        id: exerciseId,
        name: exerciseData.name.trim(),
        repetitions: this._validateRepetitions(exerciseData.repetitions || ''),
        weight: exerciseData.weight || '',
        weightType: this._detectWeightType(exerciseData.weight || '')
      };

      // Add to block
      if (!block.exercises) {
        block.exercises = [];
      }

      block.exercises.push(exercise);

      // Save state for undo
      this._saveHistory('addExercise', {
        blockId,
        exerciseId,
        exerciseData: { ...exercise }
      });

      // Trigger auto-save
      this._notifyChange('exercise_added', { blockId, exercise });

      console.log(`[Editor] Added exercise ${exerciseId} to block ${blockId}`);
      return exercise;

    } catch (error) {
      console.error('[Editor] addExerciseToBlock failed:', error);
      throw error;
    }
  }

  /**
   * Add a new block to a training
   *
   * @param {string} trainingId - The training ID
   * @param {Object} blockData - { blockNumber, rounds, restInfo, setType, exercises }
   * @returns {Object} The created block
   */
  addBlockToTraining(trainingId, blockData) {
    try {
      const result = this._findTraining(trainingId);

      if (!result) {
        throw new Error(`Training ${trainingId} not found`);
      }

      const { training } = result;

      // Generate new ID
      const blockId = this._generateId('block');

      // Create block
      const block = {
        id: blockId,
        blockNumber: blockData.blockNumber || (training.blocks?.length || 0) + 1,
        rounds: parseInt(blockData.rounds, 10) || 1,
        restInfo: blockData.restInfo || '',
        setType: this._validateSetType(blockData.setType),
        exercises: []
      };

      // Add exercises if provided
      if (blockData.exercises && Array.isArray(blockData.exercises)) {
        blockData.exercises.forEach(exData => {
          const exerciseId = this._generateId('ex');
          block.exercises.push({
            id: exerciseId,
            name: exData.name || '',
            repetitions: this._validateRepetitions(exData.repetitions || ''),
            weight: exData.weight || '',
            weightType: this._detectWeightType(exData.weight || '')
          });
        });
      }

      // Add to training
      if (!training.blocks) {
        training.blocks = [];
      }

      training.blocks.push(block);

      // Save state for undo
      this._saveHistory('addBlock', {
        trainingId,
        blockId,
        blockData: { ...block }
      });

      // Trigger auto-save
      this._notifyChange('block_added', { trainingId, block });

      console.log(`[Editor] Added block ${blockId} to training ${trainingId}`);
      return block;

    } catch (error) {
      console.error('[Editor] addBlockToTraining failed:', error);
      throw error;
    }
  }

  /**
   * Add a new training to a week
   *
   * @param {string} weekId - The week ID
   * @param {Object} trainingData - { trainingNumber, intensityPercent, date, blocks }
   * @returns {Object} The created training
   */
  addTrainingToWeek(weekId, trainingData) {
    try {
      const week = this._findWeek(weekId);

      if (!week) {
        throw new Error(`Week ${weekId} not found`);
      }

      // Generate new ID
      const trainingId = this._generateId('training');

      // Create training
      const training = {
        id: trainingId,
        weekId: weekId,
        trainingNumber: trainingData.trainingNumber || (week.trainings?.length || 0) + 1,
        intensityPercent: trainingData.intensityPercent || '',
        date: trainingData.date || '',
        blocks: []
      };

      // Add blocks if provided
      if (trainingData.blocks && Array.isArray(trainingData.blocks)) {
        trainingData.blocks.forEach(blockData => {
          const blockId = this._generateId('block');
          const block = {
            id: blockId,
            blockNumber: blockData.blockNumber || training.blocks.length + 1,
            rounds: parseInt(blockData.rounds, 10) || 1,
            restInfo: blockData.restInfo || '',
            setType: this._validateSetType(blockData.setType),
            exercises: blockData.exercises || []
          };
          training.blocks.push(block);
        });
      }

      // Add to week
      if (!week.trainings) {
        week.trainings = [];
      }

      week.trainings.push(training);

      // Save state for undo
      this._saveHistory('addTraining', {
        weekId,
        trainingId,
        trainingData: { ...training }
      });

      // Trigger auto-save
      this._notifyChange('training_added', { weekId, training });

      console.log(`[Editor] Added training ${trainingId} to week ${weekId}`);
      return training;

    } catch (error) {
      console.error('[Editor] addTrainingToWeek failed:', error);
      throw error;
    }
  }

  /**
   * Add a new week
   *
   * @param {Object} weekData - { dateRange, description, intensity, trainings }
   * @returns {Object} The created week
   */
  addWeek(weekData) {
    try {
      // Validate week data
      if (!weekData.dateRange) {
        throw new Error('Date range is required');
      }

      // Generate new ID
      const weekId = this._generateId('week');

      // Create week
      const week = {
        id: weekId,
        dateRange: weekData.dateRange,
        description: weekData.description || '',
        intensity: weekData.intensity || '',
        trainings: []
      };

      // Add trainings if provided
      if (weekData.trainings && Array.isArray(weekData.trainings)) {
        weekData.trainings.forEach(trainingData => {
          const trainingId = this._generateId('training');
          const training = {
            id: trainingId,
            weekId: weekId,
            trainingNumber: trainingData.trainingNumber || week.trainings.length + 1,
            intensityPercent: trainingData.intensityPercent || '',
            date: trainingData.date || '',
            blocks: trainingData.blocks || []
          };
          week.trainings.push(training);
        });
      }

      // Add to knowledge base
      if (!this.kb.weeks) {
        this.kb.weeks = [];
      }

      this.kb.weeks.push(week);

      // Update metadata
      if (this.kb.metadata) {
        this.kb.metadata.totalWeeks = this.kb.weeks.length;
      }

      // Save state for undo
      this._saveHistory('addWeek', {
        weekId,
        weekData: { ...week }
      });

      // Trigger auto-save
      this._notifyChange('week_added', { week });

      console.log(`[Editor] Added week ${weekId}`);
      return week;

    } catch (error) {
      console.error('[Editor] addWeek failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // DELETE METHODS
  // ============================================================================

  /**
   * Delete an exercise
   *
   * @param {string} exerciseId - The exercise ID
   * @returns {boolean} Success status
   */
  deleteExercise(exerciseId) {
    try {
      const result = this._findExercise(exerciseId);

      if (!result) {
        throw new Error(`Exercise ${exerciseId} not found`);
      }

      const { exercise, block } = result;

      // Save state for undo
      this._saveHistory('deleteExercise', {
        exerciseId,
        blockId: block.id,
        exerciseData: { ...exercise },
        index: block.exercises.indexOf(exercise)
      });

      // Remove exercise
      const index = block.exercises.indexOf(exercise);
      block.exercises.splice(index, 1);

      // Trigger auto-save
      this._notifyChange('exercise_deleted', { exerciseId, blockId: block.id });

      console.log(`[Editor] Deleted exercise ${exerciseId}`);
      return true;

    } catch (error) {
      console.error('[Editor] deleteExercise failed:', error);
      throw error;
    }
  }

  /**
   * Delete a block
   *
   * @param {string} blockId - The block ID
   * @returns {boolean} Success status
   */
  deleteBlock(blockId) {
    try {
      const result = this._findBlock(blockId);

      if (!result) {
        throw new Error(`Block ${blockId} not found`);
      }

      const { block, training } = result;

      // Save state for undo
      this._saveHistory('deleteBlock', {
        blockId,
        trainingId: training.id,
        blockData: JSON.parse(JSON.stringify(block)),
        index: training.blocks.indexOf(block)
      });

      // Remove block
      const index = training.blocks.indexOf(block);
      training.blocks.splice(index, 1);

      // Trigger auto-save
      this._notifyChange('block_deleted', { blockId, trainingId: training.id });

      console.log(`[Editor] Deleted block ${blockId}`);
      return true;

    } catch (error) {
      console.error('[Editor] deleteBlock failed:', error);
      throw error;
    }
  }

  /**
   * Delete a training
   *
   * @param {string} trainingId - The training ID
   * @returns {boolean} Success status
   */
  deleteTraining(trainingId) {
    try {
      const result = this._findTraining(trainingId);

      if (!result) {
        throw new Error(`Training ${trainingId} not found`);
      }

      const { training, week } = result;

      // Save state for undo
      this._saveHistory('deleteTraining', {
        trainingId,
        weekId: week.id,
        trainingData: JSON.parse(JSON.stringify(training)),
        index: week.trainings.indexOf(training)
      });

      // Remove training
      const index = week.trainings.indexOf(training);
      week.trainings.splice(index, 1);

      // Trigger auto-save
      this._notifyChange('training_deleted', { trainingId, weekId: week.id });

      console.log(`[Editor] Deleted training ${trainingId}`);
      return true;

    } catch (error) {
      console.error('[Editor] deleteTraining failed:', error);
      throw error;
    }
  }

  /**
   * Delete a week
   *
   * @param {string} weekId - The week ID
   * @returns {boolean} Success status
   */
  deleteWeek(weekId) {
    try {
      const week = this._findWeek(weekId);

      if (!week) {
        throw new Error(`Week ${weekId} not found`);
      }

      // Save state for undo
      const index = this.kb.weeks.indexOf(week);
      this._saveHistory('deleteWeek', {
        weekId,
        weekData: JSON.parse(JSON.stringify(week)),
        index: index
      });

      // Remove week
      this.kb.weeks.splice(index, 1);

      // Update metadata
      if (this.kb.metadata) {
        this.kb.metadata.totalWeeks = this.kb.weeks.length;
      }

      // Trigger auto-save
      this._notifyChange('week_deleted', { weekId });

      console.log(`[Editor] Deleted week ${weekId}`);
      return true;

    } catch (error) {
      console.error('[Editor] deleteWeek failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // UNDO/REDO
  // ============================================================================

  /**
   * Undo the last change
   *
   * @returns {boolean} Success status
   */
  undo() {
    if (!this.canUndo()) {
      console.log('[Editor] Nothing to undo');
      return false;
    }

    const action = this.history[this.historyIndex];
    this.historyIndex--;

    this._revertAction(action);
    this._notifyChange('undo', { action });

    console.log(`[Editor] Undid ${action.type}`);
    return true;
  }

  /**
   * Redo the last undone change
   *
   * @returns {boolean} Success status
   */
  redo() {
    if (!this.canRedo()) {
      console.log('[Editor] Nothing to redo');
      return false;
    }

    this.historyIndex++;
    const action = this.history[this.historyIndex];

    this._applyAction(action);
    this._notifyChange('redo', { action });

    console.log(`[Editor] Redid ${action.type}`);
    return true;
  }

  /**
   * Check if undo is available
   *
   * @returns {boolean} True if can undo
   */
  canUndo() {
    return this.historyIndex >= 0;
  }

  /**
   * Check if redo is available
   *
   * @returns {boolean} True if can redo
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Clear undo/redo history
   */
  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
    console.log('[Editor] History cleared');
  }

  // ============================================================================
  // CHANGE LISTENERS
  // ============================================================================

  /**
   * Add a change listener
   *
   * @param {Function} callback - Called when data changes
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.changeListeners.push(callback);
    }
  }

  /**
   * Remove a change listener
   *
   * @param {Function} callback - The callback to remove
   */
  offChange(callback) {
    const index = this.changeListeners.indexOf(callback);
    if (index >= 0) {
      this.changeListeners.splice(index, 1);
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Notify all change listeners
   *
   * @private
   * @param {string} type - Type of change
   * @param {Object} data - Change data
   */
  _notifyChange(type, data) {
    this.hasUnsavedChanges = true;

    // Notify listeners
    this.changeListeners.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('[Editor] Change listener error:', error);
      }
    });

    // Trigger auto-save
    if (this.storage && !type.startsWith('undo') && !type.startsWith('redo')) {
      this.storage.autoSave(this.kb);
    }
  }

  /**
   * Save an action to history
   *
   * @private
   * @param {string} type - Action type
   * @param {Object} data - Action data
   */
  _saveHistory(type, data) {
    // Remove any actions after current index (if we undid and then made a new change)
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add new action
    this.history.push({
      type,
      data,
      timestamp: Date.now()
    });

    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Revert an action (for undo)
   *
   * @private
   * @param {Object} action - The action to revert
   */
  _revertAction(action) {
    const { type, data } = action;

    switch (type) {
      case 'updateExercise':
        this._restoreExercise(data.exerciseId, data.oldData);
        break;
      case 'updateBlock':
        this._restoreBlock(data.blockId, data.oldData);
        break;
      case 'updateTraining':
        this._restoreTraining(data.trainingId, data.oldData);
        break;
      case 'updateWeek':
        this._restoreWeek(data.weekId, data.oldData);
        break;
      case 'addExercise':
        this.deleteExercise(data.exerciseId);
        break;
      case 'deleteExercise':
        this._restoreDeletedExercise(data);
        break;
      // Add more cases as needed
    }
  }

  /**
   * Apply an action (for redo)
   *
   * @private
   * @param {Object} action - The action to apply
   */
  _applyAction(action) {
    const { type, data } = action;

    switch (type) {
      case 'updateExercise':
        this._restoreExercise(data.exerciseId, data.newData);
        break;
      case 'updateBlock':
        this._restoreBlock(data.blockId, data.newData);
        break;
      case 'updateTraining':
        this._restoreTraining(data.trainingId, data.newData);
        break;
      case 'updateWeek':
        this._restoreWeek(data.weekId, data.newData);
        break;
      case 'deleteExercise':
        this.deleteExercise(data.exerciseId);
        break;
      case 'addExercise':
        this._restoreDeletedExercise(data);
        break;
      // Add more cases as needed
    }
  }

  /**
   * Restore exercise data
   *
   * @private
   */
  _restoreExercise(exerciseId, data) {
    const result = this._findExercise(exerciseId);
    if (result) {
      Object.assign(result.exercise, data);
    }
  }

  /**
   * Restore block data
   *
   * @private
   */
  _restoreBlock(blockId, data) {
    const result = this._findBlock(blockId);
    if (result) {
      Object.assign(result.block, data);
    }
  }

  /**
   * Restore training data
   *
   * @private
   */
  _restoreTraining(trainingId, data) {
    const result = this._findTraining(trainingId);
    if (result) {
      Object.assign(result.training, data);
    }
  }

  /**
   * Restore week data
   *
   * @private
   */
  _restoreWeek(weekId, data) {
    const week = this._findWeek(weekId);
    if (week) {
      Object.assign(week, data);
    }
  }

  /**
   * Restore deleted exercise
   *
   * @private
   */
  _restoreDeletedExercise(data) {
    const result = this._findBlock(data.blockId);
    if (result) {
      result.block.exercises.splice(data.index, 0, data.exerciseData);
    }
  }

  /**
   * Find an exercise by ID
   *
   * @private
   * @param {string} exerciseId - The exercise ID
   * @returns {Object|null} { exercise, block, training, week }
   */
  _findExercise(exerciseId) {
    if (!this.kb.weeks) return null;

    for (const week of this.kb.weeks) {
      if (!week.trainings) continue;

      for (const training of week.trainings) {
        if (!training.blocks) continue;

        for (const block of training.blocks) {
          if (!block.exercises) continue;

          for (const exercise of block.exercises) {
            if (exercise.id === exerciseId) {
              return { exercise, block, training, week };
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Find a block by ID
   *
   * @private
   * @param {string} blockId - The block ID
   * @returns {Object|null} { block, training, week }
   */
  _findBlock(blockId) {
    if (!this.kb.weeks) return null;

    for (const week of this.kb.weeks) {
      if (!week.trainings) continue;

      for (const training of week.trainings) {
        if (!training.blocks) continue;

        for (const block of training.blocks) {
          if (block.id === blockId) {
            return { block, training, week };
          }
        }
      }
    }

    return null;
  }

  /**
   * Find a training by ID
   *
   * @private
   * @param {string} trainingId - The training ID
   * @returns {Object|null} { training, week }
   */
  _findTraining(trainingId) {
    if (!this.kb.weeks) return null;

    for (const week of this.kb.weeks) {
      if (!week.trainings) continue;

      for (const training of week.trainings) {
        if (training.id === trainingId) {
          return { training, week };
        }
      }
    }

    return null;
  }

  /**
   * Find a week by ID
   *
   * @private
   * @param {string} weekId - The week ID
   * @returns {Object|null} The week object
   */
  _findWeek(weekId) {
    if (!this.kb.weeks) return null;

    return this.kb.weeks.find(week => week.id === weekId) || null;
  }

  /**
   * Generate a unique ID
   *
   * @private
   * @param {string} prefix - ID prefix
   * @returns {string} Generated ID
   */
  _generateId(prefix) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Validate repetitions format
   *
   * @private
   * @param {string} reps - Repetitions string
   * @returns {string} Validated repetitions
   */
  _validateRepetitions(reps) {
    if (reps === undefined || reps === null) {
      return '';
    }

    return String(reps).trim();
  }

  /**
   * Validate set type
   *
   * @private
   * @param {string} setType - Set type
   * @returns {string|null} Validated set type
   */
  _validateSetType(setType) {
    if (!setType) return null;

    const validTypes = ['AMRAP', 'rounds', 'timed', 'every_x_min'];
    const normalized = setType.toLowerCase();

    if (normalized.includes('amrap')) return 'AMRAP';
    if (normalized.includes('каждые') || normalized.includes('every')) return 'every_x_min';
    if (normalized.includes('раунд') || normalized.includes('round')) return 'rounds';

    return setType;
  }

  /**
   * Detect weight type
   *
   * @private
   * @param {string} weight - Weight string
   * @returns {string|null} Weight type
   */
  _detectWeightType(weight) {
    if (!weight) return null;

    const str = weight.toLowerCase();

    if (str.includes('кг') || str.includes('kg')) return 'kg';
    if (str.includes('lb') || str.includes('фунт')) return 'lb';
    if (str.includes('-')) return 'range';

    return 'numeric';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainingEditor;
}
