/**
 * Edge case testing for parser
 */

const { KnowledgeBase } = require('./app/js/data-model.js');
const {
  parseWeekInfo,
  parseTrainingInfo,
  parseBlockInfo,
  parseWeight,
  parseRepetitions,
  extractIntensity,
  getCellValue
} = require('./app/js/parser.js');

console.log('=== Edge Case Testing ===\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, actual, expected, message) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✓ ${name}`);
    testsPassed++;
  } else {
    console.log(`✗ ${name}`);
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual: ${JSON.stringify(actual)}`);
    if (message) console.log(`  ${message}`);
    testsFailed++;
  }
}

// Edge Case 1: Empty cells and null values
console.log('1. Empty/null value handling:');
test('Empty weight', parseWeight(''), { value: '', unit: '', type: null, range: null });
test('Null repetitions', parseRepetitions(''), { value: '', type: 'none', description: '' });
test('Empty intensity', extractIntensity(''), { percent: '', level: '' });
console.log();

// Edge Case 2: Various weight formats
console.log('2. Weight parsing edge cases:');
test('Weight range with kg', parseWeight('2-3 кг').type, 'range', 'Should detect range');
test('Single number as kg', parseWeight('8-12').type, 'range', 'Range without unit');
test('Weight with spaces', parseWeight('  10 кг  ').unit, 'kg', 'Should handle spaces');
test('Bodyweight text', parseWeight('вес тела').type, 'bodyweight', 'Should detect bodyweight');
test('Complex weight range', parseWeight('36-61 кг').range, { min: 36, max: 61 }, 'Should parse wide range');
console.log();

// Edge Case 3: Various repetition formats
console.log('3. Repetition parsing edge cases:');
test('Split reps with slash', parseRepetitions('10/10').type, 'split', 'Should handle 10/10');
test('Split reps with backslash', parseRepetitions('5\\5').type, 'split', 'Should handle 5\\5');
test('Max repetitions', parseRepetitions('макс').type, 'max', 'Should recognize макс');
test('Time-based reps', parseRepetitions('30 сек работы\\30 сек отдых').type, 'timed', 'Should recognize timed');
test('Distance reps', parseRepetitions('2 км').type, 'distance', 'Should recognize distance');
test('Simple number', parseRepetitions('15').type, 'fixed', 'Should handle simple number');
console.log();

// Edge Case 4: Block info parsing
console.log('4. Block info parsing edge cases:');
const block1 = parseBlockInfo('1\\1');
test('Simple block', block1.blockNum, 1, 'Should parse block number');
test('Simple block rounds', block1.rounds, 1, 'Should parse rounds');

const block2 = parseBlockInfo('2\\4\\каждые 2-3 минуты');
test('Block with rest info', block2.setType, 'every_x_minutes', 'Should detect "каждые X минуты"');
test('Block rounds', block2.rounds, 4, 'Should parse rounds');

const block3 = parseBlockInfo('4\\AMRAP 12 мин');
test('AMRAP block', block3.setType, 'AMRAP', 'Should detect AMRAP');

const block4 = parseBlockInfo('1\\сделать 3 раунда');
test('Rounds description', block4.setType, 'rounds', 'Should detect "сделать X раунда"');

const block5 = parseBlockInfo('2\\10 мин');
test('Timed block', block5.setType, 'timed', 'Should detect timed block');
console.log();

// Edge Case 5: Training info parsing
console.log('5. Training info parsing edge cases:');
const training1 = parseTrainingInfo('1\\n60-70%');
test('Training with newline', training1.number, 1, 'Should parse despite \\n');
test('Training intensity', training1.intensity, '60-70%', 'Should extract intensity');

const training2 = parseTrainingInfo('2 на здоровье;)\\ бассейн');
test('Recovery training', training2.number, 2, 'Should parse training number');

const training3 = parseTrainingInfo('отдых');
test('Rest training number', training3.number, null, 'Rest has no number');

const training4 = parseTrainingInfo('4');
test('Simple number training', training4.number, 4, 'Should parse simple number');
console.log();

// Edge Case 6: Week info parsing
console.log('6. Week info parsing edge cases:');
const week1 = parseWeekInfo('8-14.01 \n1 неделя жесткого кача');
test('Week with жесткий кач', week1.intensity, 'высокая', 'Should detect high intensity');
test('Week date range', week1.dateRange, '8-14.01', 'Should extract date range');

const week2 = parseWeekInfo('15-21.01\n2 неделя жесткого кача+тест');
test('Week with тест', week2.intensity, 'тест', 'Should detect test week');
console.log();

// Edge Case 7: Cyrillic text handling
console.log('7. Cyrillic text handling:');
test('Exercise with Russian name',
  parseWeight('кг').unit,
  'kg',
  'Should handle Cyrillic unit');
test('Exercise repetitions text',
  parseRepetitions('в среднем темпе').type,
  'text',
  'Should handle Cyrillic text reps');
console.log();

// Edge Case 8: KnowledgeBase edge cases
console.log('8. KnowledgeBase operations:');
const kb = new KnowledgeBase();

// Add week
const week = kb.addWeek({ dateRange: '1-7.01', description: 'Test Week', intensity: 'high' });
test('Week added', kb.weeks.length, 1, 'Should add week');
test('Week indexed', kb.getWeek(week.id) !== undefined, true, 'Should index week');

// Add training
const training = kb.addTraining(week.id, { trainingNumber: 1, intensityPercent: '60%' });
test('Training added', week.trainings.length, 1, 'Should add training');
test('Training indexed', kb.getTraining(training.id) !== undefined, true, 'Should index training');

// Add block
const block = kb.addBlock(training.id, { blockNumber: 1 });
test('Block added', training.blocks.length, 1, 'Should add block');

// Add exercise
kb.addExercise(block.id, { name: 'Test Exercise', repetitions: '10', weight: '5 кг' });
test('Exercise added', block.exercises.length, 1, 'Should add exercise');
test('Metadata updated', kb.metadata.totalExercises, 1, 'Should update metadata');

// Search
const results = kb.searchExercises('test');
test('Search works', results.length, 1, 'Should find exercise');

// JSON export/import
const json = kb.toJSON();
const kb2 = new KnowledgeBase();
kb2.fromJSON(json);
test('JSON round-trip weeks', kb2.weeks.length, kb.weeks.length, 'Should preserve weeks');
test('JSON round-trip exercises', kb2.metadata.totalExercises, kb.metadata.totalExercises, 'Should preserve exercises');
console.log();

// Edge Case 9: Special characters and formatting
console.log('9. Special characters and formatting:');
test('Backslash in exercise name',
  parseRepetitions('30 сек работы\\30 сек отдых').value,
  '30 сек работы\\30 сек отдых',
  'Should preserve backslash');
test('Multiple spaces',
  parseWeight('  2-3   кг  ').type,
  'range',
  'Should handle multiple spaces');
console.log();

// Edge Case 10: Missing data scenarios
console.log('10. Missing data scenarios:');
const kbEmpty = new KnowledgeBase();
test('Empty KB search', kbEmpty.searchExercises('test').length, 0, 'Empty KB returns no results');
test('Empty KB exercise names', kbEmpty.getAllExerciseNames().length, 0, 'Empty KB has no exercises');
test('Get non-existent week', kbEmpty.getWeek('fake_id'), undefined, 'Should return undefined');
test('Get non-existent training', kbEmpty.getTraining('fake_id'), undefined, 'Should return undefined');
console.log();

// Summary
console.log('=== EDGE CASE TEST SUMMARY ===');
console.log(`Total tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All edge case tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${testsFailed} edge case test(s) failed!`);
  process.exit(1);
}
