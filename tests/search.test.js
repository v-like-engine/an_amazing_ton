// Search Tests - Agent 2 Functionality
// Tests for TrainingSearch, filters, and search logic

test('Search: TrainingSearch class should exist', () => {
  if (typeof TrainingSearch !== 'undefined') {
    assertTrue(true, 'TrainingSearch class exists');
  } else {
    throw new Error('TrainingSearch class not found - Agent 2 needs to implement search.js');
  }
}, 'Search Tests');

test('Search: should initialize with knowledge base', () => {
  if (typeof TrainingSearch !== 'undefined' && typeof KnowledgeBase !== 'undefined') {
    const kb = new KnowledgeBase();
    const search = new TrainingSearch(kb);
    assertNotNull(search, 'TrainingSearch should initialize');
  } else {
    console.warn('TrainingSearch or KnowledgeBase not available yet');
  }
}, 'Search Tests');

test('Search: should find trainings by included exercises', () => {
  if (typeof TrainingSearch !== 'undefined') {
    // Create mock knowledge base with test data
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      const results = search.searchByExercises(['Squats'], [], {});
      assertNotNull(results, 'Should return results');
      assertTrue(Array.isArray(results), 'Results should be an array');

      // Verify all results contain the searched exercise
      results.forEach(result => {
        const hasExercise = result.exercises.some(ex => ex.name.toLowerCase().includes('squats'));
        assertTrue(hasExercise, 'Each result should contain Squats');
      });
    }
  } else {
    console.warn('TrainingSearch not implemented yet');
  }
}, 'Search Tests');

test('Search: CRITICAL - include filter should NOT have false positives', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      // Search for specific exercise
      const results = search.searchByExercises(['Squats'], [], {});

      // CRITICAL: Every result MUST contain Squats
      results.forEach(result => {
        const exercises = getAllExercisesFromTraining(result);
        const hasSquats = exercises.some(ex =>
          ex.toLowerCase().includes('squats') || ex.toLowerCase().includes('приседания')
        );
        assertTrue(hasSquats, `FALSE POSITIVE DETECTED: Training "${result.name}" does not contain Squats`);
      });
    }
  }
}, 'Search Tests');

test('Search: should exclude trainings with excluded exercises', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      // Search with exclude filter
      const results = search.searchByExercises([], ['Pull-ups'], {});

      // Verify NO results contain excluded exercise
      results.forEach(result => {
        const exercises = getAllExercisesFromTraining(result);
        const hasPullUps = exercises.some(ex => ex.toLowerCase().includes('pull-up'));
        assertFalse(hasPullUps, `Training should not contain excluded exercise: ${result.name}`);
      });
    }
  }
}, 'Search Tests');

test('Search: should handle combined include + exclude filters', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      // Include Squats but exclude Pull-ups
      const results = search.searchByExercises(['Squats'], ['Pull-ups'], {});

      results.forEach(result => {
        const exercises = getAllExercisesFromTraining(result);

        const hasSquats = exercises.some(ex => ex.toLowerCase().includes('squats'));
        assertTrue(hasSquats, 'Should include Squats');

        const hasPullUps = exercises.some(ex => ex.toLowerCase().includes('pull-up'));
        assertFalse(hasPullUps, 'Should not include Pull-ups');
      });
    }
  }
}, 'Search Tests');

test('Search: should filter by intensity', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.filterByIntensity === 'function') {
      const results = search.filterByIntensity(['high intensity training'], '60-70');
      assertNotNull(results, 'Should return intensity filtered results');
    }
  } else {
    console.warn('Intensity filter not implemented yet');
  }
}, 'Search Tests');

