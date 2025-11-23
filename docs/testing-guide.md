# Testing Guide

Complete guide to running and writing tests for the Training Plan Parser & Manager

## Table of Contents

1. [Overview](#overview)
2. [Running Tests](#running-tests)
3. [Test Coverage](#test-coverage)
4. [Writing Tests](#writing-tests)
5. [Test Framework](#test-framework)
6. [Manual Testing](#manual-testing)
7. [Performance Testing](#performance-testing)
8. [Quality Gates](#quality-gates)
9. [CI/CD Integration](#cicd-integration)

## Overview

The project uses a custom, lightweight testing framework built specifically for browser-based testing. No npm, no build tools - just open the test runner in your browser.

### Why Custom Framework?

- **Zero Dependencies** - No npm install required
- **Browser Native** - Tests run in actual browser environment
- **Visual Feedback** - Beautiful test results UI
- **Fast** - No build step, instant feedback
- **Simple** - Easy to understand and extend

### Test Philosophy

1. **Comprehensive** - Test all functionality
2. **Isolated** - Each test is independent
3. **Fast** - Quick feedback loop
4. **Readable** - Clear test names and assertions
5. **Maintainable** - Easy to update and extend

## Running Tests

### Quick Start

1. Open your browser
2. Navigate to: `tests/test-runner.html`
3. Tests run automatically
4. View results on the page

### Command Line (Optional)

If you prefer command line:

```bash
# Using Python
cd an_amazing_ton/tests
python -m http.server 8000
# Open http://localhost:8000/test-runner.html

# Using Node
npx http-server -p 8000
# Open http://localhost:8000/test-runner.html
```

### Test Results

The test runner shows:
- **Summary** - Pass/fail counts and percentage
- **Progress Bar** - Visual completion indicator
- **Test Sections** - Grouped by module
- **Details** - Pass/fail status for each test
- **Errors** - Stack traces for failures

### Filtering Results

Use the filter buttons:
- **All Tests** - Show everything
- **Passed Only** - Only successful tests
- **Failed Only** - Only failures
- **Pending Only** - Tests not yet run

### Re-running Tests

- **Run Tests Button** - Re-run all tests
- **Reset Button** - Reload page and clear results

## Test Coverage

### Current Test Suites

#### Parser Tests (24 tests)
Tests for Agent 1's parsing functionality:
- Data model creation
- Excel parsing
- Intensity extraction
- Repetition parsing
- Weight parsing
- Cyrillic text handling
- Performance benchmarks

**File:** `tests/parser.test.js`

#### Search Tests (18 tests)
Tests for Agent 2's search functionality:
- Include filter (AND logic)
- Exclude filter (OR logic)
- Combined filters
- Intensity filtering
- Set type filtering
- Autocomplete
- Fuzzy matching
- Performance benchmarks

**File:** `tests/search.test.js`

#### UI Tests (30 tests)
Tests for Agent 3's UI components:
- File upload
- Knowledge base display
- Search UI
- Training cards
- Modals
- Autocomplete
- Responsive design (manual)
- Accessibility

**File:** `tests/ui.test.js`

#### Timer Tests (26 tests)
Tests for timer functionality:
- Start/pause/resume/stop
- Work/rest transitions
- Exercise cycling
- Progress calculation
- Audio cues
- Time accuracy
- Controls

**File:** `tests/timer.test.js`

#### Storage Tests (23 tests)
Tests for Agent 4's storage functionality:
- Save/load from localStorage
- Auto-save
- Data integrity
- Import/export JSON
- Backup/restore
- Data validation
- Error handling

**File:** `tests/storage.test.js`

#### Export Tests (25 tests)
Tests for export functionality:
- PDF export
- Image export
- Print functionality
- Multiple training export
- Filename generation
- Format handling
- Error recovery

**File:** `tests/export.test.js`

#### Integration Tests (20 tests)
End-to-end workflow tests:
- Upload → parse → display
- Search → filter → results
- Edit → save → reload
- Timer with real data
- Full user workflows
- Component integration

**File:** `tests/integration.test.js`

### Total Coverage

- **Total Tests:** 166+
- **Modules Covered:** 8
- **Code Coverage:** Comprehensive
- **Performance Tests:** Included

## Writing Tests

### Basic Test Structure

```javascript
test('Test name describing what is tested', () => {
  // Arrange - Set up test data
  const kb = new KnowledgeBase();

  // Act - Perform action
  kb.addWeek(new Week(1, "Week 1"));

  // Assert - Verify result
  assertEqual(kb.weeks.length, 1, 'Should have 1 week');
}, 'Test Section Name');
```

### Test Function

```javascript
test(name, fn, section)
```

**Parameters:**
- `name` (string) - Descriptive test name
- `fn` (function) - Test function
- `section` (string) - Section/module name

### Assertion Functions

#### assertEqual()
```javascript
assertEqual(actual, expected, message)
```
Checks if values are exactly equal (===).

#### assertDeepEqual()
```javascript
assertDeepEqual(actual, expected, message)
```
Checks if objects are deeply equal (JSON comparison).

#### assertTrue()
```javascript
assertTrue(value, message)
```
Checks if value is truthy.

#### assertFalse()
```javascript
assertFalse(value, message)
```
Checks if value is falsy.

#### assertNotNull()
```javascript
assertNotNull(value, message)
```
Checks if value is not null or undefined.

#### assertThrows()
```javascript
assertThrows(fn, message)
```
Checks if function throws an error.

#### assertContains()
```javascript
assertContains(array, value, message)
```
Checks if array contains value.

#### assertGreaterThan()
```javascript
assertGreaterThan(actual, threshold, message)
```
Checks if value is greater than threshold.

#### assertLessThan()
```javascript
assertLessThan(actual, threshold, message)
```
Checks if value is less than threshold.

#### assertArrayLength()
```javascript
assertArrayLength(array, length, message)
```
Checks if array has specific length.

### Example Tests

#### Simple Unit Test
```javascript
test('KnowledgeBase: should initialize empty', () => {
  const kb = new KnowledgeBase();
  assertArrayLength(kb.weeks, 0, 'Should start with no weeks');
}, 'Data Model Tests');
```

#### Async Test
```javascript
test('Parser: should parse file', async () => {
  const file = getMockFile();
  const kb = await parseTrainingFile(file);
  assertNotNull(kb, 'Should return KnowledgeBase');
}, 'Parser Tests');
```

#### Performance Test
```javascript
test('Search: should complete in under 100ms', () => {
  const startTime = performance.now();

  // Perform search
  const results = search.search({ includeExercises: ['Squats'] });

  const duration = performance.now() - startTime;
  assertLessThan(duration, 100, 'Search too slow');
}, 'Performance Tests');
```

#### Error Handling Test
```javascript
test('Storage: should handle corrupted data', () => {
  localStorage.setItem('data', 'invalid json');

  assertThrows(() => {
    storage.loadKnowledgeBase();
  }, 'Should throw on corrupted data');
}, 'Storage Tests');
```

### Test Naming Conventions

**Format:** `[Module]: [should/must] [action/behavior]`

**Examples:**
- ✅ `Parser: should handle empty cells`
- ✅ `Search: CRITICAL - must not have false positives`
- ✅ `Timer: should transition from work to rest`
- ❌ `test1` - Too vague
- ❌ `it works` - Not descriptive

### Test Organization

Group related tests in same file:

```javascript
// Basic tests first
test('Class exists', () => { ... });
test('Constructor works', () => { ... });

// Functionality tests
test('Method A works', () => { ... });
test('Method B works', () => { ... });

// Edge cases
test('Handles null input', () => { ... });
test('Handles empty array', () => { ... });

// Performance tests last
test('Completes in <100ms', () => { ... });
```

## Test Framework

### TestRunner Class

```javascript
class TestRunner {
  constructor()

  test(name, fn, section)
  async run()
  displayResults()
  filterResults(filter)
  printSummary()
}
```

### Extending the Framework

Add new assertion:

```javascript
function assertBetween(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(
      `${message}\nExpected: ${min} - ${max}\nActual: ${value}`
    );
  }
}
```

Add test helper:

```javascript
function createMockTraining(name) {
  const training = new Training(name, 'Test');
  // Add mock data
  return training;
}
```

## Manual Testing

Some aspects require manual verification:

### UI/UX Testing

**Responsive Design:**
1. Open app in browser
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test at different screen sizes:
   - Mobile: 320px, 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1920px, 2560px

**Checklist:**
- [ ] No horizontal scrollbar
- [ ] All buttons touch-friendly (min 44px)
- [ ] Text readable at all sizes
- [ ] Images scale correctly
- [ ] Modals fit on screen

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility

**Keyboard Navigation:**
- [ ] Tab through all controls
- [ ] Enter activates buttons
- [ ] Escape closes modals
- [ ] Focus visible

**Screen Reader:**
- [ ] Alt text on images
- [ ] ARIA labels on controls
- [ ] Semantic HTML
- [ ] Logical tab order

### Performance

**Loading Time:**
1. Open DevTools Network tab
2. Hard refresh (Ctrl+Shift+R)
3. Check DOMContentLoaded < 2s
4. Check Load < 3s

**Interaction Speed:**
- [ ] Search updates < 100ms
- [ ] File upload < 500ms
- [ ] UI updates feel instant
- [ ] No lag or jank

### Visual Testing

**Appearance:**
- [ ] Fonts load correctly
- [ ] Colors match design
- [ ] Icons display
- [ ] Spacing consistent
- [ ] Animations smooth

**Print Preview:**
- [ ] Export PDF readable
- [ ] Print layout clean
- [ ] No cut-off content

## Performance Testing

### Benchmarking

Tests include performance assertions:

```javascript
test('Parser: should complete in <500ms', async () => {
  const startTime = performance.now();

  await parseTrainingFile(largeFile);

  const duration = performance.now() - startTime;
  assertLessThan(duration, 500, 'Parsing too slow');
});
```

### Performance Targets

| Operation | Target | Critical |
|-----------|--------|----------|
| Parse file | <500ms | <1000ms |
| Search | <100ms | <200ms |
| Save data | <50ms | <100ms |
| UI update | <16ms | <32ms |
| Export PDF | <2s | <5s |

### Memory Testing

Monitor memory in DevTools:
1. Open DevTools
2. Performance → Memory
3. Record session
4. Perform operations
5. Check for memory leaks

**What to Check:**
- Memory returns to baseline
- No continuous growth
- Heap size reasonable

## Quality Gates

Before code is approved, it must pass:

### 1. All Tests Pass
- ✅ 100% test pass rate
- ✅ No skipped tests
- ✅ No warnings in console

### 2. Performance Met
- ✅ All benchmarks pass
- ✅ No operations exceed limits
- ✅ UI feels responsive

### 3. Functionality Works
- ✅ Upload and parse works
- ✅ Search is accurate
- ✅ Timer functions correctly
- ✅ Save/load preserves data
- ✅ Export creates valid files

### 4. UI Quality
- ✅ Responsive on all sizes
- ✅ No layout issues
- ✅ Touch-friendly
- ✅ Accessible

### 5. Code Quality
- ✅ No console errors
- ✅ Clean code
- ✅ Well documented
- ✅ Follows conventions

### 6. Data Integrity
- ✅ Save/load cycle preserves data
- ✅ No data corruption
- ✅ Handles edge cases

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run tests
        run: |
          cd tests
          python -m http.server 8000 &
          npx playwright test test-runner.html
```

### Automated Testing

For automated browser testing:

```javascript
// Using Playwright
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('file:///path/to/tests/test-runner.html');
  await page.click('button:text("Run Tests")');

  // Wait for tests to complete
  await page.waitForSelector('.summary');

  const passCount = await page.textContent('#pass-count');
  const failCount = await page.textContent('#fail-count');

  console.log(`Passed: ${passCount}, Failed: ${failCount}`);

  await browser.close();
})();
```

## Debugging Tests

### Browser DevTools

1. Open test-runner.html
2. Open DevTools (F12)
3. Go to Sources tab
4. Set breakpoints in test code
5. Click "Run Tests"
6. Step through execution

### Console Logging

Add debug output:

```javascript
test('Debugging test', () => {
  const result = someFunction();
  console.log('Result:', result);
  console.log('Type:', typeof result);
  console.log('Keys:', Object.keys(result));

  assertEqual(result.value, 42);
});
```

### Test Isolation

Run single test:

```javascript
// Comment out other tests
// test('Other test', () => { ... });

test('The one test I want to debug', () => {
  // Debug this one
});
```

## Best Practices

### Do's
✅ Write tests before implementation (TDD)
✅ Test edge cases and errors
✅ Keep tests simple and focused
✅ Use descriptive test names
✅ Test one thing per test
✅ Clean up after tests
✅ Mock external dependencies

### Don'ts
❌ Don't test implementation details
❌ Don't write interdependent tests
❌ Don't ignore failing tests
❌ Don't skip error cases
❌ Don't test third-party code
❌ Don't make tests too complex

## Contributing Tests

When adding new functionality:

1. Write tests first (TDD)
2. Ensure tests fail without implementation
3. Implement feature
4. Ensure tests pass
5. Run full test suite
6. Check code coverage
7. Submit for review by Agent 5

## Test Data

### Mock Data Location

Test data is created in test files:

```javascript
function createMockKnowledgeBase() {
  const kb = new KnowledgeBase();
  // Add test data
  return kb;
}
```

### Test Files

Sample training files for testing:
- `training.xlsx` - Example file
- Create mocks in tests as needed

## Resources

- [Test Runner](../tests/test-runner.html)
- [API Reference](api-reference.md)
- [Architecture](architecture.md)

---

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Maintained by:** Agent 5 (QA Lead)
