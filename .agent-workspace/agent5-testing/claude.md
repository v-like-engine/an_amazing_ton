# Agent 5: Testing, Documentation & Quality Assurance

## Your Mission
You are the QA lead and monitoring agent. You write tests, documentation, AND monitor the other 4 agents' work, providing feedback and corrections in their claude.md files.

## Your Files (YOU OWN THESE - NO OTHER AGENT WRITES HERE)
- `tests/` - All test files
  - `tests/parser.test.js` - Tests for Agent 1
  - `tests/search.test.js` - Tests for Agent 2
  - `tests/ui.test.js` - Tests for Agent 3 (UI interactions)
  - `tests/timer.test.js` - Tests for timer
  - `tests/storage.test.js` - Tests for Agent 4
  - `tests/export.test.js` - Tests for export functionality
  - `tests/integration.test.js` - Integration tests
  - `tests/test-runner.html` - Browser-based test runner
- `docs/` - All documentation
  - `docs/README.md` - Main documentation
  - `docs/architecture.md` - System architecture
  - `docs/user-guide.md` - How to use the app
  - `docs/api-reference.md` - API documentation for developers
  - `docs/testing-guide.md` - How to run tests

## Your Responsibilities

### 1. Write Comprehensive Tests

You must write unit tests for ALL functionality from all agents:

**Parser Tests (tests/parser.test.js):**
```javascript
// Test parseTrainingFile()
test('parseTrainingFile: should parse training.xlsx correctly', async () => {
  // Load sample data
  // Call parser
  // Verify knowledge base structure
  // Check all weeks parsed
  // Check all trainings parsed
  // Check all exercises parsed
});

test('parseTrainingFile: should handle empty cells', () => { });
test('parseTrainingFile: should extract intensity correctly', () => { });
test('parseTrainingFile: should parse block info correctly', () => { });
test('parseTrainingFile: should parse repetitions in all formats', () => { });
test('parseTrainingFile: should parse weight with units', () => { });
test('parseTrainingFile: should handle Cyrillic text', () => { });
test('parseTrainingFile: should complete in under 500ms', () => { });
```

**Search Tests (tests/search.test.js):**
```javascript
test('search: include filter returns only trainings with all selected exercises', () => {
  // Create test knowledge base
  // Search with include filter
  // Verify ONLY correct trainings returned
  // NO false positives
});

test('search: exclude filter removes trainings with any excluded exercises', () => { });
test('search: combined include+exclude works correctly', () => { });
test('search: intensity filter works', () => { });
test('search: set type filter works', () => { });
test('search: all filters combined work together', () => { });
test('search: exercise autocomplete works', () => { });
test('search: fuzzy matching works for Cyrillic', () => { });
test('search: returns correct result format', () => { });
test('search: performance under 100ms', () => { });
test('search: handles edge cases (empty filters, no results, etc.)', () => { });
```

**Storage Tests (tests/storage.test.js):**
```javascript
test('storage: autoSave saves to localStorage', () => { });
test('storage: autoLoad loads from localStorage', () => { });
test('storage: exportToFile creates valid JSON', () => { });
test('storage: importFromFile loads data correctly', () => { });
test('storage: save/load preserves data integrity', () => { });
test('storage: handles large datasets', () => { });

test('editor: updateExercise modifies exercise correctly', () => { });
test('editor: addExercise adds to correct block', () => { });
test('editor: addTraining works', () => { });
test('editor: addWeek works', () => { });
```

**Export Tests (tests/export.test.js):**
```javascript
test('export: exportAsPDF creates PDF file', () => { });
test('export: exportAsImage creates image file', () => { });
test('export: exported content is readable', () => { });
test('export: handles multiple trainings', () => { });
```

**Timer Tests (tests/timer.test.js):**
```javascript
test('timer: starts correctly with given config', () => { });
test('timer: transitions from work to rest', () => { });
test('timer: transitions from rest to work', () => { });
test('timer: transitions between exercises', () => { });
test('timer: pause works', () => { });
test('timer: resume works', () => { });
test('timer: stop works', () => { });
test('timer: calculates progress correctly', () => { });
test('timer: completes full cycle correctly', () => { });
```

**Integration Tests (tests/integration.test.js):**
```javascript
test('integration: full workflow - upload, parse, search, export', () => {
  // Upload file → Parse → Search → Select results → Export
  // Verify each step works
});

test('integration: edit and save workflow', () => {
  // Load → Edit exercise → Save → Reload → Verify change persisted
});

test('integration: timer with real training data', () => {
  // Load training → Configure timer with exercises → Run timer
});
```

