/**
 * test-search.js - Comprehensive tests for search and filtering
 *
 * Tests CORRECTNESS and performance of the search system
 * Run with Node.js or in browser console
 */

// Import modules (for Node.js environment)
let TrainingSearch, MockKnowledgeBase;
let normalizeText, fuzzyMatch, trainingHasExercise, trainingHasAllExercises;
let trainingHasAnyExercise, extractIntensityValue, matchesIntensity;
let extractSetType, matchesSetType, getTrainingExercises;

// Try to load modules
try {
  const searchModule = require('../app/js/search.js');
  const filtersModule = require('../app/js/filters.js');

  TrainingSearch = searchModule.TrainingSearch;
  MockKnowledgeBase = searchModule.MockKnowledgeBase;

  normalizeText = filtersModule.normalizeText;
  fuzzyMatch = filtersModule.fuzzyMatch;
  trainingHasExercise = filtersModule.trainingHasExercise;
  trainingHasAllExercises = filtersModule.trainingHasAllExercises;
  trainingHasAnyExercise = filtersModule.trainingHasAnyExercise;
  extractIntensityValue = filtersModule.extractIntensityValue;
  matchesIntensity = filtersModule.matchesIntensity;
  extractSetType = filtersModule.extractSetType;
  matchesSetType = filtersModule.matchesSetType;
  getTrainingExercises = filtersModule.getTrainingExercises;
} catch (e) {
  console.log('Running in browser mode, using global variables');
}

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
  }

  assertArrayEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
    }
  }

  async run() {
    console.log('='.repeat(60));
    console.log('RUNNING SEARCH & FILTER TESTS');
    console.log('='.repeat(60));
    console.log('');

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.failed++;
        this.errors.push({ test: test.name, error: error.message });
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log(`RESULTS: ${this.passed} passed, ${this.failed} failed`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      console.log('\nFAILED TESTS:');
      for (const error of this.errors) {
        console.log(`  - ${error.test}: ${error.error}`);
      }
    }

    return this.failed === 0;
  }
}

// ============================================================================
// TESTS
// ============================================================================

const runner = new TestRunner();

// Test 1: Text normalization
runner.test('Text normalization works correctly', () => {
  runner.assertEqual(normalizeText('  Подтягивания  '), 'подтягивания', 'Should trim and lowercase');
  runner.assertEqual(normalizeText('Австралийские   Подтягивания'), 'австралийские подтягивания', 'Should normalize spaces');
  runner.assertEqual(normalizeText(''), '', 'Should handle empty string');
  runner.assertEqual(normalizeText(null), '', 'Should handle null');
});

// Test 2: Fuzzy matching
runner.test('Fuzzy matching for Cyrillic text', () => {
  runner.assert(fuzzyMatch('подтяг', 'подтягивания'), 'Should match partial');
  runner.assert(fuzzyMatch('австр', 'австралийские подтягивания'), 'Should match start of word');
  runner.assert(!fuzzyMatch('xyz', 'подтягивания'), 'Should not match unrelated');
  runner.assert(!fuzzyMatch('', 'подтягивания'), 'Empty query should not match');
});

// Test 3: Include filter (AND logic)
runner.test('Include filter - single exercise', () => {
  const search = new TrainingSearch();
  const results = search.search({ include: ['подтягивания'] });

  runner.assert(results.totalResults > 0, 'Should find trainings with подтягивания');
  runner.assert(results.results.every(r => {
    const exercises = getTrainingExercises(r.fullTraining);
    return exercises.some(ex => ex.includes('подтягивания'));
  }), 'All results should contain подтягивания');
});

// Test 4: Include filter - multiple exercises (AND logic)
runner.test('Include filter - multiple exercises (AND logic)', () => {
  const search = new TrainingSearch();
  const results = search.search({ include: ['подтягивания', 'отжимания'] });

  runner.assert(results.totalResults > 0, 'Should find trainings with both exercises');
  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    return trainingHasAllExercises(training, ['подтягивания', 'отжимания']);
  }), 'All results should contain BOTH подтягивания AND отжимания');
});

// Test 5: Exclude filter (NOT logic)
runner.test('Exclude filter - single exercise', () => {
  const search = new TrainingSearch();
  const results = search.search({ exclude: ['броски мяча'] });

  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    return !trainingHasExercise(training, 'броски мяча');
  }), 'No results should contain броски мяча');
});

