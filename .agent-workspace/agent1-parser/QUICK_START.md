# Quick Start Guide for Other Agents

## Using the Parser (Agent 3 - Frontend)

### HTML Setup
```html
<!-- Load dependencies -->
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
<script src="app/js/data-model.js"></script>
<script src="app/js/parser.js"></script>

<!-- File input -->
<input type="file" id="trainingFile" accept=".xlsx" />
```

### JavaScript Usage
```javascript
// Parse file when user selects it
document.getElementById('trainingFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];

  try {
    // Parse the file
    const kb = await parseTrainingFile(file);

    // Now you have a KnowledgeBase object with all the data
    console.log('Weeks:', kb.weeks);
    console.log('Stats:', kb.getStatistics());

  } catch (error) {
    console.error('Parse failed:', error);
  }
});
```

## Using the Knowledge Base (Agent 2 - Search)

### Get Exercise List for Autocomplete
```javascript
// Get all unique exercise names (sorted)
const exercises = kb.getAllExerciseNames();
// Returns: ["австралийские анжуманя", "анжуманя", "броски мяча", ...]
```

### Search Exercises
```javascript
// Search by partial name
const results = kb.searchExercises('австралийские');
// Returns array of { exercise, block, training, week }
```

### Filter by Intensity
```javascript
// Find high-intensity trainings
const highIntensity = kb.filterByIntensity('80-');
// Returns array of { training, week }
```

### Get Set Types
```javascript
const setTypes = kb.getAllSetTypes();
// Returns: ["AMRAP", "every_x_minutes", "rounds", "timed"]
```

## Storage Integration (Agent 4 - Storage)

### Save to LocalStorage
```javascript
// Export to JSON
const json = kb.toJSON();

// Save
localStorage.setItem('training-data', JSON.stringify(json));
```

### Load from LocalStorage
```javascript
// Load
const json = JSON.parse(localStorage.getItem('training-data'));

// Import
const kb = new KnowledgeBase();
kb.fromJSON(json);

// Now kb is ready to use
```

### Save to File (Download)
```javascript
const json = JSON.stringify(kb.toJSON(), null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'training-data.json';
a.click();
```

## Navigation & Display (Agent 3 - Frontend)

### Display Weeks
```javascript
kb.weeks.forEach(week => {
  console.log(`Week: ${week.dateRange} - ${week.description}`);
  console.log(`Trainings: ${week.trainings.length}`);
});
```

### Display a Training
```javascript
const training = kb.getTraining('week_1_training_1');
console.log(`Training ${training.trainingNumber}`);
console.log(`Intensity: ${training.intensityPercent}`);
console.log(`Blocks: ${training.blocks.length}`);

training.blocks.forEach(block => {
  console.log(`  Block ${block.blockNumber}`);
  block.exercises.forEach(ex => {
    console.log(`    - ${ex.name}: ${ex.repetitions} reps @ ${ex.weight}`);
  });
});
```

### Get Training by Week and Number
```javascript
const training = kb.getTrainingByWeekAndNumber('week_1', 1);
```

### Get Statistics
```javascript
const stats = kb.getStatistics();
console.log('Total trainings:', stats.totalTrainings);
console.log('Top exercises:', stats.topExercises);
```

## Data Structure Reference

```javascript
{
  weeks: [
    {
      id: "week_1",
      dateRange: "8-14.01",
      description: "1 неделя жесткого кача",
      intensity: "высокая",
      trainings: [
        {
          id: "week_1_training_1",
          weekId: "week_1",
          trainingNumber: 1,
          intensityPercent: "60-70%",
          blocks: [
            {
              id: "block_1",
              trainingId: "week_1_training_1",
              blockNumber: 1,
              rounds: 1,
              restInfo: "",
              setType: null,
              exercises: [
                {
                  id: "ex_1",
                  blockId: "block_1",
                  name: "австралийские анжуманя",
                  repetitions: "30",
                  weight: "",
                  weightType: null
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  metadata: {
    totalWeeks: 2,
    totalTrainings: 14,
    totalExercises: 94,
    allExerciseNames: [...],
    dateRange: "8-14.01 - 15-21.01",
    parsedDate: "2025-11-23"
  }
}
```

## Common Patterns

### Display a Week's Trainings
```javascript
const week = kb.getWeek('week_1');
week.trainings.forEach(training => {
  console.log(`Training ${training.trainingNumber}: ${training.intensityPercent}`);
});
```

### Count Exercises in a Block
```javascript
training.blocks.forEach(block => {
  console.log(`Block ${block.blockNumber}: ${block.exercises.length} exercises`);
});
```

### Find All Occurrences of an Exercise
```javascript
const occurrences = kb.searchExercises('австралийские анжуманя');
console.log(`Found in ${occurrences.length} places`);
```

## Helper Functions Available

All these are exported from `parser.js`:

- `parseTrainingFile(file)` - Main parsing function
- `extractIntensity(text)` - Extract intensity from text
- `parseBlockInfo(text)` - Parse block information
- `parseRepetitions(text)` - Parse repetition formats
- `parseWeight(text)` - Parse weight with units

## Testing Your Integration

### Quick Test in Browser Console
```javascript
// After parsing a file
console.log('Weeks:', kb.weeks.length);
console.log('Trainings:', kb.metadata.totalTrainings);
console.log('Exercises:', kb.metadata.totalExercises);
console.log('Top exercise:', kb.getStatistics().topExercises[0]);
```

### Test Search
```javascript
const results = kb.searchExercises('анжуманя');
console.log('Search results:', results.length);
```

### Test JSON Round-trip
```javascript
const json = kb.toJSON();
const kb2 = new KnowledgeBase();
kb2.fromJSON(json);
console.log('Round-trip OK:', kb2.weeks.length === kb.weeks.length);
```

## Need Help?

- Check `test-browser.html` for working examples
- Run `node test-parser.js` to see detailed output
- Check `.agent-workspace/agent1-parser/README.md` for full documentation
- All code is heavily commented with JSDoc

---

**Ready to integrate! Good luck!**