### 2. Test Runner (tests/test-runner.html)

Create a simple browser-based test runner (no npm needed!):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Training Plan - Test Runner</title>
  <style>
    /* Styling for test results */
    .test-pass { color: green; }
    .test-fail { color: red; }
    .test-pending { color: orange; }
  </style>
</head>
<body>
  <h1>Test Runner</h1>
  <div id="test-results"></div>

  <!-- Load all source files -->
  <script src="../app/js/parser.js"></script>
  <script src="../app/js/data-model.js"></script>
  <script src="../app/js/search.js"></script>
  <script src="../app/js/filters.js"></script>
  <script src="../app/js/storage.js"></script>
  <script src="../app/js/editor.js"></script>
  <script src="../app/js/export.js"></script>
  <script src="../app/js/timer.js"></script>

  <!-- Simple test framework -->
  <script>
    // Simple test framework implementation
    class TestRunner {
      constructor() {
        this.tests = [];
        this.results = [];
      }

      test(name, fn) {
        this.tests.push({ name, fn });
      }

      async run() {
        for (let test of this.tests) {
          try {
            await test.fn();
            this.results.push({ name: test.name, status: 'pass' });
          } catch (error) {
            this.results.push({ name: test.name, status: 'fail', error });
          }
        }
        this.displayResults();
      }

      displayResults() {
        const container = document.getElementById('test-results');
        let html = `<h2>Results: ${this.results.length} tests</h2>`;

        for (let result of this.results) {
          const className = `test-${result.status}`;
          const status = result.status === 'pass' ? '✓' : '✗';
          html += `<div class="${className}">${status} ${result.name}</div>`;
          if (result.error) {
            html += `<pre>${result.error.message}\n${result.error.stack}</pre>`;
          }
        }

        container.innerHTML = html;

        const passCount = this.results.filter(r => r.status === 'pass').length;
        const failCount = this.results.filter(r => r.status === 'fail').length;
        console.log(`Tests: ${passCount} passed, ${failCount} failed`);
      }
    }

    const runner = new TestRunner();
    const test = runner.test.bind(runner);

    // Helper assertion functions
    function assertEqual(actual, expected, message) {
      if (actual !== expected) {
        throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
      }
    }

    function assertTrue(value, message) {
      if (!value) {
        throw new Error(`${message}\nExpected: true\nActual: ${value}`);
      }
    }

    function assertFalse(value, message) {
      if (value) {
        throw new Error(`${message}\nExpected: false\nActual: ${value}`);
      }
    }
  </script>

  <!-- Load all test files -->
  <script src="parser.test.js"></script>
  <script src="search.test.js"></script>
  <script src="storage.test.js"></script>
  <script src="export.test.js"></script>
  <script src="timer.test.js"></script>
  <script src="integration.test.js"></script>

  <!-- Run tests -->
  <script>
    runner.run();
  </script>
</body>
</html>
```

### 3. Write Documentation

**docs/README.md:**
```markdown
# Training Plan Parser & Manager

A web-based application for managing and searching training plans from xlsx files.

## Features
- Parse training xlsx files (no upload needed - all local!)
- Powerful search and filtering
- Beautiful, phone-friendly UI
- Tabata timer for workouts
- Add/edit exercises and trainings
- Export to PDF/images for gym use
- Auto-save your work

## Quick Start
1. Open `app/index.html` in your browser
2. Upload your training.xlsx file
3. Start searching, planning, and training!

## No Installation Required
This app runs entirely in your browser. No npm, no Docker, no server needed.
Just open the HTML file and go!

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation
- [User Guide](user-guide.md) - How to use the app
- [Architecture](architecture.md) - Technical overview
- [API Reference](api-reference.md) - For developers
- [Testing Guide](testing-guide.md) - How to run tests
```

**docs/architecture.md:**
```markdown
# Architecture

## System Overview
The application is built as a pure client-side web app using vanilla JavaScript.
No build tools, no dependencies, no server required.

## Components

### 1. Parser (Agent 1)
- Files: `parser.js`, `data-model.js`
- Parses xlsx files using SheetJS
- Creates structured knowledge base
- Handles Cyrillic text

### 2. Search (Agent 2)
- Files: `search.js`, `filters.js`
- Implements filtering by exercises, intensity, set type
- Fast, accurate search
- Supports include/exclude logic

