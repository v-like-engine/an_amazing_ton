# Agent 4 - Quick Start Guide

## For Agent 3 (Frontend Integration)

### Step 1: Include Required Libraries

Add to `index.html` before your scripts:

```html
<!-- PDF Export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- Image Export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Agent 1's Data Model -->
<script src="js/data-model.js"></script>

<!-- Agent 4's Modules -->
<script src="js/storage.js"></script>
<script src="js/editor.js"></script>
<script src="js/export.js"></script>
```

### Step 2: Initialize on Page Load

```javascript
// Global instances
let kb = new KnowledgeBase();
let storage = new StorageManager();
let editor = new TrainingEditor(kb, storage);
let exportManager = new ExportManager(kb);

// On page load
window.addEventListener('DOMContentLoaded', () => {
  // Try to load saved data
  const savedData = storage.autoLoad();

  if (savedData) {
    kb.fromJSON(savedData);
    console.log('Loaded from storage:', kb.metadata);
  } else {
    // Show file upload prompt
    showFileUpload();
  }

  // Listen for changes
  editor.onChange((type, data) => {
    console.log('Data changed:', type);
    updateUI(); // Your function to refresh display
  });
});
```

### Step 3: Handle File Upload (XLSX)

```javascript
function handleFileUpload(file) {
  // Agent 1's parser will parse the file
  parseTrainingFile(file).then(parsedKB => {
    kb = parsedKB;

    // Update editor and export manager
    editor = new TrainingEditor(kb, storage);
    exportManager = new ExportManager(kb);

    // Auto-save
    storage.autoSave(kb);

    // Update UI
    updateUI();
  });
}
```

### Step 4: Edit Operations

#### Update Exercise

```javascript
// When user clicks "Edit Exercise" button
function showEditExerciseModal(exerciseId) {
  // Get current data
  const result = findExercise(exerciseId); // Your helper
  const { exercise } = result;

  // Show modal with form pre-filled
  openModal({
    title: 'Edit Exercise',
    fields: {
      name: exercise.name,
      reps: exercise.repetitions,
      weight: exercise.weight
    },
    onSave: (formData) => {
      editor.updateExercise(exerciseId, {
        name: formData.name,
        repetitions: formData.reps,
        weight: formData.weight
      });
      // Auto-save happens automatically
      closeModal();
    }
  });
}
```

#### Add New Exercise

```javascript
// When user clicks "Add Exercise" button
function showAddExerciseModal(blockId) {
  openModal({
    title: 'Add Exercise',
    fields: {
      name: '',
      reps: '',
      weight: ''
    },
    onSave: (formData) => {
      const newExercise = editor.addExerciseToBlock(blockId, {
        name: formData.name,
        repetitions: formData.reps,
        weight: formData.weight
      });
      // Auto-save happens automatically
      closeModal();
    }
  });
}
```

#### Delete Exercise

```javascript
function deleteExercise(exerciseId) {
  if (confirm('Delete this exercise?')) {
    editor.deleteExercise(exerciseId);
    // Auto-save happens automatically
  }
}
```

#### Undo/Redo

```javascript
// Undo button
document.getElementById('undoBtn').addEventListener('click', () => {
  if (editor.canUndo()) {
    editor.undo();
  }
});

// Redo button
document.getElementById('redoBtn').addEventListener('click', () => {
  if (editor.canRedo()) {
    editor.redo();
  }
});

// Update button states
function updateUndoRedoButtons() {
  document.getElementById('undoBtn').disabled = !editor.canUndo();
  document.getElementById('redoBtn').disabled = !editor.canRedo();
}

// Call this in your change listener
editor.onChange(() => {
  updateUI();
  updateUndoRedoButtons();
});
```

### Step 5: Export Operations

#### Select Trainings for Export

```javascript
// Select individual training
function selectTraining(trainingId, isChecked) {
  if (isChecked) {
    exportManager.addToExportGroup(trainingId);
  } else {
    exportManager.removeFromExportGroup(trainingId);
  }
  updateExportStats();
}

// Select entire week
function selectWeek(weekId) {
  const count = exportManager.selectWeek(weekId);
  console.log(`Selected ${count} trainings`);
  updateExportStats();
}

// Select all
function selectAllTrainings() {
  exportManager.selectAll();
  updateExportStats();
}

// Update UI with selection stats
function updateExportStats() {
  const stats = exportManager.getExportStats();
  document.getElementById('selectedCount').textContent = stats.trainings;
}
```

#### Export to PDF

```javascript
async function exportToPDF() {
  if (exportManager.getSelectedTrainings().length === 0) {
    alert('Please select trainings to export');
    return;
  }

  try {
    showLoading('Generating PDF...');
    await exportManager.exportAsPDF('my-trainings');
    hideLoading();
    showNotification('PDF exported successfully!');
  } catch (error) {
    hideLoading();
    showError('PDF export failed: ' + error.message);
  }
}
```

