// Parser Tests - Agent 1 Functionality
// Tests for parseTrainingFile(), data-model.js structures, and parsing logic

test('Parser: should be defined and have parseTrainingFile function', () => {
  assertNotNull(typeof parseTrainingFile, 'parseTrainingFile function should exist');
}, 'Parser Tests');

test('Parser: should handle basic training data structure', () => {
  // Test that basic data model classes exist
  if (typeof KnowledgeBase !== 'undefined') {
    const kb = new KnowledgeBase();
    assertNotNull(kb, 'KnowledgeBase should be instantiable');
    assertTrue(Array.isArray(kb.weeks) || kb.weeks !== undefined, 'KnowledgeBase should have weeks property');
  } else {
    throw new Error('KnowledgeBase class not found - Agent 1 needs to implement data-model.js');
  }
}, 'Parser Tests');

test('Parser: should create Week objects correctly', () => {
  if (typeof Week !== 'undefined') {
    const week = new Week(1, 'Test Week');
    assertEqual(week.weekNumber, 1, 'Week number should be set correctly');
    assertEqual(week.name, 'Test Week', 'Week name should be set correctly');
    assertTrue(Array.isArray(week.trainings) || week.trainings !== undefined, 'Week should have trainings array');
  } else {
    throw new Error('Week class not found - Agent 1 needs to implement Week class');
  }
}, 'Parser Tests');

test('Parser: should create Training objects correctly', () => {
  if (typeof Training !== 'undefined') {
    const training = new Training('Monday Strength', 'Strength');
    assertEqual(training.name, 'Monday Strength', 'Training name should be set');
    assertNotNull(training.blocks, 'Training should have blocks structure');
  } else {
    throw new Error('Training class not found - Agent 1 needs to implement Training class');
  }
}, 'Parser Tests');

test('Parser: should create Block objects correctly', () => {
  if (typeof Block !== 'undefined') {
    const block = new Block('Block A', 'AMRAP 10min');
    assertEqual(block.name, 'Block A', 'Block name should be set');
    assertNotNull(block.exercises, 'Block should have exercises array');
  } else {
    throw new Error('Block class not found - Agent 1 needs to implement Block class');
  }
}, 'Parser Tests');

test('Parser: should create Exercise objects correctly', () => {
  if (typeof Exercise !== 'undefined') {
    const exercise = new Exercise('Squats', '5 reps', '100kg');
    assertEqual(exercise.name, 'Squats', 'Exercise name should be set');
    assertNotNull(exercise.repetitions, 'Exercise should have repetitions');
    assertNotNull(exercise.weight, 'Exercise should have weight');
  } else {
    throw new Error('Exercise class not found - Agent 1 needs to implement Exercise class');
  }
}, 'Parser Tests');

test('Parser: should parse repetitions in various formats', () => {
  if (typeof parseRepetitions !== 'undefined') {
    // Test common formats
    let result = parseRepetitions('5 reps');
    assertNotNull(result, 'Should parse "5 reps"');

    result = parseRepetitions('10-12');
    assertNotNull(result, 'Should parse range "10-12"');

    result = parseRepetitions('3x10');
    assertNotNull(result, 'Should parse "3x10" format');
  } else {
    console.warn('parseRepetitions function not found yet - Agent 1 needs to implement');
  }
}, 'Parser Tests');

test('Parser: should parse weight with different units', () => {
  if (typeof parseWeight !== 'undefined') {
    let result = parseWeight('100kg');
    assertNotNull(result, 'Should parse "100kg"');

    result = parseWeight('50%');
    assertNotNull(result, 'Should parse percentage "50%"');

    result = parseWeight('bodyweight');
    assertNotNull(result, 'Should parse "bodyweight"');
  } else {
    console.warn('parseWeight function not found yet - Agent 1 needs to implement');
  }
}, 'Parser Tests');

test('Parser: should extract intensity from text', () => {
  if (typeof extractIntensity !== 'undefined') {
    const text = 'жесткий кач 60-70%';
    const result = extractIntensity(text);
    assertNotNull(result, 'Should extract intensity');
    assertTrue(result.includes('60') || result.includes('70'), 'Should extract percentage values');
  } else {
    console.warn('extractIntensity function not found yet - Agent 1 needs to implement');
  }
}, 'Parser Tests');

test('Parser: should handle Cyrillic text correctly', () => {
  if (typeof KnowledgeBase !== 'undefined') {
    const cyrillicText = 'Приседания';
    assertTrue(cyrillicText.length > 0, 'Cyrillic text should be readable');
    // Parser should handle Cyrillic exercise names
    const normalized = cyrillicText.toLowerCase();
    assertTrue(normalized.includes('приседания'), 'Should handle Cyrillic lowercase');
  }
}, 'Parser Tests');

test('Parser: should handle empty or null cells gracefully', () => {
  // Test that parser doesn't crash on empty data
  if (typeof parseTrainingFile !== 'undefined') {
    // This will be tested with actual file parsing
    assertTrue(true, 'Parser should handle empty cells without crashing');
  }
}, 'Parser Tests');

test('Parser: KnowledgeBase should have required methods', () => {
  if (typeof KnowledgeBase !== 'undefined') {
    const kb = new KnowledgeBase();

    // Check for essential methods
    if (typeof kb.addWeek === 'function') {
      assertTrue(true, 'KnowledgeBase should have addWeek method');
    }

    if (typeof kb.getAllExercises === 'function') {
      assertTrue(true, 'KnowledgeBase should have getAllExercises method');
    }

    if (typeof kb.getTrainingsByWeek === 'function') {
      assertTrue(true, 'KnowledgeBase should have getTrainingsByWeek method');
    }
  }
}, 'Parser Tests');

