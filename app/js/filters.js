/**
 * filters.js - Filter Helper Functions for Training Search
 *
 * This module provides all filtering functions for the training search system.
 * Focus: CORRECTNESS - no false positives!
 *
 * Key principles:
 * - Case-insensitive matching
 * - Partial matching for exercise names
 * - Cyrillic text support
 * - Better to miss a result than show wrong ones
 */

// ============================================================================
// TEXT NORMALIZATION & UTILITIES
// ============================================================================

/**
 * Normalize text for comparison
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text (lowercase, trimmed, single spaces)
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

/**
 * Fuzzy matching for Cyrillic text
 * Supports partial matching and common typos
 * @param {string} query - Search query
 * @param {string} text - Text to search in
 * @returns {boolean} True if query matches text
 */
function fuzzyMatch(query, text) {
  if (!query || !text) {
    return false;
  }

  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);

  // Empty query matches nothing (to avoid false positives)
  if (normalizedQuery === '') {
    return false;
  }

  // Exact substring match (most common case)
  if (normalizedText.includes(normalizedQuery)) {
    return true;
  }

  // For very short queries (1-2 chars), require exact match to avoid false positives
  if (normalizedQuery.length <= 2) {
    return normalizedText === normalizedQuery ||
           normalizedText.startsWith(normalizedQuery + ' ') ||
           normalizedText.endsWith(' ' + normalizedQuery);
  }

  // For longer queries, allow some flexibility
  // Check if all characters from query appear in order in text
  let textIndex = 0;
  for (let i = 0; i < normalizedQuery.length; i++) {
    const char = normalizedQuery[i];
    const foundIndex = normalizedText.indexOf(char, textIndex);

    if (foundIndex === -1) {
      return false;
    }

    textIndex = foundIndex + 1;
  }

  return true;
}

/**
 * Extract all exercise names from a training
 * @param {object} training - Training object
 * @returns {string[]} Array of normalized exercise names
 */
function getTrainingExercises(training) {
  if (!training || !training.blocks || !Array.isArray(training.blocks)) {
    return [];
  }

  const exercises = [];

  for (const block of training.blocks) {
    if (block.exercises && Array.isArray(block.exercises)) {
      for (const exercise of block.exercises) {
        if (exercise.name) {
          exercises.push(normalizeText(exercise.name));
        }
      }
    }
  }

  return exercises;
}

// ============================================================================
// EXERCISE MATCHING FUNCTIONS
// ============================================================================

/**
 * Check if training contains a specific exercise
 * @param {object} training - Training object
 * @param {string} exerciseName - Exercise name to search for
 * @returns {boolean} True if training contains the exercise
 */
function trainingHasExercise(training, exerciseName) {
  if (!training || !exerciseName) {
    return false;
  }

  const normalizedSearch = normalizeText(exerciseName);
  const trainingExercises = getTrainingExercises(training);

  // Check if any exercise in the training matches
  return trainingExercises.some(exercise => {
    // Support partial matching (e.g., "подтяг" matches "подтягивания")
    return exercise.includes(normalizedSearch) ||
           normalizedSearch.includes(exercise) ||
           fuzzyMatch(normalizedSearch, exercise);
  });
}

/**
 * Check if training contains ALL specified exercises (AND logic)
 * This is for the INCLUDE filter
 * @param {object} training - Training object
 * @param {string[]} exerciseNames - Array of exercise names (all must be present)
 * @returns {boolean} True if training contains ALL exercises
 */
function trainingHasAllExercises(training, exerciseNames) {
  if (!training) {
    return false;
  }

  // Empty filter means no restriction (return true)
  if (!exerciseNames || exerciseNames.length === 0) {
    return true;
  }

  // Check if ALL exercises are present
  return exerciseNames.every(exerciseName =>
    trainingHasExercise(training, exerciseName)
  );
}

/**
 * Check if training contains ANY of the specified exercises (OR logic)
 * This is for the EXCLUDE filter
 * @param {object} training - Training object
 * @param {string[]} exerciseNames - Array of exercise names (any present = match)
 * @returns {boolean} True if training contains ANY of the exercises
 */
function trainingHasAnyExercise(training, exerciseNames) {
  if (!training) {
    return false;
  }

  // Empty filter means no restriction (return false - nothing to exclude)
  if (!exerciseNames || exerciseNames.length === 0) {
    return false;
  }

  // Check if ANY exercise is present
  return exerciseNames.some(exerciseName =>
    trainingHasExercise(training, exerciseName)
  );
}

// ============================================================================
// INTENSITY MATCHING FUNCTIONS
// ============================================================================

/**
 * Extract intensity value from string
 * @param {string} intensityString - Intensity string (e.g., "60-70%", "жесткий")
 * @returns {object|null} { min: number, max: number } or { level: string } or null
 */
