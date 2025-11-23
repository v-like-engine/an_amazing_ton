/**
 * search.js - Training Search Engine
 *
 * This module provides the main search and filtering functionality.
 * Focus: ACCURACY and NO FALSE POSITIVES
 *
 * Performance target: <100ms for all searches
 * Correctness: Better to miss a result than show wrong ones
 */

// ============================================================================
// IMPORTS (filter functions from filters.js)
// ============================================================================

// Import filter functions (Node.js)
let normalizeText, fuzzyMatch, getTrainingExercises;
let trainingHasExercise, trainingHasAllExercises, trainingHasAnyExercise;
let extractIntensityValue, matchesIntensity;
let extractSetType, matchesSetType;

if (typeof require !== 'undefined') {
  // Node.js environment
  const filtersModule = require('./filters.js');
  normalizeText = filtersModule.normalizeText;
  fuzzyMatch = filtersModule.fuzzyMatch;
  getTrainingExercises = filtersModule.getTrainingExercises;
  trainingHasExercise = filtersModule.trainingHasExercise;
  trainingHasAllExercises = filtersModule.trainingHasAllExercises;
  trainingHasAnyExercise = filtersModule.trainingHasAnyExercise;
  extractIntensityValue = filtersModule.extractIntensityValue;
  matchesIntensity = filtersModule.matchesIntensity;
  extractSetType = filtersModule.extractSetType;
  matchesSetType = filtersModule.matchesSetType;
}
// In browser, these functions will be available globally from filters.js

// ============================================================================
// MOCK KNOWLEDGE BASE (for development until Agent 1 creates real one)
// ============================================================================

/**
 * Mock KnowledgeBase class for development
 * This will be replaced by Agent 1's real KnowledgeBase
 */
