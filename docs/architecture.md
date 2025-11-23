# System Architecture

## Overview

The Training Plan Parser & Manager is built as a pure client-side web application using vanilla JavaScript. No build tools, no frameworks, no server required - just HTML, CSS, and JavaScript.

## Design Principles

1. **Simplicity** - No complex build processes or dependencies
2. **Performance** - Fast parsing and searching operations
3. **Privacy** - All data stays in the user's browser
4. **Modularity** - Clear separation of concerns
5. **Testability** - Comprehensive test coverage
6. **Accessibility** - Works on all devices and screen sizes

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface (UI)                     │
│                     (index.html, ui.js)                      │
└───────────┬─────────────────────────────────────────────────┘
            │
            ├─── File Upload ───────► Parser (parser.js)
            │                             │
            │                             ▼
            │                      Data Model (data-model.js)
            │                       ┌──────────────────┐
            │                       │  KnowledgeBase   │
            │                       │    ├── Weeks     │
            │                       │    └── Exercises │
            │                       └──────────────────┘
            │                             │
            ├─── Search/Filter ──────► Search (search.js)
            │                          Filters (filters.js)
            │                             │
            ├─── Timer ──────────────► Timer (timer.js)
            │
            ├─── Edit ───────────────► Editor (editor.js)
            │                             │
            └─── Storage ────────────► Storage (storage.js)
                                          │
                                      LocalStorage
                                          │
                                      Export (export.js)
                                       │      │
                                      PDF   Image
```

## Component Architecture

### 1. Data Layer (Agent 1)

#### data-model.js
Defines core data structures:

```javascript
class KnowledgeBase {
  weeks: Week[]
  exercises: Map<string, Exercise>

  addWeek(week)
  getAllExercises()
  getTrainingsByWeek(weekNumber)
  findTrainingsByExercise(exerciseName)
}

class Week {
  weekNumber: number
  name: string
  trainings: Training[]

  addTraining(training)
}

class Training {
  name: string
  type: string
  blocks: Block[]
  intensity: string

  addBlock(block)
  getAllExercises()
}

class Block {
  name: string
  info: string  // AMRAP, rounds, etc.
  exercises: Exercise[]

  addExercise(exercise)
}

class Exercise {
  name: string
  repetitions: string
  weight: string
  notes: string
}
```

#### parser.js
Handles Excel file parsing:

```javascript
async function parseTrainingFile(file) {
  // 1. Read Excel file with SheetJS
  // 2. Extract sheets
  // 3. Parse each row
  // 4. Build KnowledgeBase structure
  // 5. Return populated KnowledgeBase
}

function extractIntensity(text)
function parseRepetitions(text)
function parseWeight(text)
function identifySetType(text)
```

**Performance Target:** Parse typical file in < 500ms

### 2. Search Layer (Agent 2)

#### search.js
Core search engine:

```javascript
class TrainingSearch {
  constructor(knowledgeBase)

  search(filters) {
    // Returns Training[] matching all filters
  }

  searchByExercises(include, exclude)
  filterByIntensity(trainings, intensityRange)
  filterBySetType(trainings, setType)
}
```

#### filters.js
Filter logic implementation:

```javascript
function applyIncludeFilter(trainings, exercises) {
  // AND logic - training must have ALL exercises
}

function applyExcludeFilter(trainings, exercises) {
  // OR logic - training must have NONE of the exercises
}

function matchExerciseName(exercise, searchTerm) {
  // Fuzzy matching with Cyrillic support
}
```

**Performance Target:** Search in < 100ms

### 3. Presentation Layer (Agent 3)

#### ui.js
User interface logic:

```javascript
function handleFileUpload(file)
function displayKnowledgeBase(kb)
function renderWeekList(weeks)
function renderTrainingCard(training)
function displaySearchResults(results)
function showTrainingDetails(training)
function updateSearchFilters(filters)
```

#### timer.js
Tabata timer implementation:

```javascript
class TabataTimer {
  constructor(config)

  start()
  pause()
  resume()
  stop()
  reset()

  onTick(callback)
  onComplete(callback)

  getCurrentExercise()
  getProgress()
}
```

#### styles.css
Responsive design:
- Mobile-first approach
- Flexbox/Grid layouts
- CSS variables for theming
- Smooth animations
- Touch-friendly interactions

### 4. Persistence Layer (Agent 4)

#### storage.js
Data persistence:

```javascript
class StorageManager {
  saveKnowledgeBase(kb)
  loadKnowledgeBase()

  exportToJSON(kb)
  importFromJSON(json)

  enableAutoSave()
  createBackup()
  restoreFromBackup()

  clearAllData()
  getStorageSize()
}
```

#### editor.js
Data modification:

```javascript
class Editor {
  updateExercise(exercise, changes)
  addExerciseToBlock(block, exercise)
  removeExercise(block, index)

  addTraining(week, training)
  addWeek(kb, week)

  undo()
  redo()
}
```

#### export.js
File export:

```javascript
class ExportManager {
  exportToPDF(training)
  exportToImage(training)
  exportMultipleToPDF(trainings)

  printTraining(training)

  setPageSize(size)
  setMargins(margins)
}
```

## Data Flow

### Primary Workflows

#### 1. Upload & Parse Workflow
```
User selects file
    ↓