#### Export to Images

```javascript
async function exportToImages() {
  if (exportManager.getSelectedTrainings().length === 0) {
    alert('Please select trainings to export');
    return;
  }

  try {
    showLoading('Generating images...');
    await exportManager.exportAsImage('png', 'training');
    hideLoading();
    showNotification('Images exported successfully!');
  } catch (error) {
    hideLoading();
    showError('Image export failed: ' + error.message);
  }
}
```

#### Show Export Preview

```javascript
function showExportPreview() {
  const preview = exportManager.showExportPreview();
  document.getElementById('previewContainer').innerHTML = preview;
  openPreviewModal();
}
```

### Step 6: Manual Save/Load

#### Export JSON Backup

```javascript
function exportBackup() {
  const filename = `training-plan-${new Date().toISOString().split('T')[0]}.json`;
  storage.exportToFile(kb, filename);
}
```

#### Import JSON Backup

```javascript
async function importBackup(file) {
  try {
    const data = await storage.importFromFile(file);
    kb.fromJSON(data);

    // Update other managers
    editor = new TrainingEditor(kb, storage);
    exportManager = new ExportManager(kb);

    // Auto-save
    storage.autoSave(kb);

    // Update UI
    updateUI();

    showNotification('Backup imported successfully!');
  } catch (error) {
    showError('Import failed: ' + error.message);
  }
}
```

### Step 7: UI Event Handlers

#### Training Display

```javascript
function displayTraining(trainingId) {
  const training = kb.getTraining(trainingId);
  const week = kb.getWeek(training.weekId);

  let html = `
    <div class="training-header">
      <h2>Week: ${week.dateRange}</h2>
      <h3>Training ${training.trainingNumber}</h3>
      <p>Intensity: ${training.intensityPercent}</p>
      <button onclick="editTraining('${trainingId}')">Edit</button>
      <button onclick="exportManager.addToExportGroup('${trainingId}')">Select for Export</button>
    </div>
  `;

  training.blocks.forEach(block => {
    html += `
      <div class="block">
        <h4>Block ${block.blockNumber}: ${block.rounds} rounds</h4>
        <button onclick="editBlock('${block.id}')">Edit Block</button>
        <button onclick="addExercise('${block.id}')">Add Exercise</button>
        <ul>
    `;

    block.exercises.forEach(exercise => {
      html += `
        <li>
          ${exercise.name} - ${exercise.repetitions} ${exercise.weight}
          <button onclick="editExercise('${exercise.id}')">Edit</button>
          <button onclick="deleteExercise('${exercise.id}')">Delete</button>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
    `;
  });

  document.getElementById('trainingView').innerHTML = html;
}
```

### Step 8: Save Indicators

```javascript
// Show save status
function showSaveStatus() {
  const indicator = document.getElementById('saveIndicator');
  indicator.textContent = 'Saving...';
  indicator.className = 'saving';

  setTimeout(() => {
    indicator.textContent = 'Saved';
    indicator.className = 'saved';
  }, 500);
}

// Call this in your change listener
editor.onChange((type, data) => {
  showSaveStatus();
  updateUI();
});
```

## Testing

Open `tests/test-agent4.html` in a browser to:
- See working examples of all features
- Test functionality interactively
- View code examples
- Verify integration works

## Need Help?

1. Check `docs/agent4-documentation.md` for full API reference
2. Look at `tests/test-agent4.html` for working examples
3. Check browser console for error messages
4. Verify CDN libraries are loaded (jsPDF, html2canvas)

## Common Issues

### Auto-save not working
- Make sure you call `storage.autoSave(kb)` after changes
- Or let editor handle it automatically via onChange listener

### PDF export fails
- Check if jsPDF is loaded: `console.log(typeof window.jspdf)`
- Make sure trainings are selected
- Check browser console for errors

### Undo not available
- Check `editor.canUndo()` before calling `editor.undo()`
- History is limited to 50 actions

### Data not persisting
- Check localStorage quota (view in browser DevTools)
- Verify auto-save is enabled: `storage.setAutoSave(true)`
- Check for errors in console

## Performance Tips

1. **Auto-save is debounced** (500ms delay) - no need to throttle yourself
2. **Use change listeners** instead of polling for updates
3. **Export preview** can be slow with many trainings - consider pagination
4. **Large datasets**: Test with 100+ weeks to ensure performance

## Integration Checklist

- [ ] Libraries loaded (jsPDF, html2canvas)
- [ ] Instances created (storage, editor, exportManager)
- [ ] Auto-load on startup
- [ ] Change listener registered
- [ ] Edit forms call editor methods
- [ ] Export UI calls export methods
- [ ] Undo/Redo buttons work
- [ ] Save indicator shows status
- [ ] Error messages shown to user

**You're ready to integrate! Good luck!** 🚀
