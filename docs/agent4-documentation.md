# Agent 4 Documentation
## Storage, Editing & Export

### Overview

Agent 4 is responsible for all data persistence, editing, and export functionality in the Training Plan Manager. This includes:

- **Storage**: Auto-save to localStorage, export/import JSON files
- **Editing**: Update and add exercises, blocks, trainings, and weeks
- **Export**: Generate PDFs and images for gym use

**CRITICAL**: Data integrity and reliability are paramount. Users must never lose their training data.

---

## Files Created

### 1. `app/js/storage.js` - StorageManager Class

The StorageManager handles all save/load operations with a focus on data integrity.

#### Features

- **Auto-save with debouncing**: Saves to localStorage after 500ms of inactivity
- **Backup system**: Creates backup before each save to prevent data loss
- **Version tracking**: Stores version info with data for future migrations
- **Error recovery**: Attempts to load from backup if main data is corrupted
- **Export/Import**: Download/upload JSON files for manual backup
- **Statistics**: Tracks save count, errors, and data size

#### Key Methods

```javascript
// Auto-save to localStorage (debounced)
autoSave(knowledgeBase) -> Promise<boolean>

// Load from localStorage
autoLoad() -> Object|null

// Export to JSON file
exportToFile(knowledgeBase, filename) -> boolean

// Import from JSON file
importFromFile(file) -> Promise<Object>

// Clear all stored data
clearStorage(keepBackup) -> boolean

// Check if saved data exists
hasSavedData() -> boolean

// Get info about saved data
getSavedDataInfo() -> Object

// Enable/disable auto-save
setAutoSave(enabled) -> void

// Get storage statistics
getStats() -> Object
```

#### Usage Example

```javascript
const storage = new StorageManager();

// Auto-save after changes
storage.autoSave(knowledgeBase);

// Load on startup
const savedData = storage.autoLoad();
if (savedData) {
  kb.fromJSON(savedData);
}

// Export for backup
storage.exportToFile(kb, 'my-training-plan.json');

// Import from file
const file = document.getElementById('fileInput').files[0];
const data = await storage.importFromFile(file);
kb.fromJSON(data);
```

#### Error Handling

The StorageManager includes comprehensive error handling:

- **QuotaExceededError**: Automatically removes backup to free space
- **Parse errors**: Falls back to backup data
- **Missing data**: Returns null gracefully
- **Error tracking**: Stores last 10 errors with timestamps

---

### 2. `app/js/editor.js` - TrainingEditor Class

The TrainingEditor provides comprehensive editing capabilities with undo/redo support.

#### Features

- **Update operations**: Edit exercises, blocks, trainings, and weeks
- **Add operations**: Create new content at any level
- **Delete operations**: Remove content with safety checks
- **Undo/Redo**: Full history support (50 action limit)
- **Change tracking**: Event listeners for UI updates
- **Validation**: All inputs validated before saving
- **Auto-save integration**: Triggers storage save after each change

#### Key Methods

##### Update Methods

```javascript
// Update an exercise
updateExercise(exerciseId, { name, repetitions, weight }) -> boolean

// Update a block
updateBlock(blockId, { rounds, restInfo, setType }) -> boolean

// Update a training
updateTraining(trainingId, { intensityPercent, date, trainingNumber }) -> boolean

// Update a week
updateWeek(weekId, { dateRange, description, intensity }) -> boolean
```

##### Add Methods

```javascript
// Add exercise to block
addExerciseToBlock(blockId, exerciseData) -> Object

// Add block to training
addBlockToTraining(trainingId, blockData) -> Object

// Add training to week
addTrainingToWeek(weekId, trainingData) -> Object

// Add new week
addWeek(weekData) -> Object
```

##### Delete Methods

```javascript
// Delete exercise
deleteExercise(exerciseId) -> boolean

// Delete block
deleteBlock(blockId) -> boolean

// Delete training
deleteTraining(trainingId) -> boolean

// Delete week
deleteWeek(weekId) -> boolean
```

##### Undo/Redo

```javascript
// Undo last action
undo() -> boolean

// Redo last undone action
redo() -> boolean

// Check if undo available
canUndo() -> boolean

// Check if redo available
canRedo() -> boolean

// Clear history
clearHistory() -> void
```

##### Change Listeners

```javascript
// Add change listener
onChange(callback) -> void

// Remove change listener
offChange(callback) -> void

// Callback signature: (type, data) => void
// Example:
editor.onChange((type, data) => {
  console.log('Changed:', type, data);
  updateUI();
});
```