### 3. Frontend (Agent 3)
- Files: `index.html`, `styles.css`, `ui.js`, `timer.js`
- Responsive design (mobile-first)
- Animations and interactions
- Tabata timer

### 4. Storage (Agent 4)
- Files: `storage.js`, `editor.js`, `export.js`
- Auto-save to localStorage
- Export/import JSON
- Export to PDF/images
- Edit/add functionality

## Data Flow
1. User uploads xlsx → Parser creates KnowledgeBase
2. KnowledgeBase → Auto-saved to localStorage
3. User applies filters → Search returns results
4. User edits data → Updates KnowledgeBase → Auto-saved
5. User exports → Creates PDF/image files

## Libraries Used (CDN)
- SheetJS (xlsx.js) - Excel parsing
- jsPDF - PDF generation
- html2canvas - Image generation
- Font Awesome - Icons

## File Structure
[Document the file structure]

## Design Decisions
[Document key design decisions and rationale]
```

**docs/user-guide.md:**
```markdown
# User Guide

## Getting Started

### 1. Upload Your Training File
- Click "Upload Training File" or drag-drop your xlsx file
- The file is parsed instantly (never leaves your device!)
- Your data is automatically saved in your browser

### 2. Browse Your Trainings
- Weeks are listed in the sidebar
- Click a week to expand and see trainings
- Click a training to view full details

### 3. Search for Trainings

**By Exercises:**
- Type exercise name in "Include" box → only trainings with those exercises
- Type exercise name in "Exclude" box → filter out trainings with those exercises

**By Intensity:**
- Use slider or type percentage range
- Filter by intensity level (e.g., "жесткий кач")

**By Set Type:**
- Select AMRAP, rounds, timed, etc.

**Combine Filters:**
- Use any combination of filters
- Results update in real-time

### 4. Use the Timer

[Instructions for timer]

### 5. Edit & Add Content

[Instructions for editing]

### 6. Export for Gym Use

[Instructions for export]

## Tips & Tricks
[Useful tips]

## Troubleshooting
[Common issues and solutions]
```

**docs/api-reference.md:**
```markdown
# API Reference

For developers who want to understand or extend the codebase.

## Parser Module

### parseTrainingFile(file)
[Document function]

### KnowledgeBase Class
[Document class and methods]

## Search Module

### TrainingSearch Class
[Document class and methods]

## Storage Module

### StorageManager Class
[Document class and methods]

## Timer Module

### TabataTimer Class
[Document class and methods]

[Continue for all modules...]
```

**docs/testing-guide.md:**
```markdown
# Testing Guide

## Running Tests
1. Open `tests/test-runner.html` in your browser
2. Tests run automatically
3. View results on the page

## Test Coverage
- Parser: X tests
- Search: X tests
- Storage: X tests
- Timer: X tests
- Integration: X tests

Total: X tests

## Writing New Tests
[Instructions for adding tests]

## Test Data
[Location and description of test data]
```

### 4. Monitor Other Agents (CRITICAL!)

**Your Monitoring Process:**
1. **Read each agent's files as they work**
2. **Test their functionality**
3. **Identify bugs, issues, missing features**
4. **Write feedback in their claude.md files**

**How to Write Feedback:**

When you find an issue with Agent 1's parser:
```markdown
<!-- In .agent-workspace/agent1-parser/claude.md -->

## Notes from Agent 5 (QA & Monitoring)

### Issue #1: Parser not handling empty cells correctly
**Problem:** When column D is empty, parser crashes with "Cannot read property of null"
**Location:** parser.js, line 45
**Fix:** Add null check before accessing cell value
**Status:** CRITICAL - Fix immediately
**Verified:** No

### Issue #2: Intensity extraction missing percentage sign
**Problem:** extractIntensity() returns "60-70" instead of "60-70%"
**Location:** parser.js, extractIntensity function
**Fix:** Append "%" if not present
**Status:** Minor - Fix when possible
**Verified:** No

### Issue #3: Performance - parsing takes 2 seconds
**Problem:** Parsing is slower than required (<500ms)
**Location:** parseTrainingFile function
**Fix:** Optimize loop, reduce string operations
**Status:** Important
**Verified:** No

### Test Results
- ✓ Basic parsing works
- ✗ Empty cell handling (FAILS)
- ✗ Performance benchmark (FAILS - 2000ms vs 500ms target)
- ✓ Cyrillic text handling
- ⚠ Intensity extraction (works but missing %)

