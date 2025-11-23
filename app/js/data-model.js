/**
 * Knowledge Base Data Model for Training Plan Parser
 * This module provides the core data structures for storing and accessing training data
 */

class KnowledgeBase {
  constructor() {
    this.weeks = [];
    this.metadata = {
      totalWeeks: 0,
      totalTrainings: 0,
      totalExercises: 0,
      allExerciseNames: [],
      dateRange: "",
      parsedDate: new Date().toISOString().split('T')[0]
    };

    // Fast lookup indices
    this._weekIndex = new Map(); // weekId -> week object
    this._trainingIndex = new Map(); // trainingId -> training object
    this._blockIndex = new Map(); // blockId -> block object
  }

  /**
   * Add a new week to the knowledge base
   */
  addWeek(weekData) {
    const week = {
      id: weekData.id || `week_${this.weeks.length + 1}`,
      dateRange: weekData.dateRange || "",
      description: weekData.description || "",
      intensity: weekData.intensity || "",
      trainings: []
    };

    this.weeks.push(week);
    this._weekIndex.set(week.id, week);
    this.metadata.totalWeeks = this.weeks.length;

    return week;
  }

  /**
   * Add a training to a specific week
   */
  addTraining(weekId, trainingData) {
    const week = this._weekIndex.get(weekId);
    if (!week) {
      throw new Error(`Week with id ${weekId} not found`);
    }

    const training = {
      id: trainingData.id || `${weekId}_training_${week.trainings.length + 1}`,
      weekId: weekId,
      trainingNumber: trainingData.trainingNumber,
      intensityPercent: trainingData.intensityPercent || "",
      date: trainingData.date || "",
      description: trainingData.description || "",
      blocks: []
    };

    week.trainings.push(training);
    this._trainingIndex.set(training.id, training);
    this.metadata.totalTrainings++;

    return training;
  }

  /**
   * Add a block to a specific training
   */
  addBlock(trainingId, blockData) {
    const training = this._trainingIndex.get(trainingId);
    if (!training) {
      throw new Error(`Training with id ${trainingId} not found`);
    }

    const block = {
      id: blockData.id || `${trainingId}_block_${training.blocks.length + 1}`,
      trainingId: trainingId,
      blockNumber: blockData.blockNumber,
      rounds: blockData.rounds || null,
      restInfo: blockData.restInfo || "",
      setType: blockData.setType || null,
      description: blockData.description || "",
      exercises: []
    };

    training.blocks.push(block);
    this._blockIndex.set(block.id, block);

    return block;
  }

  /**
   * Add an exercise to a specific block
   */
  addExercise(blockId, exerciseData) {
    const block = this._blockIndex.get(blockId);
    if (!block) {
      throw new Error(`Block with id ${blockId} not found`);
    }

    const exercise = {
      id: exerciseData.id || `${blockId}_ex_${block.exercises.length + 1}`,
      blockId: blockId,
      name: exerciseData.name || "",
      repetitions: exerciseData.repetitions || "",
      weight: exerciseData.weight || "",
      weightType: exerciseData.weightType || null
    };

    block.exercises.push(exercise);
    this.metadata.totalExercises++;

    // Update unique exercise names
    const normalizedName = exercise.name.trim().toLowerCase();
    if (normalizedName && !this.metadata.allExerciseNames.some(n => n.toLowerCase() === normalizedName)) {
      this.metadata.allExerciseNames.push(exercise.name.trim());
    }

    return exercise;
  }

  /**
   * Get a week by ID
   */
  getWeek(weekId) {
    return this._weekIndex.get(weekId);
  }

  /**
   * Get a training by ID
   */
  getTraining(trainingId) {
    return this._trainingIndex.get(trainingId);
  }

  /**
   * Get a training by week ID and training number
   */
  getTrainingByWeekAndNumber(weekId, trainingNum) {
    const week = this._weekIndex.get(weekId);
    if (!week) return null;

    return week.trainings.find(t => t.trainingNumber === trainingNum);
  }