#### Usage Example

```javascript
const editor = new TrainingEditor(knowledgeBase, storageManager);

// Listen for changes
editor.onChange((type, data) => {
  console.log('Data changed:', type);
  updateDisplay();
});

// Update exercise
editor.updateExercise('ex_123', {
  name: 'Pull-ups',
  repetitions: '10',
  weight: ''
});

// Add new exercise
const newExercise = editor.addExerciseToBlock('block_456', {
  name: 'Push-ups',
  repetitions: '20',
  weight: ''
});

// Undo if needed
if (editor.canUndo()) {
  editor.undo();
}
```

#### Validation

All inputs are validated:

- **Exercise name**: Must be non-empty string
- **Repetitions**: Accepts any string format (e.g., "10", "5/5", "10-15")
- **Block rounds**: Must be positive integer
- **Training number**: Must be positive integer
- **Week date range**: Must be non-empty string

---

### 3. `app/js/export.js` - ExportManager Class

The ExportManager handles exporting trainings to PDF and image formats.

#### Features

- **Selection management**: Select individual trainings, weeks, or all
- **PDF export**: Multi-page PDFs with clean formatting (jsPDF)
- **Image export**: PNG/JPEG images of trainings (html2canvas)
- **Combined export**: All selected trainings in one image
- **Preview**: See what will be exported before exporting
- **Customization**: Configurable settings for export appearance

#### Key Methods

##### Selection

```javascript
// Add training to export group
addToExportGroup(trainingId) -> boolean

// Remove training from export group
removeFromExportGroup(trainingId) -> boolean

// Clear all selections
clearExportGroup() -> void

// Get selected trainings
getSelectedTrainings() -> Array<string>

// Check if training is selected
isSelected(trainingId) -> boolean

// Select all trainings from a week
selectWeek(weekId) -> number

// Select trainings by date range
selectByDateRange(startDate, endDate) -> number

// Select all trainings
selectAll() -> number
```

##### Export

```javascript
// Export as PDF
exportAsPDF(groupName) -> Promise<boolean>

// Export as individual images
exportAsImage(format, groupName) -> Promise<boolean>

// Export as combined image
exportAsCombinedImage(format, filename) -> Promise<boolean>

// Show preview
showExportPreview() -> string (HTML)

// Get export statistics
getExportStats() -> Object
```

##### Settings

```javascript
// Update export settings
updateSettings(newSettings) -> void

// Get current settings
getSettings() -> Object

// Available settings:
{
  pageSize: 'a4',
  orientation: 'portrait',
  fontSize: 12,
  lineHeight: 1.5,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  includeWeekInfo: true,
  includeIntensity: true,
  includeDate: true
}
```

#### Usage Example

```javascript
const exportManager = new ExportManager(knowledgeBase);

// Select trainings
exportManager.selectWeek('week_123'); // Select all trainings in week
exportManager.addToExportGroup('training_456'); // Add specific training

// Preview
const preview = exportManager.showExportPreview();
document.getElementById('preview').innerHTML = preview;

// Export as PDF
await exportManager.exportAsPDF('week-1-trainings');

// Export as images
await exportManager.exportAsImage('png', 'training');

// Export combined
await exportManager.exportAsCombinedImage('png', 'all-trainings');

// Get stats
const stats = exportManager.getExportStats();
console.log(`Exporting ${stats.trainings} trainings with ${stats.exercises} exercises`);
```

#### Export Formats

**PDF Export:**
- Clean, readable layout
- Each training on a new page
- Includes week info, intensity, date
- Organized by blocks with exercises
- Export timestamp at bottom

**Image Export:**
- Individual images for each training
- Or combined image with all trainings
- High quality (2x scale)
- White background
- Phone-friendly format

---

### 4. `app/js/mock-data-model.js` - Mock KnowledgeBase

**NOTE**: This is a TEMPORARY mock implementation used for testing until Agent 1 completes the real KnowledgeBase.

#### Purpose

- Provides the expected interface for storage.js, editor.js, and export.js
- Allows testing and development without waiting for Agent 1
- Demonstrates the required API for Agent 1's implementation
- Can be deleted once Agent 1 completes data-model.js

#### Key Methods

```javascript
// Navigation
getWeek(weekId)
getTraining(trainingId)
getTrainingByWeekAndNumber(weekId, trainingNum)

// Data access
getAllExerciseNames()
getAllSetTypes()
getIntensityLevels()

// Serialization
toJSON() -> Object
fromJSON(json) -> void

// Sample data
createSampleData() -> void
```