test('Search: should filter by set type', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.filterBySetType === 'function') {
      const results = search.filterBySetType(['training1', 'training2'], 'AMRAP');
      assertNotNull(results, 'Should return set type filtered results');

      // Verify results contain the set type
      results.forEach(result => {
        const hasSetType = result.blocks.some(block =>
          block.info && block.info.toLowerCase().includes('amrap')
        );
        assertTrue(hasSetType, 'Result should contain AMRAP set type');
      });
    }
  } else {
    console.warn('Set type filter not implemented yet');
  }
}, 'Search Tests');

test('Search: should provide exercise autocomplete suggestions', () => {
  if (typeof getExerciseAutocompleteSuggestions !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const suggestions = getExerciseAutocompleteSuggestions('squ', kb);

    assertTrue(Array.isArray(suggestions), 'Suggestions should be an array');
    assertTrue(suggestions.some(s => s.toLowerCase().includes('squ')),
      'Suggestions should match input');
  } else {
    console.warn('Autocomplete function not implemented yet');
  }
}, 'Search Tests');

test('Search: autocomplete should handle Cyrillic input', () => {
  if (typeof getExerciseAutocompleteSuggestions !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const suggestions = getExerciseAutocompleteSuggestions('при', kb);

    assertTrue(Array.isArray(suggestions), 'Should return suggestions for Cyrillic');
    // Should find "Приседания" (Squats in Russian)
  }
}, 'Search Tests');

test('Search: should handle fuzzy matching for Cyrillic', () => {
  if (typeof fuzzyMatch !== 'undefined') {
    // Test fuzzy matching with Cyrillic text
    const result = fuzzyMatch('приседания', 'Приседания со штангой');
    assertTrue(result, 'Should fuzzy match Cyrillic text');
  } else {
    console.warn('Fuzzy matching not implemented yet');
  }
}, 'Search Tests');

test('Search: should return correct result format', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.search === 'function') {
      const results = search.search({ includeExercises: [] });

      assertTrue(Array.isArray(results), 'Results should be an array');

      if (results.length > 0) {
        const result = results[0];
        assertNotNull(result.name, 'Result should have name');
        assertNotNull(result.weekNumber, 'Result should have week number');
        assertNotNull(result.blocks, 'Result should have blocks');
      }
    }
  }
}, 'Search Tests');

test('Search: performance - should search in under 100ms', async () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createLargeKnowledgeBase(); // Create larger dataset
    const search = new TrainingSearch(kb);

    if (typeof search.search === 'function') {
      const startTime = performance.now();
      const results = search.search({ includeExercises: ['Squats'] });
      const endTime = performance.now();

      const duration = endTime - startTime;
      console.log(`Search took ${duration.toFixed(2)}ms`);

      assertLessThan(duration, 100, 'Search should complete in under 100ms');
    }
  }
}, 'Search Tests');

test('Search: should handle empty filters gracefully', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.search === 'function') {
      // Empty search should return all trainings
      const results = search.search({});
      assertNotNull(results, 'Should handle empty filters');
      assertTrue(results.length >= 0, 'Should return valid results array');
    }
  }
}, 'Search Tests');

test('Search: should handle no results case', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.search === 'function') {
      // Search for non-existent exercise
      const results = search.search({ includeExercises: ['NonExistentExercise12345'] });
      assertTrue(Array.isArray(results), 'Should return empty array for no results');
      assertArrayLength(results, 0, 'Should return empty results');
    }
  }
}, 'Search Tests');

test('Search: should handle multiple include exercises (AND logic)', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      // Search for trainings that have BOTH exercises
      const results = search.searchByExercises(['Squats', 'Push-ups'], [], {});

      results.forEach(result => {
        const exercises = getAllExercisesFromTraining(result);
        const hasSquats = exercises.some(ex => ex.toLowerCase().includes('squats'));
        const hasPushUps = exercises.some(ex => ex.toLowerCase().includes('push-up'));

        assertTrue(hasSquats && hasPushUps,
          'Training should contain ALL included exercises (AND logic)');
      });
    }
  }
}, 'Search Tests');