// Test 6: Combined include + exclude
runner.test('Combined include + exclude filters', () => {
  const search = new TrainingSearch();
  const results = search.search({
    include: ['подтягивания'],
    exclude: ['броски мяча']
  });

  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    const hasIncluded = trainingHasExercise(training, 'подтягивания');
    const hasExcluded = trainingHasExercise(training, 'броски мяча');
    return hasIncluded && !hasExcluded;
  }), 'Results should have подтягивания but NOT броски мяча');
});

// Test 7: Intensity extraction
runner.test('Intensity extraction from strings', () => {
  const intensity1 = extractIntensityValue('60-70%');
  runner.assert(intensity1.min === 60 && intensity1.max === 70, 'Should extract range');

  const intensity2 = extractIntensityValue('жесткий кач');
  runner.assert(intensity2.level === 'high', 'Should extract level from text');

  const intensity3 = extractIntensityValue('на здоровье');
  runner.assert(intensity3.level === 'low', 'Should extract low level');
});

// Test 8: Intensity filtering
runner.test('Intensity filtering by percentage', () => {
  const search = new TrainingSearch();
  const results = search.search({
    intensity: { min: 60, max: 70 }
  });

  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    return matchesIntensity(training, { min: 60, max: 70 });
  }), 'All results should match intensity range');
});

// Test 9: Set type extraction
runner.test('Set type extraction from blocks', () => {
  const block1 = { restInfo: 'AMRAP 12 мин', setType: 'AMRAP' };
  const type1 = extractSetType(block1);
  runner.assert(type1 === 'amrap', 'Should extract AMRAP');

  const block2 = { rounds: 3, restInfo: 'сделать 3 раунда' };
  const type2 = extractSetType(block2);
  runner.assert(type2 === 'rounds', 'Should extract rounds');
});

// Test 10: Set type filtering
runner.test('Set type filtering', () => {
  const search = new TrainingSearch();
  const results = search.search({ setType: 'AMRAP' });

  runner.assert(results.totalResults > 0, 'Should find trainings with AMRAP');
  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    return matchesSetType(training, 'AMRAP');
  }), 'All results should have AMRAP blocks');
});

// Test 11: All filters combined
runner.test('All filters combined', () => {
  const search = new TrainingSearch();
  const results = search.search({
    include: ['подтягивания'],
    exclude: ['броски мяча'],
    intensity: { min: 60, max: 70 },
    setType: 'AMRAP'
  });

  // This is a very restrictive filter, may have no results
  runner.assert(results.results.every(r => {
    const training = r.fullTraining;
    return trainingHasExercise(training, 'подтягивания') &&
           !trainingHasExercise(training, 'броски мяча') &&
           matchesIntensity(training, { min: 60, max: 70 }) &&
           matchesSetType(training, 'AMRAP');
  }), 'All results should match ALL filters');
});

// Test 12: Exercise search/autocomplete
runner.test('Exercise search with autocomplete', () => {
  const search = new TrainingSearch();
  const results = search.searchExercises('подтяг');

  runner.assert(results.length > 0, 'Should find exercises');
  runner.assert(results.some(ex => ex.includes('подтягивания')), 'Should include подтягивания');
});

// Test 13: Exercise search - Cyrillic partial match
runner.test('Exercise search - Cyrillic partial match', () => {
  const search = new TrainingSearch();
  const results = search.searchExercises('австр');

  runner.assert(results.length > 0, 'Should find exercises starting with австр');
  runner.assert(results.some(ex => ex.includes('австралийские')), 'Should include австралийские exercises');
});

// Test 14: No false positives - strict include
runner.test('No false positives - strict include filter', () => {
  const search = new TrainingSearch();
  const results = search.search({ include: ['планка'] });

  // Only week_2_training_1 has планка
  runner.assert(results.totalResults === 1, 'Should find exactly one training with планка');
  runner.assert(results.results[0].trainingId === 'week_2_training_1', 'Should be week_2_training_1');
});

// Test 15: No false positives - strict exclude
runner.test('No false positives - strict exclude filter', () => {
  const search = new TrainingSearch();
  const allResults = search.search({});
  const excludedResults = search.search({ exclude: ['броски мяча'] });

  // week_1_training_2 has броски мяча, should be excluded
  runner.assert(excludedResults.totalResults < allResults.totalResults, 'Should exclude some trainings');
  runner.assert(!excludedResults.results.some(r => r.trainingId === 'week_1_training_2'),
    'Should NOT include week_1_training_2 (has броски мяча)');
});

