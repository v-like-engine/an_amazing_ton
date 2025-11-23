/**
 * ExportManager - Handles exporting trainings to PDF and images
 *
 * Features:
 * - Select multiple trainings for export
 * - Export to PDF (jsPDF)
 * - Export to images (html2canvas)
 * - Clean, readable, phone-friendly layout
 * - Preview before export
 *
 * Libraries required (from CDN):
 * - jsPDF: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
 * - html2canvas: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
 */

class ExportManager {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.selectedTrainings = new Set();
    this.exportContainer = null;

    // Export settings
    this.settings = {
      pageSize: 'a4',
      orientation: 'portrait',
      fontSize: 12,
      lineHeight: 1.5,
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      includeWeekInfo: true,
      includeIntensity: true,
      includeDate: true
    };
  }

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  /**
   * Add a training to the export selection
   *
   * @param {string} trainingId - The training ID
   * @returns {boolean} Success status
   */
  addToExportGroup(trainingId) {
    if (!trainingId) {
      console.error('[Export] Invalid training ID');
      return false;
    }

    this.selectedTrainings.add(trainingId);
    console.log(`[Export] Added training ${trainingId} to export group`);
    return true;
  }

  /**
   * Remove a training from the export selection
   *
   * @param {string} trainingId - The training ID
   * @returns {boolean} Success status
   */
  removeFromExportGroup(trainingId) {
    const removed = this.selectedTrainings.delete(trainingId);

    if (removed) {
      console.log(`[Export] Removed training ${trainingId} from export group`);
    }

    return removed;
  }

  /**
   * Clear all selected trainings
   */
  clearExportGroup() {
    this.selectedTrainings.clear();
    console.log('[Export] Cleared export group');
  }

  /**
   * Get the current selection
   *
   * @returns {Array<string>} Array of training IDs
   */
  getSelectedTrainings() {
    return Array.from(this.selectedTrainings);
  }

  /**
   * Check if a training is selected
   *
   * @param {string} trainingId - The training ID
   * @returns {boolean} True if selected
   */
  isSelected(trainingId) {
    return this.selectedTrainings.has(trainingId);
  }

  /**
   * Select trainings by week
   *
   * @param {string} weekId - The week ID
   * @returns {number} Number of trainings added
   */
  selectWeek(weekId) {
    const week = this._findWeek(weekId);

    if (!week || !week.trainings) {
      return 0;
    }

    let count = 0;
    week.trainings.forEach(training => {
      if (this.addToExportGroup(training.id)) {
        count++;
      }
    });

    console.log(`[Export] Selected ${count} trainings from week ${weekId}`);
    return count;
  }

  /**
   * Select trainings by date range
   *
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {number} Number of trainings added
   */
  selectByDateRange(startDate, endDate) {
    let count = 0;

    if (!this.kb.weeks) return count;

    this.kb.weeks.forEach(week => {
      if (!week.trainings) return;

      week.trainings.forEach(training => {
        const trainingDate = this._parseDate(training.date);

        if (trainingDate && trainingDate >= startDate && trainingDate <= endDate) {
          if (this.addToExportGroup(training.id)) {
            count++;
          }
        }
      });
    });

    console.log(`[Export] Selected ${count} trainings in date range`);
    return count;
  }

  /**
   * Select all trainings
   *
   * @returns {number} Number of trainings added
   */
  selectAll() {
    let count = 0;

    if (!this.kb.weeks) return count;

    this.kb.weeks.forEach(week => {
      if (!week.trainings) return;

      week.trainings.forEach(training => {
        if (this.addToExportGroup(training.id)) {
          count++;
        }
      });
    });

    console.log(`[Export] Selected all ${count} trainings`);
    return count;
  }

  // ============================================================================
  // PDF EXPORT
  // ============================================================================

  /**
   * Export selected trainings as PDF
   *
   * @param {string} groupName - Name for the PDF file
   * @returns {Promise<boolean>} Success status
   */
  async exportAsPDF(groupName = 'trainings') {
    try {
      // Check if jsPDF is available
      if (typeof window.jspdf === 'undefined') {
        throw new Error('jsPDF library not loaded. Please include the CDN script.');
      }

      if (this.selectedTrainings.size === 0) {
        throw new Error('No trainings selected for export');
      }

      console.log(`[Export] Starting PDF export of ${this.selectedTrainings.size} trainings...`);

      // Get jsPDF constructor
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: this.settings.orientation,
        unit: 'mm',
        format: this.settings.pageSize
      });

      // Get trainings data
      const trainings = this._getSelectedTrainingData();

      if (trainings.length === 0) {
        throw new Error('No valid trainings found');
      }

      // Add trainings to PDF
      let isFirstPage = true;

      for (const training of trainings) {
        if (!isFirstPage) {
          doc.addPage();
        }

        this._addTrainingToPDF(doc, training);
        isFirstPage = false;
      }

      // Save PDF
      const filename = this._sanitizeFilename(`${groupName}.pdf`);
      doc.save(filename);

      console.log(`[Export] PDF exported successfully: ${filename}`);
      return true;

    } catch (error) {
      console.error('[Export] PDF export failed:', error);
      throw error;
    }
  }

  /**
   * Add a training to the PDF document
   *
   * @private
   * @param {Object} doc - jsPDF document
   * @param {Object} training - Training data with week info
   */
  _addTrainingToPDF(doc, training) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = this.settings.margins.left;
    const contentWidth = pageWidth - (margin * 2);

    let y = this.settings.margins.top;

    // Helper to add text with word wrap
    const addText = (text, fontSize, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');

      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach(line => {
        // Check if we need a new page
        if (y > pageHeight - this.settings.margins.bottom) {
          doc.addPage();
          y = this.settings.margins.top;
        }

        doc.text(line, margin, y);
        y += fontSize * 0.4;
      });

      y += 2; // Extra spacing after paragraph
    };

    // Week header
    if (this.settings.includeWeekInfo && training.week) {
      addText(`Неделя: ${training.week.dateRange}`, 14, true);

      if (training.week.description) {
        addText(training.week.description, 11);
      }

      y += 3;
    }

    // Training header
    const trainingHeader = `Тренировка ${training.trainingNumber}`;
    const intensityInfo = this.settings.includeIntensity && training.intensityPercent
      ? ` (${training.intensityPercent})`
      : '';
    const dateInfo = this.settings.includeDate && training.date
      ? ` - ${training.date}`
      : '';

    addText(trainingHeader + intensityInfo + dateInfo, 13, true);
    y += 3;

    // Blocks and exercises
    if (training.blocks && training.blocks.length > 0) {
      training.blocks.forEach((block, blockIndex) => {
        // Block header
        let blockHeader = `Блок ${block.blockNumber}`;

        if (block.rounds && block.rounds > 1) {
          blockHeader += `: ${block.rounds} раунд${this._getRussianPlural(block.rounds)}`;
        }

        if (block.restInfo) {
          blockHeader += `, ${block.restInfo}`;
        }

        if (block.setType) {
          blockHeader += ` (${block.setType})`;
        }

        addText(blockHeader, 12, true);
        y += 1;

        // Exercises
        if (block.exercises && block.exercises.length > 0) {
          block.exercises.forEach(exercise => {
            let exerciseLine = `  • ${exercise.name}`;

            if (exercise.repetitions) {
              exerciseLine += ` - ${exercise.repetitions}`;
            }

            if (exercise.weight) {
              exerciseLine += ` (${exercise.weight})`;
            }

            addText(exerciseLine, 11);
          });
        }

        // Space between blocks
        if (blockIndex < training.blocks.length - 1) {
          y += 3;
        }
      });
    }

    // Add export timestamp at bottom
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(128, 128, 128);
    const timestamp = new Date().toLocaleString('ru-RU');
    doc.text(`Экспортировано: ${timestamp}`, margin, pageHeight - 10);
    doc.setTextColor(0, 0, 0);
  }

  // ============================================================================
  // IMAGE EXPORT
  // ============================================================================

  /**
   * Export selected trainings as images
   *
   * @param {string} format - Image format ('png' or 'jpeg')
   * @param {string} groupName - Name prefix for image files
   * @returns {Promise<boolean>} Success status
   */
  async exportAsImage(format = 'png', groupName = 'training') {
    try {
      // Check if html2canvas is available
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library not loaded. Please include the CDN script.');
      }

      if (this.selectedTrainings.size === 0) {
        throw new Error('No trainings selected for export');
      }

      console.log(`[Export] Starting image export of ${this.selectedTrainings.size} trainings...`);

      // Get trainings data
      const trainings = this._getSelectedTrainingData();

      if (trainings.length === 0) {
        throw new Error('No valid trainings found');
      }

      // Create or get export container
      const container = this._getOrCreateExportContainer();

      // Export each training as an image
      for (let i = 0; i < trainings.length; i++) {
        const training = trainings[i];

        // Render training to container
        container.innerHTML = this._formatTrainingForExport(training);

        // Wait for rendering
        await this._sleep(100);

        // Capture as image
        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false
        });

        // Convert to blob and download
        const blob = await this._canvasToBlob(canvas, format);
        const filename = this._sanitizeFilename(
          `${groupName}-${training.trainingNumber || i + 1}.${format}`
        );

        this._downloadBlob(blob, filename);

        console.log(`[Export] Exported image ${i + 1}/${trainings.length}: ${filename}`);

        // Small delay between exports
        if (i < trainings.length - 1) {
          await this._sleep(200);
        }
      }

      // Clean up
      container.innerHTML = '';

      console.log('[Export] Image export completed successfully');
      return true;

    } catch (error) {
      console.error('[Export] Image export failed:', error);
      throw error;
    }
  }

  /**
   * Export all selected trainings as a single combined image
   *
   * @param {string} format - Image format ('png' or 'jpeg')
   * @param {string} filename - Filename for the combined image
   * @returns {Promise<boolean>} Success status
   */
  async exportAsCombinedImage(format = 'png', filename = 'trainings-combined') {
    try {
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library not loaded');
      }

      if (this.selectedTrainings.size === 0) {
        throw new Error('No trainings selected for export');
      }

      console.log('[Export] Starting combined image export...');

      // Get trainings data
      const trainings = this._getSelectedTrainingData();

      if (trainings.length === 0) {
        throw new Error('No valid trainings found');
      }

      // Create or get export container
      const container = this._getOrCreateExportContainer();

      // Render all trainings
      let html = '<div style="padding: 20px; background: white;">';

      trainings.forEach((training, index) => {
        html += this._formatTrainingForExport(training);

        if (index < trainings.length - 1) {
          html += '<hr style="margin: 30px 0; border: 1px solid #ddd;">';
        }
      });

      html += '</div>';

      container.innerHTML = html;

      // Wait for rendering
      await this._sleep(200);

      // Capture as image
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      // Convert to blob and download
      const blob = await this._canvasToBlob(canvas, format);
      const sanitizedFilename = this._sanitizeFilename(`${filename}.${format}`);

      this._downloadBlob(blob, sanitizedFilename);

      // Clean up
      container.innerHTML = '';

      console.log(`[Export] Combined image exported: ${sanitizedFilename}`);
      return true;

    } catch (error) {
      console.error('[Export] Combined image export failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // PREVIEW
  // ============================================================================

  /**
   * Show preview of what will be exported
   *
   * @returns {string} HTML preview
   */
  showExportPreview() {
    const trainings = this._getSelectedTrainingData();

    if (trainings.length === 0) {
      return '<p>Нет выбранных тренировок для экспорта</p>';
    }

    let html = '<div class="export-preview">';
    html += `<h3>Предпросмотр экспорта (${trainings.length} тренировок)</h3>`;

    trainings.forEach((training, index) => {
      html += this._formatTrainingForExport(training);

      if (index < trainings.length - 1) {
        html += '<hr style="margin: 20px 0; border: 1px solid #ddd;">';
      }
    });

    html += '</div>';

    return html;
  }

  /**
   * Get export statistics
   *
   * @returns {Object} Export statistics
   */
  getExportStats() {
    const trainings = this._getSelectedTrainingData();

    let totalBlocks = 0;
    let totalExercises = 0;

    trainings.forEach(training => {
      if (training.blocks) {
        totalBlocks += training.blocks.length;

        training.blocks.forEach(block => {
          if (block.exercises) {
            totalExercises += block.exercises.length;
          }
        });
      }
    });

    return {
      trainings: trainings.length,
      blocks: totalBlocks,
      exercises: totalExercises,
      weeks: new Set(trainings.map(t => t.week?.id).filter(Boolean)).size
    };
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  /**
   * Update export settings
   *
   * @param {Object} newSettings - Settings to update
   */
  updateSettings(newSettings) {
    Object.assign(this.settings, newSettings);
    console.log('[Export] Settings updated:', newSettings);
  }

  /**
   * Get current settings
   *
   * @returns {Object} Current export settings
   */
  getSettings() {
    return { ...this.settings };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Format a training for export
   *
   * @private
   * @param {Object} training - Training data with week info
   * @returns {string} Formatted HTML
   */
  _formatTrainingForExport(training) {
    let html = '<div class="training-export" style="font-family: Arial, sans-serif; max-width: 800px; padding: 20px;">';

    // Week info
    if (this.settings.includeWeekInfo && training.week) {
      html += '<div style="margin-bottom: 15px;">';
      html += `<div style="font-size: 16px; font-weight: bold; color: #333;">`;
      html += `Неделя: ${training.week.dateRange}`;
      html += '</div>';

      if (training.week.description) {
        html += `<div style="font-size: 13px; color: #666; margin-top: 5px;">`;
        html += training.week.description;
        html += '</div>';
      }

      html += '</div>';
    }

    // Training header
    html += '<div style="margin-bottom: 15px;">';
    html += `<div style="font-size: 18px; font-weight: bold; color: #2c3e50;">`;
    html += `Тренировка ${training.trainingNumber}`;

    if (this.settings.includeIntensity && training.intensityPercent) {
      html += ` <span style="color: #e74c3c;">(${training.intensityPercent})</span>`;
    }

    if (this.settings.includeDate && training.date) {
      html += ` <span style="color: #7f8c8d;">- ${training.date}</span>`;
    }

    html += '</div>';
    html += '</div>';

    // Blocks
    if (training.blocks && training.blocks.length > 0) {
      training.blocks.forEach(block => {
        html += '<div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 4px;">';

        // Block header
        html += '<div style="font-size: 15px; font-weight: bold; color: #2980b9; margin-bottom: 10px;">';
        html += `Блок ${block.blockNumber}`;

        if (block.rounds && block.rounds > 1) {
          html += `: ${block.rounds} раунд${this._getRussianPlural(block.rounds)}`;
        }

        if (block.restInfo) {
          html += `, ${block.restInfo}`;
        }

        if (block.setType) {
          html += ` <span style="color: #e67e22;">(${block.setType})</span>`;
        }

        html += '</div>';

        // Exercises
        if (block.exercises && block.exercises.length > 0) {
          html += '<ul style="margin: 0; padding-left: 20px; list-style-type: none;">';

          block.exercises.forEach(exercise => {
            html += '<li style="margin-bottom: 8px; font-size: 14px; color: #34495e;">';
            html += `<span style="color: #3498db;">•</span> `;
            html += `<strong>${exercise.name}</strong>`;

            if (exercise.repetitions) {
              html += ` - <span style="color: #27ae60;">${exercise.repetitions}</span>`;
            }

            if (exercise.weight) {
              html += ` <span style="color: #e67e22;">(${exercise.weight})</span>`;
            }

            html += '</li>';
          });

          html += '</ul>';
        }

        html += '</div>';
      });
    }

    // Export timestamp
    html += '<div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #95a5a6; text-align: right;">';
    html += `Экспортировано: ${new Date().toLocaleString('ru-RU')}`;
    html += '</div>';

    html += '</div>';

    return html;
  }

  /**
   * Get or create the export container element
   *
   * @private
   * @returns {HTMLElement} Export container
   */
  _getOrCreateExportContainer() {
    if (!this.exportContainer) {
      this.exportContainer = document.createElement('div');
      this.exportContainer.id = 'export-container';
      this.exportContainer.style.position = 'absolute';
      this.exportContainer.style.left = '-9999px';
      this.exportContainer.style.top = '0';
      this.exportContainer.style.width = '800px';
      this.exportContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(this.exportContainer);
    }

    return this.exportContainer;
  }

  /**
   * Get selected training data with week information
   *
   * @private
   * @returns {Array<Object>} Array of training objects
   */
  _getSelectedTrainingData() {
    const trainings = [];

    if (!this.kb.weeks) return trainings;

    this.kb.weeks.forEach(week => {
      if (!week.trainings) return;

      week.trainings.forEach(training => {
        if (this.selectedTrainings.has(training.id)) {
          trainings.push({
            ...training,
            week: {
              id: week.id,
              dateRange: week.dateRange,
              description: week.description,
              intensity: week.intensity
            }
          });
        }
      });
    });

    return trainings;
  }

  /**
   * Find a week by ID
   *
   * @private
   * @param {string} weekId - Week ID
   * @returns {Object|null} Week object
   */
  _findWeek(weekId) {
    if (!this.kb.weeks) return null;
    return this.kb.weeks.find(week => week.id === weekId) || null;
  }

  /**
   * Parse date string
   *
   * @private
   * @param {string} dateStr - Date string
   * @returns {Date|null} Parsed date
   */
  _parseDate(dateStr) {
    if (!dateStr) return null;

    try {
      // Try to parse Russian date format (DD.MM or DD.MM.YYYY)
      const parts = dateStr.split('.');

      if (parts.length >= 2) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

        return new Date(year, month, day);
      }

      return new Date(dateStr);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get Russian plural form
   *
   * @private
   * @param {number} number - Number
   * @returns {string} Plural suffix
   */
  _getRussianPlural(number) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return '';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return 'а';
    } else {
      return 'ов';
    }
  }

  /**
   * Convert canvas to blob
   *
   * @private
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {string} format - Image format
   * @returns {Promise<Blob>} Image blob
   */
  _canvasToBlob(canvas, format) {
    return new Promise((resolve, reject) => {
      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpeg' ? 0.95 : undefined;

      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Download a blob as a file
   *
   * @private
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  _downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Sanitize filename
   *
   * @private
   * @param {string} filename - Original filename
   * @returns {string} Sanitized filename
   */
  _sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Sleep helper
   *
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportManager;
}