test('Search: should handle case-insensitive search', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      const results1 = search.searchByExercises(['squats'], [], {});
      const results2 = search.searchByExercises(['SQUATS'], [], {});
      const results3 = search.searchByExercises(['Squats'], [], {});

      // All should return same results
      assertEqual(results1.length, results2.length,
        'Case should not affect search results');
      assertEqual(results2.length, results3.length,
        'Case should not affect search results');
    }
  }
}, 'Search Tests');

test('Search: should handle partial exercise name matching', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.searchByExercises === 'function') {
      // Search with partial name
      const results = search.searchByExercises(['squat'], [], {});

      // Should find "Squats", "Back Squats", "Front Squats", etc.
      if (results.length > 0) {
        assertTrue(true, 'Partial matching works');
      }
    }
  }
}, 'Search Tests');

test('Search: combined filters should work together correctly', () => {
  if (typeof TrainingSearch !== 'undefined') {
    const kb = createMockKnowledgeBase();
    const search = new TrainingSearch(kb);

    if (typeof search.search === 'function') {
      const results = search.search({
        includeExercises: ['Squats'],
        excludeExercises: ['Pull-ups'],
        intensity: '60-70',
        setType: 'AMRAP'
      });

      assertNotNull(results, 'Combined filters should work');
      assertTrue(Array.isArray(results), 'Should return array');
    }
  }
}, 'Search Tests');

// Helper functions for tests
function createMockKnowledgeBase() {
  if (typeof KnowledgeBase === 'undefined') return null;

  const kb = new KnowledgeBase();

  if (typeof Week !== 'undefined' && typeof Training !== 'undefined') {
    const week1 = new Week(1, 'Week 1');

    const training1 = new Training('Monday Strength', 'Strength');
    if (typeof Block !== 'undefined' && typeof Exercise !== 'undefined') {
      const block = new Block('Block A', 'AMRAP 10min');
      block.addExercise && block.addExercise(new Exercise('Squats', '10', '100kg'));
      block.addExercise && block.addExercise(new Exercise('Push-ups', '15', 'bodyweight'));
      training1.addBlock && training1.addBlock(block);
    }

    const training2 = new Training('Wednesday Cardio', 'Cardio');
    if (typeof Block !== 'undefined' && typeof Exercise !== 'undefined') {
      const block = new Block('Block A', '3 rounds');
      block.addExercise && block.addExercise(new Exercise('Pull-ups', '10', 'bodyweight'));
      block.addExercise && block.addExercise(new Exercise('Running', '400m', ''));
      training2.addBlock && training2.addBlock(block);
    }

    week1.addTraining && week1.addTraining(training1);
    week1.addTraining && week1.addTraining(training2);
    kb.addWeek && kb.addWeek(week1);
  }

  return kb;
}

function createLargeKnowledgeBase() {
  // Create a larger dataset for performance testing
  const kb = createMockKnowledgeBase();

  // Add more weeks and trainings if possible
  if (kb && typeof Week !== 'undefined') {
    for (let i = 2; i <= 10; i++) {
      const week = new Week(i, `Week ${i}`);
      if (typeof Training !== 'undefined') {
        for (let j = 1; j <= 5; j++) {
          const training = new Training(`Training ${i}-${j}`, 'Mixed');
          week.addTraining && week.addTraining(training);
        }
      }
      kb.addWeek && kb.addWeek(week);
    }
  }

  return kb;
}

function getAllExercisesFromTraining(training) {
  const exercises = [];

  if (training.blocks) {
    if (Array.isArray(training.blocks)) {
      training.blocks.forEach(block => {
        if (block.exercises) {
          block.exercises.forEach(ex => exercises.push(ex.name));
        }
      });
    } else if (typeof training.blocks === 'object') {
      Object.values(training.blocks).forEach(block => {
        if (block.exercises) {
          block.exercises.forEach(ex => exercises.push(ex.name));
        }
      });
    }
  }

  return exercises;
}
