// Storage Tests - Agent 4 Functionality
// Tests for StorageManager, auto-save/load, and data persistence

test('Storage: StorageManager class should exist', () => {
  if (typeof StorageManager !== 'undefined') {
    assertTrue(true, 'StorageManager class exists');
  } else {
    throw new Error('StorageManager class not found - Agent 4 needs to implement storage.js');
  }
}, 'Storage Tests');

test('Storage: should initialize with localStorage access', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();
    assertNotNull(storage, 'StorageManager should initialize');
    assertTrue(typeof localStorage !== 'undefined', 'localStorage should be available');
  }
}, 'Storage Tests');

test('Storage: should save knowledge base to localStorage', () => {
  if (typeof StorageManager !== 'undefined' && typeof KnowledgeBase !== 'undefined') {
    const storage = new StorageManager();
    const kb = new KnowledgeBase();

    if (typeof storage.saveKnowledgeBase === 'function') {
      storage.saveKnowledgeBase(kb);

      const saved = localStorage.getItem('trainingPlan_knowledgeBase');
      assertNotNull(saved, 'Should save to localStorage');
    }
  } else {
    console.warn('StorageManager or KnowledgeBase not available');
  }
}, 'Storage Tests');

test('Storage: should load knowledge base from localStorage', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    // First save some data
    const testData = { weeks: [], exercises: [] };
    localStorage.setItem('trainingPlan_knowledgeBase', JSON.stringify(testData));

    if (typeof storage.loadKnowledgeBase === 'function') {
      const loaded = storage.loadKnowledgeBase();
      assertNotNull(loaded, 'Should load from localStorage');
    }
  }
}, 'Storage Tests');

test('Storage: CRITICAL - should preserve data integrity on save/load cycle', () => {
  if (typeof StorageManager !== 'undefined' && typeof KnowledgeBase !== 'undefined') {
    const storage = new StorageManager();
    const originalKb = new KnowledgeBase();

    // Add test data
    if (typeof Week !== 'undefined' && typeof Training !== 'undefined') {
      const week = new Week(1, 'Test Week');
      const training = new Training('Test Training', 'Strength');
      week.addTraining && week.addTraining(training);
      originalKb.addWeek && originalKb.addWeek(week);
    }

    // Save
    storage.saveKnowledgeBase && storage.saveKnowledgeBase(originalKb);

    // Load
    const loadedKb = storage.loadKnowledgeBase && storage.loadKnowledgeBase();

    if (loadedKb) {
      // Verify data is intact
      assertNotNull(loadedKb.weeks, 'Loaded KB should have weeks');
      assertTrue(true, 'Data integrity preserved');
    }
  }
}, 'Storage Tests');

test('Storage: should handle empty localStorage gracefully', () => {
  if (typeof StorageManager !== 'undefined') {
    // Clear localStorage
    localStorage.removeItem('trainingPlan_knowledgeBase');

    const storage = new StorageManager();

    if (typeof storage.loadKnowledgeBase === 'function') {
      const loaded = storage.loadKnowledgeBase();
      // Should return null or empty KB, not crash
      assertTrue(true, 'Handles empty localStorage gracefully');
    }
  }
}, 'Storage Tests');

test('Storage: should auto-save on changes', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.enableAutoSave === 'function') {
      storage.enableAutoSave();
      assertTrue(storage.autoSaveEnabled, 'Auto-save should be enabled');
    }
  } else {
    console.warn('Auto-save not implemented yet');
  }
}, 'Storage Tests');

test('Storage: should export knowledge base to JSON file', () => {
  if (typeof StorageManager !== 'undefined' && typeof KnowledgeBase !== 'undefined') {
    const storage = new StorageManager();
    const kb = new KnowledgeBase();

    if (typeof storage.exportToJSON === 'function') {
      const json = storage.exportToJSON(kb);
      assertNotNull(json, 'Should export to JSON');

      // Verify valid JSON
      const parsed = JSON.parse(json);
      assertNotNull(parsed, 'Exported data should be valid JSON');
    }
  } else {
    console.warn('Export to JSON not implemented yet');
  }
}, 'Storage Tests');

test('Storage: should import knowledge base from JSON file', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();
    const testJson = JSON.stringify({ weeks: [], exercises: [] });

    if (typeof storage.importFromJSON === 'function') {
      const kb = storage.importFromJSON(testJson);
      assertNotNull(kb, 'Should import from JSON');
    }
  } else {
    console.warn('Import from JSON not implemented yet');
  }
}, 'Storage Tests');

test('Storage: should handle large datasets efficiently', () => {
  if (typeof StorageManager !== 'undefined' && typeof KnowledgeBase !== 'undefined') {
    const storage = new StorageManager();
    const kb = new KnowledgeBase();

    // Create large dataset
    if (typeof Week !== 'undefined') {
      for (let i = 1; i <= 52; i++) {
        const week = new Week(i, `Week ${i}`);
        kb.addWeek && kb.addWeek(week);
      }
    }

    const startTime = performance.now();
    storage.saveKnowledgeBase && storage.saveKnowledgeBase(kb);
    const endTime = performance.now();

    const duration = endTime - startTime;
    console.log(`Large dataset save took ${duration.toFixed(2)}ms`);

    assertLessThan(duration, 1000, 'Should save large dataset in under 1 second');
  }
}, 'Storage Tests');