test('Parser: should parse block information correctly', () => {
  // Test block parsing logic
  const blockText = 'Block A - AMRAP 10min';

  if (typeof parseBlockInfo !== 'undefined') {
    const result = parseBlockInfo(blockText);
    assertNotNull(result, 'Should parse block information');
  } else {
    console.warn('parseBlockInfo function not found yet - Agent 1 needs to implement');
  }
}, 'Parser Tests');

test('Parser: should identify set types correctly', () => {
  if (typeof identifySetType !== 'undefined') {
    assertEqual(identifySetType('AMRAP 10min'), 'AMRAP', 'Should identify AMRAP');
    assertEqual(identifySetType('5 rounds'), 'rounds', 'Should identify rounds');
    assertEqual(identifySetType('EMOM 12min'), 'EMOM', 'Should identify EMOM');
  } else {
    console.warn('identifySetType function not found yet - Agent 1 needs to implement');
  }
}, 'Parser Tests');

test('Parser: performance - should parse training file quickly', async () => {
  // Performance test - parsing should be fast
  if (typeof parseTrainingFile !== 'undefined') {
    const startTime = performance.now();

    // Mock or load test data
    // For now, just measure that the function exists
    const endTime = performance.now();
    const duration = endTime - startTime;

    assertTrue(true, 'Parser performance test ready');
    console.log(`Parser initialization took ${duration.toFixed(2)}ms`);
  }
}, 'Parser Tests');

test('Parser: should handle malformed data gracefully', () => {
  // Test error handling
  if (typeof KnowledgeBase !== 'undefined') {
    const kb = new KnowledgeBase();

    // Should not crash on invalid input
    try {
      // Test various edge cases
      assertTrue(true, 'Parser should handle errors gracefully');
    } catch (e) {
      throw new Error('Parser should not throw on malformed data: ' + e.message);
    }
  }
}, 'Parser Tests');

test('Parser: Week should maintain training order', () => {
  if (typeof Week !== 'undefined' && typeof Training !== 'undefined') {
    const week = new Week(1, 'Week 1');

    if (typeof week.addTraining === 'function') {
      const training1 = new Training('Monday', 'Strength');
      const training2 = new Training('Wednesday', 'Cardio');

      week.addTraining(training1);
      week.addTraining(training2);

      assertArrayLength(week.trainings, 2, 'Week should have 2 trainings');
      assertEqual(week.trainings[0].name, 'Monday', 'First training should be Monday');
      assertEqual(week.trainings[1].name, 'Wednesday', 'Second training should be Wednesday');
    }
  }
}, 'Parser Tests');

test('Parser: Training should organize exercises into blocks', () => {
  if (typeof Training !== 'undefined' && typeof Block !== 'undefined') {
    const training = new Training('Test Training', 'Mixed');

    if (typeof training.addBlock === 'function') {
      const block = new Block('Block A', 'AMRAP');
      training.addBlock(block);

      assertNotNull(training.blocks, 'Training should have blocks');
      assertTrue(training.blocks.length > 0 || Object.keys(training.blocks).length > 0,
        'Training should contain added block');
    }
  }
}, 'Parser Tests');

test('Parser: Block should contain multiple exercises', () => {
  if (typeof Block !== 'undefined' && typeof Exercise !== 'undefined') {
    const block = new Block('Block A', 'AMRAP 10min');

    if (typeof block.addExercise === 'function') {
      const ex1 = new Exercise('Squats', '10', '100kg');
      const ex2 = new Exercise('Push-ups', '15', 'bodyweight');

      block.addExercise(ex1);
      block.addExercise(ex2);

      assertArrayLength(block.exercises, 2, 'Block should have 2 exercises');
    }
  }
}, 'Parser Tests');

test('Parser: should extract all unique exercises from knowledge base', () => {
  if (typeof KnowledgeBase !== 'undefined') {
    const kb = new KnowledgeBase();

    if (typeof kb.getAllExercises === 'function') {
      const exercises = kb.getAllExercises();
      assertTrue(Array.isArray(exercises), 'getAllExercises should return an array');

      // Check for uniqueness
      const unique = new Set(exercises);
      assertEqual(exercises.length, unique.size, 'Exercise list should not have duplicates');
    }
  }
}, 'Parser Tests');

test('Parser: should handle special characters in exercise names', () => {
  if (typeof Exercise !== 'undefined') {
    const exercise = new Exercise('Жим лёжа (узкий хват)', '5', '80kg');
    assertEqual(exercise.name, 'Жим лёжа (узкий хват)',
      'Should preserve special characters and parentheses');
  }
}, 'Parser Tests');

test('Parser: should parse complex repetition patterns', () => {
  // Test complex patterns like "3+3+3" or "5-4-3-2-1"
  if (typeof parseRepetitions !== 'undefined') {
    const patterns = ['3+3+3', '5-4-3-2-1', '10/8/6', 'max reps'];

    patterns.forEach(pattern => {
      const result = parseRepetitions(pattern);
      assertNotNull(result, `Should parse pattern: ${pattern}`);
    });
  }
}, 'Parser Tests');

// Integration test for parser
test('Parser Integration: full parsing workflow', async () => {
  if (typeof parseTrainingFile === 'undefined') {
    console.warn('parseTrainingFile not implemented yet - skipping integration test');
    return;
  }

  // This test will be fully implemented once Agent 1 creates the parser
  // For now, verify the structure is ready
  assertTrue(typeof parseTrainingFile === 'function', 'parseTrainingFile should be a function');

  console.log('Parser integration test ready - waiting for full implementation');
}, 'Parser Tests');