class MockKnowledgeBase {
  constructor() {
    this.weeks = [
      {
        id: 'week_1',
        weekNumber: 1,
        dateRange: '8-14.01',
        description: '1 неделя жесткого кача',
        trainings: [
          {
            id: 'week_1_training_1',
            weekId: 'week_1',
            trainingNumber: 1,
            intensityPercent: '60-70%',
            date: '8.01',
            blocks: [
              {
                id: 'block_1',
                blockNumber: 1,
                rounds: 1,
                restInfo: '',
                setType: null,
                exercises: [
                  { id: 'ex_1', name: 'австралийские анжуманя', repetitions: '30', weight: '' },
                  { id: 'ex_2', name: 'подтягивания', repetitions: '10', weight: '' },
                  { id: 'ex_3', name: 'отжимания', repetitions: '20', weight: '' }
                ]
              },
              {
                id: 'block_2',
                blockNumber: 2,
                rounds: 4,
                restInfo: 'каждые 2-3 минуты',
                setType: 'every_x_min',
                exercises: [
                  { id: 'ex_4', name: 'приседания', repetitions: '30', weight: '' },
                  { id: 'ex_5', name: 'выпады', repetitions: '20/20', weight: '' }
                ]
              }
            ]
          },
          {
            id: 'week_1_training_2',
            weekId: 'week_1',
            trainingNumber: 2,
            intensityPercent: '60-70%',
            date: '10.01',
            blocks: [
              {
                id: 'block_1',
                blockNumber: 1,
                rounds: 1,
                restInfo: 'AMRAP 12 мин',
                setType: 'AMRAP',
                exercises: [
                  { id: 'ex_1', name: 'подтягивания', repetitions: '5', weight: '' },
                  { id: 'ex_2', name: 'отжимания', repetitions: '10', weight: '' },
                  { id: 'ex_3', name: 'броски мяча', repetitions: '15', weight: '8 кг' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'week_2',
        weekNumber: 2,
        dateRange: '15-21.01',
        description: '2 неделя на здоровье',
        trainings: [
          {
            id: 'week_2_training_1',
            weekId: 'week_2',
            trainingNumber: 1,
            intensityPercent: '50-60%',
            date: '15.01',
            blocks: [
              {
                id: 'block_1',
                blockNumber: 1,
                rounds: 3,
                restInfo: 'сделать 3 раунда',
                setType: 'rounds',
                exercises: [
                  { id: 'ex_1', name: 'подтягивания', repetitions: '8', weight: '' },
                  { id: 'ex_2', name: 'приседания', repetitions: '25', weight: '' },
                  { id: 'ex_3', name: 'планка', repetitions: '60 сек', weight: '' }
                ]
              }
            ]
          }
        ]
      }
    ];

    this.metadata = {
      totalWeeks: 2,
      totalTrainings: 3,
      allExerciseNames: [
        'австралийские анжуманя',
        'подтягивания',
        'отжимания',
        'приседания',
        'выпады',
        'броски мяча',
        'планка'
      ]
    };
  }

  getAllExerciseNames() {
    return this.metadata.allExerciseNames || [];
  }

  getAllTrainings() {
    const trainings = [];
    for (const week of this.weeks) {
      for (const training of week.trainings) {
        // Add week context to training
        trainings.push({
          ...training,
          weekNumber: week.weekNumber,
          weekDateRange: week.dateRange,
          weekDescription: week.description
        });
      }
    }
    return trainings;
  }

  getTraining(trainingId) {
    for (const week of this.weeks) {
      const training = week.trainings.find(t => t.id === trainingId);
      if (training) {
        return {
          ...training,
          weekNumber: week.weekNumber,
          weekDateRange: week.dateRange,
          weekDescription: week.description
        };
      }
    }
    return null;
  }
}

// ============================================================================
// TRAINING SEARCH CLASS
// ============================================================================

/**
 * Main search engine for trainings
 */
class TrainingSearch {
  constructor(knowledgeBase) {
    // Use provided knowledge base or create mock for development
    this.kb = knowledgeBase || new MockKnowledgeBase();
    this.currentFilters = {};
    this.currentResults = [];
  }

  /**
   * Main search function - applies all filters and returns matching trainings
   * @param {object} filters - Filter object:
   *   {
   *     include: ['exercise1', 'exercise2'],  // Must have ALL these exercises
   *     exclude: ['exercise3'],               // Must NOT have ANY of these
   *     intensity: { min: 60, max: 70 },      // Intensity range
   *     setType: 'AMRAP'                       // Set type
   *   }
   * @returns {object} Search results with metadata
   */
  search(filters = {}) {
    const startTime = performance.now();

    // Store current filters
    this.currentFilters = filters;

    // Get all trainings
    let results = this.kb.getAllTrainings();

    // Apply filters in sequence
    // Order matters for performance: most restrictive first

    // 1. Apply exercise INCLUDE filter (most restrictive - AND logic)
    if (filters.include && filters.include.length > 0) {
      results = this.filterByExercisesInclude(results, filters.include);
    }

    // 2. Apply exercise EXCLUDE filter (also very restrictive)
    if (filters.exclude && filters.exclude.length > 0) {
      results = this.filterByExercisesExclude(results, filters.exclude);
    }

    // 3. Apply intensity filter
    if (filters.intensity) {
      results = this.filterByIntensity(results, filters.intensity);
    }

    // 4. Apply set type filter
    if (filters.setType) {
      results = this.filterBySetType(results, filters.setType);
    }

    // Sort results by week number, then training number
    results.sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) {
        return a.weekNumber - b.weekNumber;
      }
      return a.trainingNumber - b.trainingNumber;
    });

    // Enhance results with metadata
    const enhancedResults = results.map(training => this._enhanceResult(training, filters));

    // Store results
    this.currentResults = enhancedResults;

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Return results with metadata
    return {
      results: enhancedResults,
      totalResults: enhancedResults.length,
      filters: filters,
      searchTime: searchTime,
      performance: {
        timeMs: searchTime,
        isOptimal: searchTime < 100
      }
    };
  }

  /**
   * Search for exercises in the exercise list (for autocomplete)
   * @param {string} query - Search query
   * @returns {string[]} Matching exercise names
   */
  searchExercises(query) {
    if (!query || query.trim() === '') {
      return this.kb.getAllExerciseNames();
    }

    const allExercises = this.kb.getAllExerciseNames();
    const normalizedQuery = normalizeText(query);

    // Filter exercises that match the query
    const matches = allExercises.filter(exercise => {
      const normalizedExercise = normalizeText(exercise);

      // Exact match or substring match (highest priority)
      if (normalizedExercise.includes(normalizedQuery)) {
        return true;
      }

      // Fuzzy match (lower priority)
      return fuzzyMatch(normalizedQuery, normalizedExercise);
    });

    // Sort by relevance: exact matches first, then by length
    matches.sort((a, b) => {
      const aNorm = normalizeText(a);
      const bNorm = normalizeText(b);

      // Exact matches first
      const aExact = aNorm === normalizedQuery;
      const bExact = bNorm === normalizedQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with query
      const aStarts = aNorm.startsWith(normalizedQuery);
      const bStarts = bNorm.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Shorter names first (more specific)
      return a.length - b.length;
    });

    return matches;
  }

  /**
   * Filter trainings by included exercises (AND logic - must have ALL)
   * @param {array} trainings - Array of trainings
   * @param {array} exerciseNames - Exercise names to include
   * @returns {array} Filtered trainings
   */
  filterByExercisesInclude(trainings, exerciseNames) {
    if (!exerciseNames || exerciseNames.length === 0) {
      return trainings;
    }

    return trainings.filter(training =>
      trainingHasAllExercises(training, exerciseNames)
    );
  }

  /**
   * Filter trainings by excluded exercises (NOT logic - must NOT have ANY)
   * @param {array} trainings - Array of trainings
   * @param {array} exerciseNames - Exercise names to exclude
   * @returns {array} Filtered trainings
   */
  filterByExercisesExclude(trainings, exerciseNames) {
    if (!exerciseNames || exerciseNames.length === 0) {
      return trainings;
    }

    return trainings.filter(training =>
      !trainingHasAnyExercise(training, exerciseNames)
    );
  }

  /**
   * Filter trainings by intensity
   * @param {array} trainings - Array of trainings
   * @param {object} intensityFilter - Intensity filter
   * @returns {array} Filtered trainings
   */
  filterByIntensity(trainings, intensityFilter) {
    if (!intensityFilter) {
      return trainings;
    }

    return trainings.filter(training =>
      matchesIntensity(training, intensityFilter)
    );
  }

  /**
   * Filter trainings by set type
   * @param {array} trainings - Array of trainings
   * @param {string} setType - Set type to filter by
   * @returns {array} Filtered trainings
   */
  filterBySetType(trainings, setType) {
    if (!setType) {
      return trainings;
    }

    return trainings.filter(training =>
      matchesSetType(training, setType)
    );
  }

  /**
   * Get details for a specific training
   * @param {string} trainingId - Training ID
   * @returns {object|null} Training details or null
   */
  getTrainingDetails(trainingId) {
    const training = this.kb.getTraining(trainingId);

    if (!training) {
      return null;
    }

    return this._enhanceResult(training, this.currentFilters);
  }

  /**
   * Get summary of current search results
   * @returns {object} Summary object
   */
  getResultsSummary() {
    return {
      totalResults: this.currentResults.length,
      filters: this.currentFilters,
      hasFilters: Object.keys(this.currentFilters).some(key =>
        this.currentFilters[key] && this.currentFilters[key].length > 0
      )
    };
  }

  /**
   * Clear all filters and return all trainings
   * @returns {object} Search results with all trainings
   */
  clearFilters() {
    this.currentFilters = {};
    return this.search({});
  }

  /**
   * Enhance result with metadata for display
   * @private
   * @param {object} training - Training object
   * @param {object} filters - Applied filters
   * @returns {object} Enhanced result
   */
  _enhanceResult(training, filters) {
    // Get matched exercises (for include filter)
    const matchedExercises = [];
    if (filters.include && filters.include.length > 0) {
      const trainingExercises = getTrainingExercises(training);
      for (const filterEx of filters.include) {
        const normalized = normalizeText(filterEx);
        const found = trainingExercises.find(ex => ex.includes(normalized));
        if (found) {
          matchedExercises.push(found);
        }
      }
    }

    // Count blocks and exercises
    const totalBlocks = training.blocks ? training.blocks.length : 0;
    const totalExercises = training.blocks
      ? training.blocks.reduce((sum, block) => sum + (block.exercises ? block.exercises.length : 0), 0)
      : 0;

    // Get preview text (first few exercises)
    const previewExercises = [];
    if (training.blocks && training.blocks.length > 0) {
      for (const block of training.blocks) {
        if (block.exercises) {
          for (const exercise of block.exercises) {
            previewExercises.push(exercise.name);
            if (previewExercises.length >= 3) break;
          }
        }
        if (previewExercises.length >= 3) break;
      }
    }

    return {
      trainingId: training.id,
      weekId: training.weekId,
      weekNumber: training.weekNumber,
      weekDateRange: training.weekDateRange,
      weekDescription: training.weekDescription,
      trainingNumber: training.trainingNumber,
      trainingDate: training.date || '',
      intensity: training.intensityPercent || '',
      matchedExercises: matchedExercises,
      summary: `${totalBlocks} blocks, ${totalExercises} exercises`,
      previewText: previewExercises.join(', '),
      // Include full training data for navigation
      fullTraining: training
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for use in browser and tests
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (for testing)
  module.exports = {
    TrainingSearch,
    MockKnowledgeBase
  };
}