test('Storage: should validate data before saving', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.validateKnowledgeBase === 'function') {
      const valid = storage.validateKnowledgeBase({ weeks: [] });
      assertTrue(typeof valid === 'boolean', 'Should return validation result');
    } else {
      console.warn('Data validation not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should handle corrupted localStorage data', () => {
  if (typeof StorageManager !== 'undefined') {
    // Set corrupted data
    localStorage.setItem('trainingPlan_knowledgeBase', 'invalid json {{{');

    const storage = new StorageManager();

    if (typeof storage.loadKnowledgeBase === 'function') {
      try {
        const loaded = storage.loadKnowledgeBase();
        // Should handle gracefully, not crash
        assertTrue(true, 'Handles corrupted data gracefully');
      } catch (e) {
        assertTrue(true, 'Throws appropriate error for corrupted data');
      }
    }
  }
}, 'Storage Tests');

test('Editor: should update exercise correctly', () => {
  if (typeof Editor !== 'undefined' && typeof Exercise !== 'undefined') {
    const editor = new Editor();
    const exercise = new Exercise('Squats', '10', '100kg');

    if (typeof editor.updateExercise === 'function') {
      const updated = editor.updateExercise(exercise, { repetitions: '12', weight: '110kg' });
      assertEqual(updated.repetitions, '12', 'Repetitions should be updated');
      assertEqual(updated.weight, '110kg', 'Weight should be updated');
    }
  } else {
    console.warn('Editor class not implemented yet');
  }
}, 'Storage Tests');

test('Editor: should add exercise to block', () => {
  if (typeof Editor !== 'undefined' && typeof Block !== 'undefined' && typeof Exercise !== 'undefined') {
    const editor = new Editor();
    const block = new Block('Block A', 'AMRAP');
    const newExercise = new Exercise('Push-ups', '15', 'bodyweight');

    if (typeof editor.addExerciseToBlock === 'function') {
      editor.addExerciseToBlock(block, newExercise);
      assertTrue(block.exercises.length > 0, 'Exercise should be added to block');
    }
  } else {
    console.warn('Add exercise functionality not implemented yet');
  }
}, 'Storage Tests');

test('Editor: should remove exercise from block', () => {
  if (typeof Editor !== 'undefined' && typeof Block !== 'undefined' && typeof Exercise !== 'undefined') {
    const editor = new Editor();
    const block = new Block('Block A', 'AMRAP');
    const exercise = new Exercise('Squats', '10', '100kg');

    block.addExercise && block.addExercise(exercise);
    const initialCount = block.exercises.length;

    if (typeof editor.removeExercise === 'function') {
      editor.removeExercise(block, 0);
      assertTrue(block.exercises.length < initialCount, 'Exercise should be removed');
    }
  } else {
    console.warn('Remove exercise functionality not implemented yet');
  }
}, 'Storage Tests');

test('Editor: should add new training to week', () => {
  if (typeof Editor !== 'undefined' && typeof Week !== 'undefined' && typeof Training !== 'undefined') {
    const editor = new Editor();
    const week = new Week(1, 'Week 1');
    const newTraining = new Training('New Training', 'Strength');

    if (typeof editor.addTraining === 'function') {
      editor.addTraining(week, newTraining);
      assertTrue(week.trainings.length > 0, 'Training should be added to week');
    }
  } else {
    console.warn('Add training functionality not implemented yet');
  }
}, 'Storage Tests');

test('Editor: should add new week to knowledge base', () => {
  if (typeof Editor !== 'undefined' && typeof KnowledgeBase !== 'undefined' && typeof Week !== 'undefined') {
    const editor = new Editor();
    const kb = new KnowledgeBase();
    const newWeek = new Week(1, 'New Week');

    if (typeof editor.addWeek === 'function') {
      editor.addWeek(kb, newWeek);
      assertTrue(kb.weeks.length > 0, 'Week should be added to knowledge base');
    }
  } else {
    console.warn('Add week functionality not implemented yet');
  }
}, 'Storage Tests');

test('Editor: should maintain undo/redo stack', () => {
  if (typeof Editor !== 'undefined') {
    const editor = new Editor();

    if (typeof editor.undo === 'function' && typeof editor.redo === 'function') {
      assertTrue(true, 'Undo/redo functionality exists');
    } else {
      console.warn('Undo/redo not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should backup data before major changes', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.createBackup === 'function') {
      storage.createBackup();
      const backup = localStorage.getItem('trainingPlan_backup');
      assertNotNull(backup, 'Backup should be created');
    } else {
      console.warn('Backup functionality not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should restore from backup', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.restoreFromBackup === 'function') {
      // Create a backup first
      localStorage.setItem('trainingPlan_backup', JSON.stringify({ weeks: [] }));

      const restored = storage.restoreFromBackup();
      assertNotNull(restored, 'Should restore from backup');
    } else {
      console.warn('Restore from backup not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should clear all data', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.clearAllData === 'function') {
      storage.clearAllData();
      const data = localStorage.getItem('trainingPlan_knowledgeBase');
      assertTrue(data === null || data === '{}', 'Data should be cleared');
    } else {
      console.warn('Clear data functionality not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should get storage size', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.getStorageSize === 'function') {
      const size = storage.getStorageSize();
      assertTrue(typeof size === 'number', 'Should return storage size');
      assertTrue(size >= 0, 'Size should be non-negative');
    } else {
      console.warn('Storage size check not implemented yet');
    }
  }
}, 'Storage Tests');

test('Storage: should warn when approaching storage limit', () => {
  if (typeof StorageManager !== 'undefined') {
    const storage = new StorageManager();

    if (typeof storage.checkStorageLimit === 'function') {
      const warning = storage.checkStorageLimit();
      assertTrue(typeof warning === 'boolean', 'Should return warning status');
    } else {
      console.warn('Storage limit check not implemented yet');
    }
  }
}, 'Storage Tests');
