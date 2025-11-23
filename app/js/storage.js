/**
 * StorageManager - Handles saving/loading training plan data
 *
 * Features:
 * - Auto-save to localStorage on every change
 * - Auto-load from localStorage on startup
 * - Export/import as JSON files
 * - Data integrity validation
 * - Error handling and recovery
 *
 * RELIABILITY IS CRITICAL - users must not lose their data!
 */

class StorageManager {
  constructor() {
    this.storageKey = 'trainingPlanData';
    this.backupKey = 'trainingPlanData_backup';
    this.autoSaveEnabled = true;
    this.autoSaveDelay = 500; // ms delay for debouncing
    this.autoSaveTimer = null;
    this.version = '1.0';

    // Statistics for monitoring
    this.stats = {
      lastSaveTime: null,
      lastLoadTime: null,
      saveCount: 0,
      loadCount: 0,
      errors: []
    };
  }

  /**
   * Auto-save to localStorage with debouncing
   * This prevents excessive writes while user is actively editing
   *
   * @param {Object} knowledgeBase - The KnowledgeBase instance to save
   * @returns {Promise<boolean>} Success status
   */
  autoSave(knowledgeBase) {
    if (!this.autoSaveEnabled) {
      console.log('[Storage] Auto-save is disabled');
      return Promise.resolve(false);
    }

    // Debounce: clear previous timer and set new one
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    return new Promise((resolve) => {
      this.autoSaveTimer = setTimeout(() => {
        const success = this._performSave(knowledgeBase);
        resolve(success);
      }, this.autoSaveDelay);
    });
  }