#### Sample Data Structure

```javascript
{
  weeks: [
    {
      id: "week_1",
      dateRange: "8-14.01",
      description: "1 неделя жесткого кача",
      intensity: "high",
      trainings: [
        {
          id: "training_1",
          weekId: "week_1",
          trainingNumber: 1,
          intensityPercent: "60-70%",
          date: "8.01",
          blocks: [
            {
              id: "block_1",
              blockNumber: 1,
              rounds: 4,
              restInfo: "каждые 2-3 минуты",
              setType: "every_x_min",
              exercises: [
                {
                  id: "ex_1",
                  name: "болгарские выпады",
                  repetitions: "5/5",
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
    totalWeeks: 1,
    totalTrainings: 1,
    totalExercises: 1,
    allExerciseNames: ["болгарские выпады"],
    dateRange: "8-14.01",
    parsedDate: "2025-11-23T..."
  }
}
```

---

## Testing

### Test File: `tests/test-agent4.html`

A comprehensive test suite with a beautiful UI for testing all Agent 4 functionality.

#### Features

- **Interactive UI**: Click buttons to test each feature
- **Visual feedback**: Color-coded success/error messages
- **Live statistics**: See data counts in real-time
- **Comprehensive coverage**: Tests all storage, editing, and export features
- **Integration tests**: Full workflow and data integrity tests
- **Performance tests**: Large dataset performance testing

#### How to Use

1. Open `tests/test-agent4.html` in a browser
2. Click "Create Sample Data" to start
3. Test individual features with buttons
4. Check console for detailed logs
5. Run "Run All Tests" for comprehensive testing

#### Test Categories

**Storage Tests:**
- Create sample data
- Auto-save
- Auto-load
- Export JSON
- Import JSON
- Clear storage

**Editor Tests:**
- Update exercise/block/training/week
- Add exercise/block/training/week
- Delete exercise/block/training
- Undo/Redo
- View history

**Export Tests:**
- Select trainings (individual, by week, all)
- Export PDF
- Export images
- Export combined image
- Preview

**Integration Tests:**
- Full workflow test
- Data integrity check
- Large dataset performance test
- All features test

---

## Integration with Other Agents

### Agent 1 (Parser)

**What Agent 4 Needs from Agent 1:**

```javascript
class KnowledgeBase {
  // Serialization (required by storage.js)
  toJSON() -> Object
  fromJSON(json) -> void

  // Navigation (used by editor.js and export.js)
  weeks: Array<Week>
  metadata: Object

  // Optional helpers
  getAllExerciseNames() -> Array<string>
  getAllSetTypes() -> Array<string>
  getIntensityLevels() -> Array<string>
}
```

**Integration:**

Once Agent 1 completes data-model.js:
1. Replace MockKnowledgeBase with real KnowledgeBase
2. Test with real parsed data
3. Verify toJSON/fromJSON compatibility
4. Remove mock-data-model.js

### Agent 3 (Frontend)

**What Agent 3 Gets from Agent 4:**

```javascript
// Storage instance - for save/load operations
const storage = new StorageManager();

// Editor instance - for edit/add operations
const editor = new TrainingEditor(kb, storage);

// Export instance - for export operations
const exportManager = new ExportManager(kb);

// Agent 3 should:
// 1. Create UI for edit/add forms
// 2. Call editor methods when user clicks save
// 3. Listen to editor.onChange() for UI updates
// 4. Create export selection UI
// 5. Call export methods when user clicks export
```

**Example Integration:**

```javascript
// When user clicks "Edit Exercise"
function handleEditExercise(exerciseId) {
  // Show modal with form
  showEditModal(exerciseId);
}

// When user submits form
function saveExercise(exerciseId, formData) {
  editor.updateExercise(exerciseId, {
    name: formData.name,
    repetitions: formData.reps,
    weight: formData.weight
  });
  // Auto-save and UI update happen automatically
  closeModal();
}

// Listen for changes
editor.onChange((type, data) => {
  // Update UI
  refreshDisplay();
  showNotification(`${type} completed`);
});
```

### Agent 5 (Testing)

**What Agent 5 Should Test:**

1. **Data Integrity:**
   - Save/load cycle preserves all data
   - No data corruption
   - Handles large datasets

2. **Edit Operations:**
   - All CRUD operations work correctly
   - Validation prevents invalid data
   - Undo/redo works properly

