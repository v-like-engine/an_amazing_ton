/**
 * Mock KnowledgeBase - For testing until Agent 1 completes the real implementation
 *
 * This provides the expected interface that storage.js, editor.js, and export.js
 * will use to interact with the knowledge base.
 *
 * IMPORTANT: This is a TEMPORARY mock. Agent 1 will create the real implementation
 * in data-model.js. This file can be deleted once Agent 1 is complete.
 */

class MockKnowledgeBase {
  constructor() {
    this.weeks = [];
    this.metadata = {
      totalWeeks: 0,
      totalTrainings: 0,
      totalExercises: 0,
      allExerciseNames: [],
      dateRange: '',
      parsedDate: new Date().toISOString()
    };
  }

  /**
   * Add a week to the knowledge base
   *
   * @param {Object} weekData - Week data
   */
  addWeek(weekData) {
    const week = {
      id: weekData.id || this._generateId('week'),
      dateRange: weekData.dateRange || '',
      description: weekData.description || '',
      intensity: weekData.intensity || '',
      trainings: weekData.trainings || []
    };

    this.weeks.push(week);
    this._updateMetadata();

    return week;
  }

  /**
   * Add a training to a week
   *
   * @param {string} weekId - Week ID
   * @param {Object} trainingData - Training data
   */
  addTraining(weekId, trainingData) {
    const week = this.weeks.find(w => w.id === weekId);

    if (!week) {
      throw new Error(`Week ${weekId} not found`);
    }

    const training = {
      id: trainingData.id || this._generateId('training'),
      weekId: weekId,
      trainingNumber: trainingData.trainingNumber || (week.trainings.length + 1),
      intensityPercent: trainingData.intensityPercent || '',
      date: trainingData.date || '',
      blocks: trainingData.blocks || []
    };

    week.trainings.push(training);
    this._updateMetadata();

    return training;
  }

  /**
   * Add a block to a training
   *
   * @param {string} trainingId - Training ID
   * @param {Object} blockData - Block data
   */
  addBlock(trainingId, blockData) {
    const result = this._findTraining(trainingId);

    if (!result) {
      throw new Error(`Training ${trainingId} not found`);
    }

    const block = {
      id: blockData.id || this._generateId('block'),
      blockNumber: blockData.blockNumber || (result.training.blocks.length + 1),
      rounds: blockData.rounds || 1,
      restInfo: blockData.restInfo || '',
      setType: blockData.setType || null,
      exercises: blockData.exercises || []
    };

    result.training.blocks.push(block);
    this._updateMetadata();

    return block;
  }

  /**
   * Add an exercise to a block
   *
   * @param {string} blockId - Block ID
   * @param {Object} exerciseData - Exercise data
   */
  addExercise(blockId, exerciseData) {
    const result = this._findBlock(blockId);

    if (!result) {
      throw new Error(`Block ${blockId} not found`);
    }

    const exercise = {
      id: exerciseData.id || this._generateId('ex'),
      name: exerciseData.name || '',
      repetitions: exerciseData.repetitions || '',
      weight: exerciseData.weight || '',
      weightType: exerciseData.weightType || null
    };

    result.block.exercises.push(exercise);
    this._updateMetadata();

    return exercise;
  }

  /**
   * Get a week by ID
   *
   * @param {string} weekId - Week ID
   * @returns {Object|null} Week object
   */
  getWeek(weekId) {
    return this.weeks.find(w => w.id === weekId) || null;
  }

  /**
   * Get a training by ID
   *
   * @param {string} trainingId - Training ID
   * @returns {Object|null} Training object
   */
  getTraining(trainingId) {
    const result = this._findTraining(trainingId);
    return result ? result.training : null;
  }

  /**
   * Get a training by week and training number
   *
   * @param {string} weekId - Week ID
   * @param {number} trainingNum - Training number
   * @returns {Object|null} Training object
   */
  getTrainingByWeekAndNumber(weekId, trainingNum) {
    const week = this.getWeek(weekId);

    if (!week) return null;

    return week.trainings.find(t => t.trainingNumber === trainingNum) || null;
  }

  /**
   * Get all unique exercise names
   *
   * @returns {Array<string>} Array of exercise names
   */
  getAllExerciseNames() {
    const names = new Set();

    this.weeks.forEach(week => {
      week.trainings.forEach(training => {
        training.blocks.forEach(block => {
          block.exercises.forEach(exercise => {
            if (exercise.name) {
              names.add(exercise.name);
            }
          });
        });
      });
    });

    return Array.from(names).sort();
  }

  /**
   * Get all set types
   *
   * @returns {Array<string>} Array of set types
   */
  getAllSetTypes() {
    const types = new Set();

    this.weeks.forEach(week => {
      week.trainings.forEach(training => {
        training.blocks.forEach(block => {
          if (block.setType) {
            types.add(block.setType);
          }
        });
      });
    });

    return Array.from(types).sort();
  }

  /**
   * Get all intensity levels
   *
   * @returns {Array<string>} Array of intensity levels
   */
  getIntensityLevels() {
    const levels = new Set();

    this.weeks.forEach(week => {
      week.trainings.forEach(training => {
        if (training.intensityPercent) {
          levels.add(training.intensityPercent);
        }
      });
    });

    return Array.from(levels).sort();
  }