// Test 16: Performance test
runner.test('Search performance < 100ms', () => {
  const search = new TrainingSearch();
  const startTime = performance.now();

  const results = search.search({
    include: ['подтягивания', 'отжимания'],
    exclude: ['броски мяча'],
    intensity: { min: 60, max: 70 }
  });

  const endTime = performance.now();
  const duration = endTime - startTime;

  runner.assert(duration < 100, `Search should be < 100ms, was ${duration.toFixed(2)}ms`);
});

// Test 17: Edge case - empty filters
runner.test('Edge case - empty filters return all trainings', () => {
  const search = new TrainingSearch();
  const results = search.search({});

  runner.assert(results.totalResults === 3, 'Should return all 3 trainings with empty filter');
});

// Test 18: Edge case - no results
runner.test('Edge case - no results with impossible filter', () => {
  const search = new TrainingSearch();
  const results = search.search({
    include: ['exercise-that-does-not-exist']
  });

  runner.assert(results.totalResults === 0, 'Should return 0 results for non-existent exercise');
});

// Test 19: Edge case - conflicting filters
runner.test('Edge case - conflicting filters (include and exclude same exercise)', () => {
  const search = new TrainingSearch();
  const results = search.search({
    include: ['подтягивания'],
    exclude: ['подтягивания']
  });

  runner.assert(results.totalResults === 0, 'Should return 0 results for conflicting filters');
});

// Test 20: Results sorting
runner.test('Results are sorted by week and training number', () => {
  const search = new TrainingSearch();
  const results = search.search({});

  for (let i = 1; i < results.results.length; i++) {
    const prev = results.results[i - 1];
    const curr = results.results[i];

    const isOrdered = (prev.weekNumber < curr.weekNumber) ||
                     (prev.weekNumber === curr.weekNumber && prev.trainingNumber <= curr.trainingNumber);

    runner.assert(isOrdered, 'Results should be sorted by week number, then training number');
  }
});

// Test 21: Case insensitive search
runner.test('Search is case insensitive', () => {
  const search = new TrainingSearch();
  const results1 = search.search({ include: ['ПОДТЯГИВАНИЯ'] });
  const results2 = search.search({ include: ['подтягивания'] });
  const results3 = search.search({ include: ['Подтягивания'] });

  runner.assertEqual(results1.totalResults, results2.totalResults, 'Uppercase should match');
  runner.assertEqual(results2.totalResults, results3.totalResults, 'Mixed case should match');
});

// Test 22: Partial matching works correctly
runner.test('Partial matching works correctly', () => {
  const search = new TrainingSearch();
  const results = search.search({ include: ['подтяг'] });

  runner.assert(results.totalResults > 0, 'Partial name should find trainings');
  runner.assert(results.results.every(r => {
    const exercises = getTrainingExercises(r.fullTraining);
    return exercises.some(ex => ex.includes('подтяг'));
  }), 'All results should contain exercise matching partial name');
});

// Test 23: Get training details
runner.test('Get training details by ID', () => {
  const search = new TrainingSearch();
  const details = search.getTrainingDetails('week_1_training_1');

  runner.assert(details !== null, 'Should find training');
  runner.assertEqual(details.trainingId, 'week_1_training_1', 'Should return correct training');
  runner.assert(details.summary.includes('blocks'), 'Should include summary');
});

// Test 24: Clear filters
runner.test('Clear filters returns all trainings', () => {
  const search = new TrainingSearch();

  // Apply some filters
  search.search({ include: ['подтягивания'] });

  // Clear filters
  const results = search.clearFilters();

  runner.assert(results.totalResults === 3, 'Should return all trainings after clearing');
  runner.assertEqual(Object.keys(search.currentFilters).length, 0, 'Current filters should be empty');
});

// Test 25: Results summary
runner.test('Get results summary', () => {
  const search = new TrainingSearch();
  search.search({ include: ['подтягивания'] });

  const summary = search.getResultsSummary();

  runner.assert(summary.totalResults > 0, 'Summary should have results count');
  runner.assert(summary.hasFilters === true, 'Should indicate filters are applied');
});

// ============================================================================
// RUN TESTS
// ============================================================================

// Run tests
(async () => {
  const success = await runner.run();

  if (typeof process !== 'undefined' && process.exit) {
    process.exit(success ? 0 : 1);
  }
})();

// Export for browser use
if (typeof window !== 'undefined') {
  window.TestRunner = TestRunner;
  window.runSearchTests = () => runner.run();
}
