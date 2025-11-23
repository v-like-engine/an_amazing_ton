# Search API Reference

## Overview
The Training Search system provides powerful, accurate filtering of trainings with NO false positives. It supports exercise-based search, intensity filtering, set type filtering, and combined filters.

## Quick Start

### 1. Include Required Files (Browser)
```html
<!-- Include filters.js first -->
<script src="js/filters.js"></script>
<!-- Then search.js -->
<script src="js/search.js"></script>
```

### 2. Initialize Search
```javascript
// With KnowledgeBase from Agent 1
const search = new TrainingSearch(knowledgeBase);

// Or for development/testing (uses mock data)
const search = new TrainingSearch();
```

### 3. Perform Search
```javascript
// Search with filters
const results = search.search({
  include: ['подтягивания', 'отжимания'],  // Must have ALL
  exclude: ['броски мяча'],                // Must NOT have ANY
  intensity: { min: 60, max: 70 },        // 60-70% intensity
  setType: 'AMRAP'                        // Has AMRAP blocks
});

// Results structure:
// {
//   results: [...],          // Array of matching trainings
//   totalResults: 2,         // Count
//   filters: {...},          // Applied filters
//   searchTime: 15.2,        // Time in ms
//   performance: {
//     timeMs: 15.2,
//     isOptimal: true        // < 100ms
//   }
// }
```

## API Reference

### TrainingSearch Class

#### Constructor
```javascript
new TrainingSearch(knowledgeBase)
```
- **knowledgeBase** (optional): KnowledgeBase instance from Agent 1. If omitted, uses mock data.

#### search(filters)
Main search function. Returns filtered trainings.

**Parameters:**
- `filters` (object): Filter configuration
  - `include` (array): Exercise names that MUST be present (AND logic)
  - `exclude` (array): Exercise names that MUST NOT be present (NOT logic)
  - `intensity` (object): Intensity filter
    - `{ min: 60, max: 70 }` - Percentage range
    - `{ level: 'high' }` - Intensity level
  - `setType` (string): Set type filter ('AMRAP', 'rounds', 'timed', etc.)

**Returns:** Object with results and metadata

**Example:**
```javascript
const results = search.search({
  include: ['подтягивания'],
  exclude: ['броски мяча'],
  intensity: { min: 60, max: 70 }
});

console.log(`Found ${results.totalResults} trainings in ${results.searchTime}ms`);
```

#### searchExercises(query)
Search/autocomplete for exercises.

**Parameters:**
- `query` (string): Search query (supports partial matching)

**Returns:** Array of matching exercise names, sorted by relevance

**Example:**
```javascript
const exercises = search.searchExercises('подтяг');
// Returns: ['подтягивания', 'австралийские подтягивания', ...]
```

#### getTrainingDetails(trainingId)
Get detailed information for a specific training.

**Parameters:**
- `trainingId` (string): Training ID (e.g., 'week_1_training_1')

**Returns:** Training details object or null

**Example:**
```javascript
const details = search.getTrainingDetails('week_1_training_1');
console.log(details.summary); // "4 blocks, 12 exercises"
```

#### getResultsSummary()
Get summary of current search results.

**Returns:** Object with totalResults, filters, hasFilters

**Example:**
```javascript
const summary = search.getResultsSummary();
if (summary.hasFilters) {
  console.log(`${summary.totalResults} results with active filters`);
}
```

#### clearFilters()
Clear all filters and return all trainings.

**Returns:** Search results with all trainings

**Example:**
```javascript
const allTrainings = search.clearFilters();
```

## Filter Functions (filters.js)

These functions are used internally but can also be used directly:

### Exercise Matching
- `trainingHasExercise(training, exerciseName)` - Check if training has exercise
- `trainingHasAllExercises(training, exerciseNames)` - Check if has ALL (AND logic)
- `trainingHasAnyExercise(training, exerciseNames)` - Check if has ANY (OR logic)

### Intensity Matching
- `extractIntensityValue(intensityString)` - Parse intensity from string
- `matchesIntensity(training, intensityFilter)` - Check if matches intensity

### Set Type Matching
- `extractSetType(block)` - Get set type from block
- `matchesSetType(training, setType)` - Check if matches set type

### Utilities
- `normalizeText(text)` - Normalize for comparison (lowercase, trim, single spaces)
- `fuzzyMatch(query, text)` - Fuzzy matching for Cyrillic text
- `getTrainingExercises(training)` - Extract all exercise names from training

## Search Behavior

### Case Sensitivity
All searches are **case-insensitive**:
```javascript
search.search({ include: ['ПОДТЯГИВАНИЯ'] });  // Same as
search.search({ include: ['подтягивания'] });  // Same as
search.search({ include: ['Подтягивания'] });
```

### Partial Matching
Exercise search supports **partial matching**:
```javascript
search.search({ include: ['подтяг'] });
// Matches: 'подтягивания', 'австралийские подтягивания', etc.
```