**Summary:** 3 issues found. 1 critical, 1 important, 1 minor. Agent 1 should fix critical issue first.
```

**Monitoring Frequency:**
- Check each agent's progress every 10-15 minutes
- Run tests on their code as soon as they commit changes
- Update their claude.md files with findings
- Mark issues as "Verified: Yes" once they're fixed and tests pass

### 5. Quality Gates

**Before marking the project complete, verify:**
- [ ] All tests pass (100% pass rate)
- [ ] All functionality works as specified
- [ ] No console errors
- [ ] Performance benchmarks met
- [ ] Responsive on mobile (tested 320px - 1920px)
- [ ] No layout issues (elements stacking/overlapping)
- [ ] Documentation complete
- [ ] User guide clear and accurate
- [ ] All integration points working
- [ ] Data integrity maintained
- [ ] Auto-save works reliably
- [ ] Export produces readable files
- [ ] Timer works correctly
- [ ] Search is accurate (no false positives)

**Don't approve until ALL quality gates pass!**

## Your Testing Strategy

1. **Unit Test Each Component**
   - Test in isolation
   - Mock dependencies
   - Cover edge cases

2. **Integration Test**
   - Test component interactions
   - Test full workflows
   - Test with real data

3. **Manual Testing**
   - Actually use the app
   - Try to break it
   - Test on different browsers
   - Test on phone

4. **Performance Testing**
   - Measure execution times
   - Test with large datasets
   - Check memory usage

5. **Regression Testing**
   - Re-run all tests after fixes
   - Verify fixes don't break other things

## Integration Points

### Monitor Agent 1 (Parser):
- Read: `app/js/parser.js`, `app/js/data-model.js`
- Test: Parse training.xlsx, verify data structure
- Feedback: Write to `.agent-workspace/agent1-parser/claude.md`

### Monitor Agent 2 (Search):
- Read: `app/js/search.js`, `app/js/filters.js`
- Test: Search accuracy, filter combinations
- Feedback: Write to `.agent-workspace/agent2-search/claude.md`

### Monitor Agent 3 (Frontend):
- Read: `app/index.html`, `app/css/styles.css`, `app/js/ui.js`, `app/js/timer.js`
- Test: UI functionality, responsiveness, timer
- Feedback: Write to `.agent-workspace/agent3-frontend/claude.md`

### Monitor Agent 4 (Storage):
- Read: `app/js/storage.js`, `app/js/editor.js`, `app/js/export.js`
- Test: Save/load, editing, export
- Feedback: Write to `.agent-workspace/agent4-storage/claude.md`

## Testing Checklist (Comprehensive)

### Parser Tests
- [ ] Parses training.xlsx correctly
- [ ] Handles empty cells
- [ ] Extracts intensity
- [ ] Parses blocks
- [ ] Parses exercises
- [ ] Handles Cyrillic
- [ ] Performance <500ms

### Search Tests
- [ ] Include filter correct
- [ ] Exclude filter correct
- [ ] Combined filters work
- [ ] Intensity filter works
- [ ] Set type filter works
- [ ] No false positives
- [ ] Performance <100ms

### UI Tests
- [ ] File upload works
- [ ] Knowledge base displays
- [ ] Search UI updates
- [ ] Results clickable
- [ ] Navigation works
- [ ] Responsive (all sizes)
- [ ] No layout issues

### Timer Tests
- [ ] Starts correctly
- [ ] Transitions work
- [ ] Pause/resume work
- [ ] Stop works
- [ ] Progress accurate
- [ ] Color coding works
- [ ] Readable from distance

### Storage Tests
- [ ] Auto-save works
- [ ] Auto-load works
- [ ] Export JSON works
- [ ] Import JSON works
- [ ] Data integrity preserved

### Export Tests
- [ ] PDF export works
- [ ] Image export works
- [ ] Content readable
- [ ] Multiple trainings handled

### Integration Tests
- [ ] Full workflow works
- [ ] Edit and save workflow
- [ ] Timer with real data
- [ ] All components integrated

## Current Status
- [ ] Test files created
- [ ] Test runner created
- [ ] Documentation written
- [ ] Monitoring other agents
- [ ] All tests passing
- [ ] All issues resolved
- [ ] Project complete and verified

**Start working now! Set up tests, write docs, and start monitoring the other agents!**