function extractIntensityValue(intensityString) {
  if (!intensityString || typeof intensityString !== 'string') {
    return null;
  }

  const normalized = normalizeText(intensityString);

  // Try to extract percentage range (e.g., "60-70%")
  const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)\s*%?/);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1], 10),
      max: parseInt(rangeMatch[2], 10)
    };
  }

  // Try to extract single percentage (e.g., "70%")
  const singleMatch = normalized.match(/(\d+)\s*%/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1], 10);
    return {
      min: value,
      max: value
    };
  }

  // Try to extract intensity level from text
  const levelKeywords = {
    'жесткий': 'high',
    'кач': 'high',
    'здоровье': 'low',
    'легкий': 'low',
    'средний': 'medium',
    'умеренный': 'medium'
  };

  for (const [keyword, level] of Object.entries(levelKeywords)) {
    if (normalized.includes(keyword)) {
      return { level };
    }
  }

  return null;
}

/**
 * Check if training matches intensity filter
 * @param {object} training - Training object
 * @param {object} intensityFilter - Filter: { min: 60, max: 70 } or { level: "high" }
 * @returns {boolean} True if training matches intensity criteria
 */
function matchesIntensity(training, intensityFilter) {
  if (!training || !intensityFilter) {
    return true; // No filter means all pass
  }

  // Get intensity from training
  let trainingIntensity = null;

  // Try from intensityPercent field
  if (training.intensityPercent) {
    trainingIntensity = extractIntensityValue(training.intensityPercent);
  }

  // Try from week description if not found
  if (!trainingIntensity && training.weekDescription) {
    trainingIntensity = extractIntensityValue(training.weekDescription);
  }

  if (!trainingIntensity) {
    return false; // Can't determine intensity, exclude from results
  }

  // Match by percentage range
  if (intensityFilter.min !== undefined || intensityFilter.max !== undefined) {
    if (!trainingIntensity.min || !trainingIntensity.max) {
      return false; // Filter is percentage-based but training doesn't have percentage
    }

    const filterMin = intensityFilter.min || 0;
    const filterMax = intensityFilter.max || 100;

    // Check if ranges overlap
    return trainingIntensity.max >= filterMin &&
           trainingIntensity.min <= filterMax;
  }

  // Match by level
  if (intensityFilter.level) {
    if (!trainingIntensity.level) {
      return false; // Filter is level-based but training doesn't have level
    }

    return trainingIntensity.level === intensityFilter.level;
  }

  return true;
}

// ============================================================================
// SET TYPE MATCHING FUNCTIONS
// ============================================================================

/**
 * Extract set type from block info
 * @param {object} block - Block object
 * @returns {string|null} Set type (e.g., "AMRAP", "rounds", "timed") or null
 */
function extractSetType(block) {
  if (!block) {
    return null;
  }

  // Check explicit setType field
  if (block.setType) {
    return normalizeText(block.setType);
  }

  // Check restInfo for patterns
  if (block.restInfo) {
    const restInfo = normalizeText(block.restInfo);

    if (restInfo.includes('amrap')) {
      return 'amrap';
    }

    if (restInfo.includes('каждые') && restInfo.includes('минут')) {
      return 'every_x_min';
    }

    if (restInfo.includes('раунд')) {
      return 'rounds';
    }

    if (restInfo.match(/\d+\s*мин/)) {
      return 'timed';
    }
  }

  // Check rounds field
  if (block.rounds && block.rounds > 1) {
    return 'rounds';
  }

  return null;
}

/**
 * Check if training matches set type filter
 * @param {object} training - Training object
 * @param {string} setType - Set type to filter by (e.g., "AMRAP", "rounds")
 * @returns {boolean} True if any block in training matches set type
 */
function matchesSetType(training, setType) {
  if (!training || !setType) {
    return true; // No filter means all pass
  }

  if (!training.blocks || !Array.isArray(training.blocks)) {
    return false;
  }

  const normalizedFilter = normalizeText(setType);

  // Check if ANY block matches the set type
  return training.blocks.some(block => {
    const blockSetType = extractSetType(block);

    if (!blockSetType) {
      return false;
    }

    // Support partial matching (e.g., "amrap" matches "AMRAP")
    return blockSetType.includes(normalizedFilter) ||
           normalizedFilter.includes(blockSetType);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export all functions for use in search.js and tests
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (for testing)
  module.exports = {
    normalizeText,
    fuzzyMatch,
    getTrainingExercises,
    trainingHasExercise,
    trainingHasAllExercises,
    trainingHasAnyExercise,
    extractIntensityValue,
    matchesIntensity,
    extractSetType,
    matchesSetType
  };
}