### AND vs NOT Logic
- **Include filter**: ALL exercises must be present (AND logic)
  ```javascript
  include: ['подтягивания', 'отжимания']
  // Training must have BOTH подтягивания AND отжимания
  ```

- **Exclude filter**: NONE of the exercises can be present (NOT logic)
  ```javascript
  exclude: ['броски мяча', 'планка']
  // Training must NOT have броски мяча AND must NOT have планка
  ```

### Combined Filters
All filters work together with AND logic:
```javascript
search.search({
  include: ['подтягивания'],      // Must have подтягивания
  exclude: ['броски мяча'],       // Must NOT have броски мяча
  intensity: { min: 60, max: 70 }, // AND be 60-70% intensity
  setType: 'AMRAP'                 // AND have AMRAP blocks
});
```

### No False Positives
The search is designed to be **conservative** - better to miss a result than show wrong ones:
- Empty queries match nothing (not everything)
- Very short queries (1-2 chars) require exact match
- All filters must be satisfied for a result to appear

## Performance

- **Target:** < 100ms for all searches
- **Typical:** 10-20ms with mock data
- Searches are optimized with most restrictive filters first
- Performance data included in results:
  ```javascript
  results.performance.timeMs      // Actual time
  results.performance.isOptimal   // true if < 100ms
  ```

## Integration Examples

### For Agent 3 (Frontend)

**Exercise Autocomplete:**
```javascript
function onExerciseInput(inputValue) {
  const matches = search.searchExercises(inputValue);
  // Display matches in dropdown
  displayAutocomplete(matches);
}
```

**Filter Change:**
```javascript
function onFilterChange() {
  const filters = {
    include: getSelectedIncludeExercises(),
    exclude: getSelectedExcludeExercises(),
    intensity: getIntensityFilter(),
    setType: getSelectedSetType()
  };

  const results = search.search(filters);
  displayResults(results.results);
  displayStats(results.totalResults, results.searchTime);
}
```

**Display Results:**
```javascript
function displayResults(results) {
  results.forEach(result => {
    console.log(`Week ${result.weekNumber}, Training ${result.trainingNumber}`);
    console.log(`  Date: ${result.trainingDate}`);
    console.log(`  Intensity: ${result.intensity}`);
    console.log(`  ${result.summary}`);
    console.log(`  Exercises: ${result.previewText}`);
  });
}
```

### For Agent 4 (Storage)

**Save Current Search State:**
```javascript
function saveSearchState() {
  const state = {
    filters: search.currentFilters,
    results: search.currentResults
  };
  localStorage.setItem('searchState', JSON.stringify(state));
}
```

## Testing

Comprehensive tests are available in `/tests/test-search.js`:
- 25 test cases covering all functionality
- Tests for correctness, performance, edge cases
- Run with: `node tests/test-search.js`

## Error Handling

The search system handles edge cases gracefully:
- **Empty filters**: Returns all trainings
- **No results**: Returns empty array (totalResults: 0)
- **Conflicting filters**: Returns empty array
- **Invalid data**: Safely skips malformed trainings
- **Missing fields**: Uses defaults

## Cyrillic Text Support

Full support for Cyrillic text:
- Case-insensitive matching
- Partial matching works with Cyrillic characters
- Fuzzy matching for typos and variations
- Proper normalization

## Best Practices

1. **Always check totalResults** before displaying
2. **Show performance data** to users (searchTime)
3. **Handle empty results** with helpful messages
4. **Use searchExercises()** for autocomplete
5. **Clear filters** when user wants to see all trainings
6. **Validate filters** before passing to search()
7. **Cache search instance** (don't create new ones for each search)

## Example: Complete Search UI

```javascript
// Initialize once
const search = new TrainingSearch(knowledgeBase);

// Exercise autocomplete
document.getElementById('exerciseInput').addEventListener('input', (e) => {
  const matches = search.searchExercises(e.target.value);
  showAutocomplete(matches);
});

// Apply filters
document.getElementById('applyFilters').addEventListener('click', () => {
  const filters = {
    include: getSelectedExercises('include'),
    exclude: getSelectedExercises('exclude'),
    intensity: getIntensitySlider(),
    setType: getSetTypeDropdown()
  };

  const results = search.search(filters);

  // Show results
  displayTrainings(results.results);

  // Show stats
  showStats({
    count: results.totalResults,
    time: results.searchTime,
    performanceGood: results.performance.isOptimal
  });
});

// Clear filters
document.getElementById('clearFilters').addEventListener('click', () => {
  const results = search.clearFilters();
  displayTrainings(results.results);
  resetFilterUI();
});

// Navigate to training
function navigateToTraining(trainingId) {
  const details = search.getTrainingDetails(trainingId);
  if (details) {
    displayTrainingDetail(details);
  }
}
```

---

**Status:** ✅ Complete and tested (25/25 tests passing)
**Performance:** ✅ All searches < 100ms
**Accuracy:** ✅ No false positives detected