  /**
   * Get all unique exercise names (for autocomplete/search)
   */
  getAllExerciseNames() {
    return [...this.metadata.allExerciseNames].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase(), 'ru')
    );
  }

  /**
   * Get all unique set types used in training
   */
  getAllSetTypes() {
    const setTypes = new Set();

    for (const week of this.weeks) {
      for (const training of week.trainings) {
        for (const block of training.blocks) {
          if (block.setType) {
            setTypes.add(block.setType);
          }
        }
      }
    }

    return Array.from(setTypes).sort();
  }

  /**
   * Get all intensity levels used
   */
  getIntensityLevels() {
    const intensities = new Set();

    for (const week of this.weeks) {
      if (week.intensity) {
        intensities.add(week.intensity);
      }
      for (const training of week.trainings) {
        if (training.intensityPercent) {
          intensities.add(training.intensityPercent);
        }
      }
    }

    return Array.from(intensities).sort();
  }

  /**
   * Update metadata after parsing is complete
   */
  updateMetadata() {
    // Calculate date range
    const weekDates = this.weeks
      .map(w => w.dateRange)
      .filter(d => d);

    if (weekDates.length > 0) {
      this.metadata.dateRange = `${weekDates[0]} - ${weekDates[weekDates.length - 1]}`;
    }

    // Sort exercise names
    this.metadata.allExerciseNames.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase(), 'ru')
    );
  }

  /**
   * Export to JSON for storage
   */
  toJSON() {
    return {
      weeks: this.weeks,
      metadata: this.metadata
    };
  }

  /**
   * Import from JSON
   */
  fromJSON(json) {
    this.weeks = json.weeks || [];
    this.metadata = json.metadata || {
      totalWeeks: 0,
      totalTrainings: 0,
      totalExercises: 0,
      allExerciseNames: [],
      dateRange: "",
      parsedDate: new Date().toISOString().split('T')[0]
    };

    // Rebuild indices
    this._weekIndex.clear();
    this._trainingIndex.clear();
    this._blockIndex.clear();

    for (const week of this.weeks) {
      this._weekIndex.set(week.id, week);

      for (const training of week.trainings) {
        this._trainingIndex.set(training.id, training);

        for (const block of training.blocks) {
          this._blockIndex.set(block.id, block);
        }
      }
    }

    return this;
  }

  /**
   * Search for exercises by name (partial match)
   */
  searchExercises(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    for (const week of this.weeks) {
      for (const training of week.trainings) {
        for (const block of training.blocks) {
          for (const exercise of block.exercises) {
            if (exercise.name.toLowerCase().includes(normalizedQuery)) {
              results.push({
                exercise: exercise,
                block: block,
                training: training,
                week: week
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Filter trainings by intensity
   */
  filterByIntensity(intensityPattern) {
    const results = [];
    const pattern = intensityPattern.toLowerCase();

    for (const week of this.weeks) {
      for (const training of week.trainings) {
        if (training.intensityPercent.toLowerCase().includes(pattern)) {
          results.push({
            training: training,
            week: week
          });
        }
      }
    }

    return results;
  }

  /**
   * Get statistics about the knowledge base
   */
  getStatistics() {
    let totalBlocks = 0;
    const blockTypes = new Map();
    const exerciseFrequency = new Map();

    for (const week of this.weeks) {
      for (const training of week.trainings) {
        totalBlocks += training.blocks.length;

        for (const block of training.blocks) {
          if (block.setType) {
            blockTypes.set(block.setType, (blockTypes.get(block.setType) || 0) + 1);
          }

          for (const exercise of block.exercises) {
            const name = exercise.name.toLowerCase();
            exerciseFrequency.set(name, (exerciseFrequency.get(name) || 0) + 1);
          }
        }
      }
    }

    // Get top 10 most frequent exercises
    const topExercises = Array.from(exerciseFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      totalWeeks: this.metadata.totalWeeks,
      totalTrainings: this.metadata.totalTrainings,
      totalBlocks: totalBlocks,
      totalExercises: this.metadata.totalExercises,
      uniqueExercises: this.metadata.allExerciseNames.length,
      blockTypes: Object.fromEntries(blockTypes),
      topExercises: topExercises
    };
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.KnowledgeBase = KnowledgeBase;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KnowledgeBase };
}