  /**
   * Perform immediate save (internal method)
   * Creates backup before saving new data
   *
   * @private
   * @param {Object} knowledgeBase - The KnowledgeBase instance
   * @returns {boolean} Success status
   */
  _performSave(knowledgeBase) {
    try {
      // Validate knowledge base has required methods
      if (!knowledgeBase || typeof knowledgeBase.toJSON !== 'function') {
        throw new Error('Invalid knowledge base: toJSON method not found');
      }

      // Create backup of current data before overwriting
      const currentData = localStorage.getItem(this.storageKey);
      if (currentData) {
        try {
          localStorage.setItem(this.backupKey, currentData);
        } catch (backupError) {
          console.warn('[Storage] Failed to create backup:', backupError);
          // Continue with save even if backup fails
        }
      }

      // Serialize knowledge base
      const kbData = knowledgeBase.toJSON();

      // Validate serialized data
      if (!kbData) {
        throw new Error('toJSON returned null or undefined');
      }

      // Create storage object with metadata
      const data = {
        knowledgeBase: kbData,
        savedAt: new Date().toISOString(),
        version: this.version,
        stats: {
          totalWeeks: kbData.weeks?.length || 0,
          totalTrainings: this._countTrainings(kbData),
          totalExercises: this._countExercises(kbData)
        }
      };

      // Serialize and save
      const serialized = JSON.stringify(data);

      // Check localStorage quota
      try {
        localStorage.setItem(this.storageKey, serialized);
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          // Try to free up space by removing backup
          localStorage.removeItem(this.backupKey);
          localStorage.setItem(this.storageKey, serialized);
          console.warn('[Storage] Removed backup to free space');
        } else {
          throw quotaError;
        }
      }

      // Update statistics
      this.stats.lastSaveTime = new Date();
      this.stats.saveCount++;

      console.log(`[Storage] Auto-saved successfully (${this.stats.saveCount} saves total)`);
      console.log(`[Storage] Data size: ${(serialized.length / 1024).toFixed(2)} KB`);

      return true;

    } catch (error) {
      console.error('[Storage] Auto-save failed:', error);
      this.stats.errors.push({
        type: 'save',
        time: new Date().toISOString(),
        message: error.message,
        stack: error.stack
      });

      // Keep only last 10 errors
      if (this.stats.errors.length > 10) {
        this.stats.errors = this.stats.errors.slice(-10);
      }

      return false;
    }
  }

  /**
   * Load from localStorage
   * Includes validation and error recovery
   *
   * @returns {Object|null} Knowledge base data or null if not found
   */
  autoLoad() {
    try {
      const data = localStorage.getItem(this.storageKey);

      if (!data) {
        console.log('[Storage] No saved data found');
        return null;
      }

      // Parse and validate
      const parsed = JSON.parse(data);

      if (!parsed.knowledgeBase) {
        throw new Error('Invalid data structure: knowledgeBase not found');
      }

      // Version check
      if (parsed.version !== this.version) {
        console.warn(`[Storage] Version mismatch: saved=${parsed.version}, current=${this.version}`);
        // Could implement migration logic here if needed
      }

      // Update statistics
      this.stats.lastLoadTime = new Date();
      this.stats.loadCount++;

      console.log(`[Storage] Loaded successfully from ${parsed.savedAt}`);
      console.log(`[Storage] Contains: ${parsed.stats?.totalWeeks || 0} weeks, ${parsed.stats?.totalTrainings || 0} trainings`);

      return parsed.knowledgeBase;

    } catch (error) {
      console.error('[Storage] Auto-load failed:', error);
      this.stats.errors.push({
        type: 'load',
        time: new Date().toISOString(),
        message: error.message,
        stack: error.stack
      });

      // Try to recover from backup
      return this._loadFromBackup();
    }
  }

  /**
   * Attempt to load from backup
   *
   * @private
   * @returns {Object|null} Knowledge base data from backup or null
   */
  _loadFromBackup() {
    try {
      console.log('[Storage] Attempting to load from backup...');
      const backupData = localStorage.getItem(this.backupKey);

      if (!backupData) {
        console.log('[Storage] No backup found');
        return null;
      }

      const parsed = JSON.parse(backupData);

      if (!parsed.knowledgeBase) {
        throw new Error('Invalid backup data structure');
      }

      console.log('[Storage] Successfully loaded from backup');
      return parsed.knowledgeBase;

    } catch (backupError) {
      console.error('[Storage] Backup load also failed:', backupError);
      return null;
    }
  }

  /**
   * Export knowledge base to JSON file for download
   *
   * @param {Object} knowledgeBase - The KnowledgeBase instance
   * @param {string} filename - Optional filename (default: training-plan.json)
   * @returns {boolean} Success status
   */
  exportToFile(knowledgeBase, filename = 'training-plan.json') {
    try {
      // Validate knowledge base
      if (!knowledgeBase || typeof knowledgeBase.toJSON !== 'function') {
        throw new Error('Invalid knowledge base');
      }

      // Create export data with metadata
      const data = {
        knowledgeBase: knowledgeBase.toJSON(),
        exportedAt: new Date().toISOString(),
        version: this.version,
        metadata: {
          exportedBy: 'Training Plan Manager',
          totalWeeks: knowledgeBase.weeks?.length || 0,
          totalTrainings: this._countTrainings(knowledgeBase),
          totalExercises: this._countExercises(knowledgeBase)
        }
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log(`[Storage] Exported to ${filename}`);
      return true;

    } catch (error) {
      console.error('[Storage] Export failed:', error);
      this.stats.errors.push({
        type: 'export',
        time: new Date().toISOString(),
        message: error.message
      });
      return false;
    }
  }

  /**
   * Import knowledge base from JSON file
   *
   * @param {File} file - The file object from input[type="file"]
   * @returns {Promise<Object>} Knowledge base data
   */
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      if (!file.name.endsWith('.json')) {
        reject(new Error('Invalid file type. Expected .json file'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Validate structure
          if (!data.knowledgeBase) {
            throw new Error('Invalid file structure: knowledgeBase not found');
          }

          // Version check
          if (data.version && data.version !== this.version) {
            console.warn(`[Storage] Importing from different version: ${data.version}`);
          }

          console.log(`[Storage] Imported from ${file.name}`);
          console.log(`[Storage] Exported at: ${data.exportedAt || 'unknown'}`);

          resolve(data.knowledgeBase);

        } catch (error) {
          console.error('[Storage] Import parsing failed:', error);
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Clear all stored data (with confirmation recommended)
   *
   * @param {boolean} keepBackup - Whether to keep the backup
   */
  clearStorage(keepBackup = false) {
    try {
      localStorage.removeItem(this.storageKey);

      if (!keepBackup) {
        localStorage.removeItem(this.backupKey);
      }

      console.log('[Storage] Storage cleared');
      return true;

    } catch (error) {
      console.error('[Storage] Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Check if saved data exists
   *
   * @returns {boolean} True if saved data exists
   */
  hasSavedData() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  /**
   * Get information about saved data without loading it
   *
   * @returns {Object|null} Metadata about saved data
   */
  getSavedDataInfo() {
    try {
      const data = localStorage.getItem(this.storageKey);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);

      return {
        savedAt: parsed.savedAt,
        version: parsed.version,
        stats: parsed.stats || {},
        size: (data.length / 1024).toFixed(2) + ' KB'
      };

    } catch (error) {
      console.error('[Storage] Failed to get saved data info:', error);
      return null;
    }
  }

  /**
   * Enable or disable auto-save
   *
   * @param {boolean} enabled - Whether auto-save should be enabled
   */
  setAutoSave(enabled) {
    this.autoSaveEnabled = enabled;
    console.log(`[Storage] Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get storage statistics
   *
   * @returns {Object} Storage statistics
   */
  getStats() {
    return {
      ...this.stats,
      hasData: this.hasSavedData(),
      savedDataInfo: this.getSavedDataInfo()
    };
  }

  /**
   * Helper: Count total trainings in knowledge base
   *
   * @private
   * @param {Object} kb - Knowledge base data
   * @returns {number} Total number of trainings
   */
  _countTrainings(kb) {
    if (!kb.weeks || !Array.isArray(kb.weeks)) {
      return 0;
    }

    return kb.weeks.reduce((total, week) => {
      return total + (week.trainings?.length || 0);
    }, 0);
  }

  /**
   * Helper: Count total exercises in knowledge base
   *
   * @private
   * @param {Object} kb - Knowledge base data
   * @returns {number} Total number of exercises
   */
  _countExercises(kb) {
    if (!kb.weeks || !Array.isArray(kb.weeks)) {
      return 0;
    }

    let count = 0;

    kb.weeks.forEach(week => {
      if (!week.trainings) return;

      week.trainings.forEach(training => {
        if (!training.blocks) return;

        training.blocks.forEach(block => {
          count += block.exercises?.length || 0;
        });
      });
    });

    return count;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