  /**
   * Export knowledge base to JSON
   *
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      weeks: JSON.parse(JSON.stringify(this.weeks)),
      metadata: JSON.parse(JSON.stringify(this.metadata))
    };
  }

  /**
   * Import knowledge base from JSON
   *
   * @param {Object} json - JSON data
   */
  fromJSON(json) {
    if (!json) {
      throw new Error('Invalid JSON data');
    }

    this.weeks = json.weeks || [];
    this.metadata = json.metadata || {};

    this._updateMetadata();

    console.log('[MockKB] Loaded from JSON:', {
      weeks: this.weeks.length,
      trainings: this.metadata.totalTrainings
    });
  }

  /**
   * Create sample data for testing
   */
  createSampleData() {
    // Week 1
    const week1 = this.addWeek({
      dateRange: '8-14.01',
      description: '1 неделя жесткого кача',
      intensity: 'high'
    });

    const training1 = this.addTraining(week1.id, {
      trainingNumber: 1,
      intensityPercent: '60-70%',
      date: '8.01'
    });

    const block1 = this.addBlock(training1.id, {
      blockNumber: 1,
      rounds: 1,
      restInfo: '',
      setType: null
    });

    this.addExercise(block1.id, {
      name: 'австралийские подтягивания',
      repetitions: '30',
      weight: ''
    });

    this.addExercise(block1.id, {
      name: 'W-подъемы',
      repetitions: '15',
      weight: '2-3 кг'
    });

    const block2 = this.addBlock(training1.id, {
      blockNumber: 2,
      rounds: 4,
      restInfo: 'каждые 2-3 минуты',
      setType: 'every_x_min'
    });

    this.addExercise(block2.id, {
      name: 'болгарские выпады',
      repetitions: '5/5',
      weight: ''
    });

    this.addExercise(block2.id, {
      name: 'отжимания на брусьях',
      repetitions: '5',
      weight: ''
    });

    this.addExercise(block2.id, {
      name: 'подтягивания',
      repetitions: '5',
      weight: ''
    });

    // Training 2
    const training2 = this.addTraining(week1.id, {
      trainingNumber: 2,
      intensityPercent: '60-70%',
      date: '10.01'
    });

    const block3 = this.addBlock(training2.id, {
      blockNumber: 1,
      rounds: 3,
      restInfo: '',
      setType: null
    });

    this.addExercise(block3.id, {
      name: 'приседания',
      repetitions: '10',
      weight: '20 кг'
    });

    this.addExercise(block3.id, {
      name: 'жим лежа',
      repetitions: '8',
      weight: '15-20 кг'
    });

    // Week 2
    const week2 = this.addWeek({
      dateRange: '15-21.01',
      description: '2 неделя восстановления',
      intensity: 'medium'
    });

    const training3 = this.addTraining(week2.id, {
      trainingNumber: 1,
      intensityPercent: '50-60%',
      date: '15.01'
    });

    const block4 = this.addBlock(training3.id, {
      blockNumber: 1,
      rounds: 1,
      restInfo: 'AMRAP 15 мин',
      setType: 'AMRAP'
    });

    this.addExercise(block4.id, {
      name: 'бег',
      repetitions: '400м',
      weight: ''
    });

    this.addExercise(block4.id, {
      name: 'берпи',
      repetitions: '10',
      weight: ''
    });

    this.addExercise(block4.id, {
      name: 'приседания',
      repetitions: '15',
      weight: ''
    });

    console.log('[MockKB] Sample data created:', {
      weeks: this.weeks.length,
      trainings: this.metadata.totalTrainings,
      exercises: this.metadata.totalExercises
    });
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Update metadata
   *
   * @private
   */
  _updateMetadata() {
    this.metadata.totalWeeks = this.weeks.length;

    let totalTrainings = 0;
    let totalExercises = 0;
    const exerciseNames = new Set();

    this.weeks.forEach(week => {
      totalTrainings += week.trainings.length;

      week.trainings.forEach(training => {
        training.blocks.forEach(block => {
          totalExercises += block.exercises.length;

          block.exercises.forEach(exercise => {
            if (exercise.name) {
              exerciseNames.add(exercise.name);
            }
          });
        });
      });
    });

    this.metadata.totalTrainings = totalTrainings;
    this.metadata.totalExercises = totalExercises;
    this.metadata.allExerciseNames = Array.from(exerciseNames).sort();
  }

  /**
   * Find a training by ID
   *
   * @private
   * @param {string} trainingId - Training ID
   * @returns {Object|null} { training, week }
   */
  _findTraining(trainingId) {
    for (const week of this.weeks) {
      for (const training of week.trainings) {
        if (training.id === trainingId) {
          return { training, week };
        }
      }
    }

    return null;
  }

  /**
   * Find a block by ID
   *
   * @private
   * @param {string} blockId - Block ID
   * @returns {Object|null} { block, training, week }
   */
  _findBlock(blockId) {
    for (const week of this.weeks) {
      for (const training of week.trainings) {
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
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockKnowledgeBase;
}