handleFileUpload() reads file
    ↓
parseTrainingFile() processes Excel
    ↓
KnowledgeBase created and populated
    ↓
displayKnowledgeBase() renders UI
    ↓
StorageManager.saveKnowledgeBase() auto-saves
```

#### 2. Search Workflow
```
User enters search criteria
    ↓
updateSearchFilters() collects filters
    ↓
TrainingSearch.search() applies filters
    ↓
displaySearchResults() shows results
    ↓
User clicks training → showTrainingDetails()
```

#### 3. Timer Workflow
```
User selects training
    ↓
Extract exercises from training
    ↓
TabataTimer initialized with exercises
    ↓
User starts timer
    ↓
Timer cycles through exercises
    ↓
Visual/audio cues for work/rest
    ↓
Timer completes → onComplete callback
```

#### 4. Edit & Save Workflow
```
User edits exercise
    ↓
Editor.updateExercise() modifies data
    ↓
KnowledgeBase updated
    ↓
StorageManager.saveKnowledgeBase() auto-saves
    ↓
UI re-renders to show changes
```

#### 5. Export Workflow
```
User selects training(s)
    ↓
ExportManager.exportToPDF()
    ↓
jsPDF generates PDF
    ↓
File downloaded to user's device
```

## Storage Architecture

### LocalStorage Schema

```javascript
// Main knowledge base
localStorage['trainingPlan_knowledgeBase'] = {
  version: '1.0',
  lastUpdated: timestamp,
  weeks: [...],
  exercises: {...}
}

// Backup
localStorage['trainingPlan_backup'] = {...}

// User preferences
localStorage['trainingPlan_preferences'] = {
  theme: 'light',
  autoSave: true,
  timerSettings: {...}
}
```

### Data Integrity

- **Validation** on save/load
- **Backup** before major operations
- **Error recovery** from corrupted data
- **Version management** for schema changes

## Performance Optimization

### Parsing
- Stream processing for large files
- Lazy evaluation where possible
- Memoization of computed values

### Search
- Index exercises for O(1) lookup
- Filter in order of selectivity
- Early termination when possible

### UI Rendering
- Virtual scrolling for long lists
- Debounced search inputs
- Lazy loading of images
- RequestAnimationFrame for animations

### Storage
- Compress data before storing
- Batch localStorage writes
- Background save operations

## Security Considerations

### Client-Side Security
- Input validation
- XSS prevention
- No eval() or dangerous functions
- Sanitized HTML rendering

### Data Privacy
- No external API calls
- No tracking or analytics
- All data stays local
- Clear data deletion

## Browser Compatibility

### Required Features
- ES6+ JavaScript
- LocalStorage API
- File API
- Canvas API (for export)
- Flexbox/Grid CSS

### Polyfills
None required - we target modern browsers only

### Graceful Degradation
- Feature detection
- Fallback for missing APIs
- Clear error messages

## Error Handling

### Strategy
1. **Validate** - Check inputs before processing
2. **Try-Catch** - Wrap risky operations
3. **Recover** - Attempt to recover from errors
4. **Report** - Show user-friendly error messages
5. **Log** - Console logging for debugging

### Error Types
- **Parse Errors** - Invalid Excel format
- **Search Errors** - Invalid filters
- **Storage Errors** - Quota exceeded
- **Export Errors** - PDF generation failed

## Testing Architecture

### Test Layers
1. **Unit Tests** - Individual functions
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full workflows
4. **Performance Tests** - Benchmarks
5. **Manual Tests** - UI/UX validation

### Test Runner
Custom lightweight test framework:
- No external dependencies
- Browser-based execution
- Real-time results
- Visual reporting

## Scalability

### Current Limits
- 1000 trainings per knowledge base
- 100 exercises per training
- 5MB localStorage limit

### Optimization Strategies
- Pagination for large lists
- Compression for storage
- Indexes for fast search
- Lazy loading

## Future Architecture Considerations

### Potential Enhancements
1. **Service Worker** - Offline support
2. **IndexedDB** - Larger storage
3. **Web Workers** - Background processing
4. **PWA** - Installable app
5. **WebRTC** - Peer sharing
6. **WebAssembly** - Faster parsing

### Migration Path
- Version field in data schema
- Migration functions for updates
- Backward compatibility

## Development Guidelines

### Code Organization
- One responsibility per file
- Pure functions where possible
- Clear naming conventions
- JSDoc comments

### Agent Responsibilities
- **Agent 1** - Data model & parser
- **Agent 2** - Search & filters
- **Agent 3** - UI & timer
- **Agent 4** - Storage & export
- **Agent 5** - Testing & QA (gatekeeper)

### Quality Gates
All code must pass Agent 5's review:
- Tests pass
- Performance targets met
- No console errors
- Responsive design verified
- Code reviewed

## Deployment

### Build Process
None required! Just open the HTML file.

### Hosting Options
1. **Local** - File system
2. **Static** - GitHub Pages, Netlify
3. **Server** - Any web server

### Updates
- Download new version
- Import existing data
- Continue working

---

**Last Updated:** 2025-11-23
**Version:** 1.0.0
