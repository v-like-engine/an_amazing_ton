# API Reference

Developer documentation for the Training Plan Parser & Manager

## Table of Contents

1. [Overview](#overview)
2. [Data Model](#data-model)
3. [Parser Module](#parser-module)
4. [Search Module](#search-module)
5. [UI Module](#ui-module)
6. [Timer Module](#timer-module)
7. [Storage Module](#storage-module)
8. [Editor Module](#editor-module)
9. [Export Module](#export-module)
10. [Utilities](#utilities)

## Overview

This API reference documents all classes, functions, and interfaces in the Training Plan Parser & Manager. All code is written in vanilla JavaScript (ES6+).

### Module Structure

```
app/js/
├── data-model.js    # Core data structures
├── parser.js        # Excel parsing
├── search.js        # Search engine
├── filters.js       # Filter logic
├── ui.js           # UI interactions
├── timer.js        # Tabata timer
├── storage.js      # Data persistence
├── editor.js       # Data editing
└── export.js       # PDF/Image export
```

## Data Model

### KnowledgeBase

Main data container for all training information.

```javascript
class KnowledgeBase {
  constructor()

  // Properties
  weeks: Week[]
  exercises: Map<string, Exercise>
  metadata: Object

  // Methods
  addWeek(week: Week): void
  getWeek(weekNumber: number): Week
  getAllWeeks(): Week[]
  getAllExercises(): string[]
  getExerciseDetails(name: string): Exercise
  getTrainingsByWeek(weekNumber: number): Training[]
  findTrainingsByExercise(exerciseName: string): Training[]
  getTotalTrainings(): number
  toJSON(): Object
  fromJSON(json: Object): KnowledgeBase
}
```

**Example:**
```javascript
const kb = new KnowledgeBase();
kb.addWeek(new Week(1, "Week 1"));
const allExercises = kb.getAllExercises();
```

### Week

Represents a training week.

```javascript
class Week {
  constructor(weekNumber: number, name: string)

  // Properties
  weekNumber: number
  name: string
  trainings: Training[]
  startDate: Date
  endDate: Date

  // Methods
  addTraining(training: Training): void
  getTraining(name: string): Training
  getAllTrainings(): Training[]
  getTotalExercises(): number
  toJSON(): Object
}
```

**Example:**
```javascript
const week = new Week(1, "Foundation Week");
week.addTraining(new Training("Monday Strength", "Strength"));
```

### Training

Represents a single training session.

```javascript
class Training {
  constructor(name: string, type: string)

  // Properties
  name: string
  type: string  // "Strength", "Cardio", "Mixed", etc.
  blocks: Block[]
  intensity: string
  duration: number
  notes: string

  // Methods
  addBlock(block: Block): void
  getBlock(name: string): Block
  getAllBlocks(): Block[]
  getAllExercises(): Exercise[]
  getTotalExerciseCount(): number
  hasExercise(exerciseName: string): boolean
  getIntensityLevel(): string
  toJSON(): Object
}
```

**Example:**
```javascript
const training = new Training("Monday Strength", "Strength");
training.intensity = "70-80%";
training.addBlock(new Block("Block A", "AMRAP 10min"));
```

### Block

Represents a block of exercises within a training.

```javascript
class Block {
  constructor(name: string, info: string)

  // Properties
  name: string
  info: string  // "AMRAP 10min", "3 rounds", etc.
  exercises: Exercise[]
  setType: string
  restTime: number

  // Methods
  addExercise(exercise: Exercise): void
  removeExercise(index: number): void
  getExercise(index: number): Exercise
  getAllExercises(): Exercise[]
  getExerciseCount(): number
  toJSON(): Object
}
```

**Example:**
```javascript
const block = new Block("Block A", "AMRAP 10 minutes");
block.addExercise(new Exercise("Squats", "10", "100kg"));
block.addExercise(new Exercise("Push-ups", "15", "bodyweight"));
```

### Exercise

Represents a single exercise.

```javascript
class Exercise {
  constructor(name: string, repetitions: string, weight: string)

  // Properties
  name: string
  repetitions: string  // "10", "5-8", "max reps", etc.
  weight: string      // "100kg", "50%", "bodyweight", etc.
  notes: string
  tempo: string
  restTime: number

  // Methods
  update(changes: Object): void
  toJSON(): Object
  toString(): string
}
```

**Example:**
```javascript
const exercise = new Exercise("Back Squat", "5x5", "100kg");
exercise.notes = "Focus on depth";
exercise.tempo = "3-0-1-0";
```

## Parser Module

### parseTrainingFile()

Main parsing function for Excel files.

```javascript
async function parseTrainingFile(file: File): Promise<KnowledgeBase>
```

**Parameters:**
- `file` - Excel file (.xlsx) to parse

**Returns:**
- Promise resolving to populated KnowledgeBase

**Throws:**
- Error if file format is invalid
- Error if parsing fails

**Example:**
```javascript
const file = document.getElementById('fileInput').files[0];
try {
  const kb = await parseTrainingFile(file);
  console.log(`Parsed ${kb.getTotalTrainings()} trainings`);
} catch (error) {
  console.error('Parse failed:', error);
}
```

### extractIntensity()

Extracts intensity information from text.

```javascript
function extractIntensity(text: string): string
```

**Example:**
```javascript
const intensity = extractIntensity("жесткий кач 70-80%");
// Returns: "70-80%"
```

### parseRepetitions()

Parses repetition patterns.

```javascript
function parseRepetitions(text: string): Object
```

**Supported Formats:**
- "10" → { reps: 10 }
- "5x5" → { sets: 5, reps: 5 }
- "10-12" → { min: 10, max: 12 }
- "max reps" → { type: "max" }

### parseWeight()

Parses weight specifications.

```javascript
function parseWeight(text: string): Object
```

**Supported Formats:**
- "100kg" → { value: 100, unit: "kg" }
- "50%" → { value: 50, unit: "%" }
- "bodyweight" → { type: "bodyweight" }

### identifySetType()

Identifies the type of set structure.

```javascript
function identifySetType(text: string): string
```

**Returns:** "AMRAP", "EMOM", "rounds", "timed", "tabata", or "standard"

## Search Module

### TrainingSearch

Search engine for finding trainings.

```javascript
class TrainingSearch {
  constructor(knowledgeBase: KnowledgeBase)

  // Methods
  search(filters: Object): Training[]
  searchByExercises(include: string[], exclude: string[]): Training[]
  filterByIntensity(trainings: Training[], range: string): Training[]
  filterBySetType(trainings: Training[], type: string): Training[]
  getExerciseAutocomplete(query: string): string[]
}
```

**Filter Object:**
```javascript
{
  includeExercises: string[],  // Must have ALL
  excludeExercises: string[],  // Must have NONE
  intensity: string,           // "60-70", "high", etc.
  setType: string,            // "AMRAP", "rounds", etc.
  type: string                // "Strength", "Cardio", etc.
}
```

**Example:**
```javascript
const search = new TrainingSearch(knowledgeBase);

const results = search.search({
  includeExercises: ["Squats", "Push-ups"],
  excludeExercises: ["Pull-ups"],
  intensity: "70-80",
  setType: "AMRAP"
});

console.log(`Found ${results.length} trainings`);
```

### Filter Functions

#### applyIncludeFilter()

```javascript
function applyIncludeFilter(
  trainings: Training[],
  exercises: string[]
): Training[]
```

Returns trainings containing ALL specified exercises (AND logic).

#### applyExcludeFilter()

```javascript
function applyExcludeFilter(
  trainings: Training[],
  exercises: string[]
): Training[]
```

Returns trainings containing NONE of the specified exercises.

#### matchExerciseName()

```javascript
function matchExerciseName(
  exercise: string,
  searchTerm: string,
  fuzzy: boolean = true
): boolean
```

Matches exercise names with fuzzy matching and Cyrillic support.

## UI Module

### Event Handlers

```javascript
function handleFileUpload(event: Event): Promise<void>
function handleFileDrop(event: DragEvent): Promise<void>
function handleDragOver(event: DragEvent): void
```

### Display Functions

```javascript
function displayKnowledgeBase(kb: KnowledgeBase): void
function renderWeekList(weeks: Week[]): string
function renderTrainingCard(training: Training): string
function displaySearchResults(results: Training[]): void
function showTrainingDetails(training: Training): void
function closeModal(): void
```

### Filter UI

```javascript
function updateSearchFilters(filters: Object): void
function addExerciseChip(exercise: string, type: 'include'|'exclude'): void
function removeExerciseChip(exercise: string, type: 'include'|'exclude'): void
function showAutocompleteSuggestions(suggestions: string[]): void
```

### Feedback

```javascript
function showError(message: string): void
function showSuccess(message: string): void
function showLoadingIndicator(): void
function hideLoadingIndicator(): void
```

## Timer Module

### TabataTimer

Workout timer implementation.

```javascript
class TabataTimer {
  constructor(config: TimerConfig)

  // Properties
  workTime: number        // Seconds
  restTime: number       // Seconds
  exercises: string[]
  currentExerciseIndex: number
  currentPhase: 'work'|'rest'
  isRunning: boolean
  currentTime: number

  // Methods
  start(): void
  pause(): void
  resume(): void
  stop(): void
  reset(): void

  // Callbacks
  onTick: (state: TimerState) => void
  onPhaseChange: (phase: string) => void
  onExerciseChange: (exercise: string) => void
  onComplete: () => void

  // Getters
  getCurrentExercise(): string
  getNextExercise(): string
  getProgress(): number
  getRemainingTime(): number
  getTotalTime(): number
}
```

**TimerConfig:**
```javascript
{
  workTime: number,      // Work duration in seconds
  restTime: number,      // Rest duration in seconds
  exercises: string[],   // Exercise names
  rounds: number,        // Number of rounds
  warmup: number,        // Warmup time
  cooldown: number       // Cooldown time
}
```

**TimerState:**
```javascript
{
  currentTime: number,
  currentExercise: string,
  currentPhase: 'work'|'rest',
  progress: number,
  round: number
}
```

**Example:**
```javascript
const timer = new TabataTimer({
  workTime: 20,
  restTime: 10,
  exercises: ["Squats", "Push-ups", "Lunges"],
  rounds: 3
});

timer.onTick = (state) => {
  console.log(`${state.currentTime}s - ${state.currentExercise}`);
};

timer.onComplete = () => {
  console.log("Workout complete!");
};

timer.start();
```

### Utility Functions

```javascript
function formatTime(seconds: number): string
// Returns: "MM:SS" format

function playSound(soundType: 'start'|'end'|'warning'): void
// Plays audio cue
```

## Storage Module

### StorageManager

Manages data persistence.

```javascript
class StorageManager {
  constructor()

  // Save/Load
  saveKnowledgeBase(kb: KnowledgeBase): void
  loadKnowledgeBase(): KnowledgeBase
  autoSave(kb: KnowledgeBase): void
  enableAutoSave(): void
  disableAutoSave(): void

  // Import/Export
  exportToJSON(kb: KnowledgeBase): string
  importFromJSON(json: string): KnowledgeBase

  // Backup
  createBackup(): void
  restoreFromBackup(): KnowledgeBase
  listBackups(): Object[]

  // Management
  clearAllData(): void
  getStorageSize(): number
  checkStorageLimit(): boolean

  // Validation
  validateKnowledgeBase(kb: KnowledgeBase): boolean
}
```

**Example:**
```javascript
const storage = new StorageManager();

// Save
storage.saveKnowledgeBase(knowledgeBase);

// Load
const loaded = storage.loadKnowledgeBase();

// Export
const json = storage.exportToJSON(knowledgeBase);
const blob = new Blob([json], { type: 'application/json' });
// ... download blob

// Import
const imported = storage.importFromJSON(jsonString);
```

## Editor Module

### Editor

Handles data modifications.

```javascript
class Editor {
  constructor()

  // Exercise Operations
  updateExercise(exercise: Exercise, changes: Object): Exercise
  addExerciseToBlock(block: Block, exercise: Exercise): void
  removeExercise(block: Block, index: number): void

  // Block Operations
  addBlock(training: Training, block: Block): void
  removeBlock(training: Training, index: number): void
  updateBlock(block: Block, changes: Object): Block

  // Training Operations
  addTraining(week: Week, training: Training): void
  removeTraining(week: Week, index: number): void
  updateTraining(training: Training, changes: Object): Training

  // Week Operations
  addWeek(kb: KnowledgeBase, week: Week): void
  removeWeek(kb: KnowledgeBase, weekNumber: number): void

  // History
  undo(): void
  redo(): void
  clearHistory(): void
}
```

**Example:**
```javascript
const editor = new Editor();

// Update exercise
const updated = editor.updateExercise(exercise, {
  repetitions: "12",
  weight: "110kg"
});

// Add exercise
const newExercise = new Exercise("Pull-ups", "10", "bodyweight");
editor.addExerciseToBlock(block, newExercise);

// Undo
editor.undo();
```

## Export Module

### ExportManager

Handles PDF and image export.

```javascript
class ExportManager {
  constructor()

  // Export Methods
  exportToPDF(training: Training): Promise<void>
  exportToImage(training: Training): Promise<Blob>
  exportMultipleToPDF(trainings: Training[]): Promise<void>
  printTraining(training: Training): void

  // Configuration
  setPageSize(size: 'A4'|'Letter'|'Legal'): void
  setOrientation(orientation: 'portrait'|'landscape'): void
  setMargins(margins: Object): void
  setFontSize(size: number): void

  // Formatting
  formatForPDF(training: Training): Object
  formatExerciseForExport(exercise: Exercise): string

  // Utilities
  generateFilename(training: Training): string
  downloadFile(blob: Blob, filename: string): void
}
```

**Example:**
```javascript
const exporter = new ExportManager();

// Configure
exporter.setPageSize('A4');
exporter.setMargins({ top: 20, bottom: 20, left: 15, right: 15 });

// Export to PDF
await exporter.exportToPDF(training);

// Export to image
const imageBlob = await exporter.exportToImage(training);
exporter.downloadFile(imageBlob, 'training.png');

// Print
exporter.printTraining(training);
```

## Utilities

### String Utilities

```javascript
function normalizeString(str: string): string
// Normalizes Cyrillic and other special characters

function fuzzyMatch(str1: string, str2: string): boolean
// Fuzzy string matching

function sanitizeFilename(filename: string): string
// Removes invalid filename characters
```

### Array Utilities

```javascript
function unique(array: any[]): any[]
// Returns unique elements

function sortByProperty(array: Object[], property: string): Object[]
// Sorts array of objects by property
```

### Validation

```javascript
function isValidExerciseName(name: string): boolean
function isValidRepetitions(reps: string): boolean
function isValidWeight(weight: string): boolean
function isValidIntensity(intensity: string): boolean
```

### Performance

```javascript
function debounce(func: Function, wait: number): Function
// Debounces function calls

function throttle(func: Function, limit: number): Function
// Throttles function calls

function memoize(func: Function): Function
// Memoizes function results
```

## Error Handling

### Custom Errors

```javascript
class ParseError extends Error {
  constructor(message: string, row: number)
}

class SearchError extends Error {
  constructor(message: string, filters: Object)
}

class StorageError extends Error {
  constructor(message: string, operation: string)
}
```

### Error Recovery

```javascript
function handleParseError(error: ParseError): void
function handleStorageError(error: StorageError): void
function handleExportError(error: Error): void
```

## Events

### Custom Events

```javascript
// Dispatched when knowledge base is loaded
const kbLoadedEvent = new CustomEvent('kb:loaded', {
  detail: { knowledgeBase }
});

// Dispatched when search completes
const searchCompleteEvent = new CustomEvent('search:complete', {
  detail: { results, filters }
});

// Dispatched when data is saved
const dataSavedEvent = new CustomEvent('data:saved', {
  detail: { timestamp }
});
```

## Constants

```javascript
const CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,  // 5MB
  PARSE_TIMEOUT: 30000,             // 30 seconds
  SEARCH_DEBOUNCE: 300,             // 300ms
  AUTO_SAVE_INTERVAL: 5000,         // 5 seconds
  MAX_SEARCH_RESULTS: 100,
  STORAGE_KEY: 'trainingPlan_knowledgeBase',
  BACKUP_KEY: 'trainingPlan_backup'
};
```

## Type Definitions

For TypeScript users, here are the type definitions:

```typescript
interface IKnowledgeBase {
  weeks: Week[];
  exercises: Map<string, Exercise>;
  addWeek(week: Week): void;
  getAllExercises(): string[];
}

interface ISearchFilters {
  includeExercises?: string[];
  excludeExercises?: string[];
  intensity?: string;
  setType?: string;
  type?: string;
}

interface ITimerConfig {
  workTime: number;
  restTime: number;
  exercises: string[];
  rounds?: number;
}
```

---

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Maintained by:** Agent 5 (QA & Documentation)