3. **Export Quality:**
   - PDFs are readable
   - Images are clear
   - Phone-friendly format

4. **Error Handling:**
   - Graceful handling of quota exceeded
   - Recovery from corrupted data
   - User-friendly error messages

5. **Performance:**
   - Auto-save is fast (<100ms)
   - Load is instant (<50ms)
   - Export completes in reasonable time

---

## Best Practices

### Storage

1. **Always use auto-save**: Don't make users manually save
2. **Provide manual export**: For backups and peace of mind
3. **Show save status**: Let users know data is being saved
4. **Handle errors gracefully**: Don't lose data due to errors

### Editing

1. **Validate inputs**: Prevent invalid data from entering KB
2. **Provide undo/redo**: Users make mistakes
3. **Show confirmation**: For destructive operations (delete)
4. **Update UI immediately**: Don't wait for save

### Export

1. **Preview before export**: Let users see what they'll get
2. **Show progress**: For slow operations (image export)
3. **Clear formatting**: Make exports readable
4. **Phone-friendly**: Exports should look good on mobile

---

## Known Limitations

1. **localStorage quota**: ~5-10MB limit (sufficient for most training plans)
2. **Browser compatibility**: Requires modern browser with ES6 support
3. **CDN dependencies**: Requires internet for jsPDF and html2canvas
4. **Export size**: Large combined images may be slow

---

## Future Enhancements

Potential improvements for future versions:

1. **Cloud sync**: Save to cloud storage (Google Drive, Dropbox)
2. **Conflict resolution**: Handle concurrent edits
3. **Export templates**: Multiple PDF/image layouts
4. **Compression**: Reduce localStorage usage
5. **Offline support**: Service worker for offline access
6. **Version history**: Track changes over time
7. **Collaborative editing**: Multiple users editing same plan

---

## Troubleshooting

### Auto-save not working

**Check:**
- Is auto-save enabled? `storage.setAutoSave(true)`
- Are you calling `storage.autoSave(kb)` after changes?
- Check console for errors
- Check localStorage quota

**Fix:**
```javascript
// Enable auto-save
storage.setAutoSave(true);

// Verify it works
storage.autoSave(kb).then(success => {
  console.log('Auto-save:', success);
});
```

### Export PDF fails

**Check:**
- Is jsPDF loaded? Check `window.jspdf`
- Are trainings selected?
- Check browser console for errors

**Fix:**
```javascript
// Verify jsPDF loaded
if (typeof window.jspdf === 'undefined') {
  console.error('jsPDF not loaded');
}

// Check selection
console.log('Selected:', exportManager.getSelectedTrainings());
```

### Undo/Redo not available

**Check:**
- History might be empty or at limits
- Use `editor.canUndo()` and `editor.canRedo()`

**Fix:**
```javascript
if (editor.canUndo()) {
  editor.undo();
} else {
  console.log('Nothing to undo');
}
```

---

## Performance Tips

1. **Debounce auto-save**: Already implemented (500ms delay)
2. **Lazy load images**: For export preview
3. **Paginate large datasets**: If viewing 100+ weeks
4. **Index data**: For fast searching (Agent 2's job)
5. **Compress JSON**: For export files

---

## Security Considerations

1. **XSS Prevention**: Sanitize user input in exports
2. **localStorage Security**: Data is accessible to all scripts on same origin
3. **File Upload Validation**: Validate JSON structure when importing
4. **No sensitive data**: Training plans are not sensitive, but good practice

---

## API Reference

See individual class documentation above for detailed API reference.

**Quick Reference:**

- `StorageManager`: Save/load operations
- `TrainingEditor`: Edit/add/delete operations
- `ExportManager`: Export operations
- `MockKnowledgeBase`: Temporary KB implementation

---

## Success Criteria

Agent 4 is complete when:

- ✅ storage.js created and tested
- ✅ editor.js created and tested
- ✅ export.js created and tested
- ✅ Mock KB created for testing
- ✅ Comprehensive test suite created
- ✅ Documentation complete
- ✅ Auto-save works reliably
- ✅ Export produces readable PDFs
- ✅ Export produces clear images
- ✅ Data integrity maintained
- ✅ Large datasets handled efficiently
- ✅ Integration ready for Agent 3

---

## Contact

For questions or issues with Agent 4:

- Check test-agent4.html for examples
- Review this documentation
- Check console for error messages
- Review Agent 5's feedback in `.agent-workspace/agent4-storage/claude.md`

---

**Remember: Data integrity is paramount. Users trust us with their training plans!**
