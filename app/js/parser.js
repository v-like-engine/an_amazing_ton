/**
 * Training Plan Parser
 * Parses xlsx files using SheetJS (xlsx.js) and creates a structured knowledge base
 *
 * Dependencies:
 * - SheetJS (xlsx.js) from CDN: https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js
 * - data-model.js (KnowledgeBase class)
 */

// Import KnowledgeBase for Node.js environment
let KnowledgeBase;
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  KnowledgeBase = require('./data-model.js').KnowledgeBase;
}

/**
 * Main parsing function - parses an xlsx file and returns a KnowledgeBase
 * @param {File} file - The xlsx file object from file input
 * @returns {Promise<KnowledgeBase>} - Populated knowledge base
 */
async function parseTrainingFile(file) {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays (rows)
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          blankrows: true
        });

        // Parse the rows into a knowledge base
        const kb = parseRows(rows);

        const endTime = performance.now();
        console.log(`Parsing completed in ${(endTime - startTime).toFixed(2)}ms`);

        resolve(kb);
      } catch (error) {
        reject(new Error(`Failed to parse training file: ${error.message}`));
      }
    };

    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse rows from the worksheet into a structured knowledge base
 * @param {Array<Array>} rows - 2D array of cell values
 * @returns {KnowledgeBase} - Populated knowledge base
 */
function parseRows(rows) {
  const kb = new KnowledgeBase();

  let currentWeek = null;
  let currentTraining = null;
  let currentBlock = null;

  // Skip header row (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Get cell values (handle undefined cells)
    const colA = getCellValue(row[0]);
    const colB = getCellValue(row[1]);
    const colC = getCellValue(row[2]);
    const colD = getCellValue(row[3]);
    const colE = getCellValue(row[4]);

    // Check if this is a week row (Column A has date range)
    if (colA && isWeekRow(colA)) {
      const weekInfo = parseWeekInfo(colA);
      currentWeek = kb.addWeek({
        id: `week_${kb.weeks.length + 1}`,
        dateRange: weekInfo.dateRange,
        description: weekInfo.description,
        intensity: weekInfo.intensity
      });
      currentTraining = null;
      currentBlock = null;
      // Don't continue - same row might have training info in column B
    }

    // Check if this is a training row (Column B has training number)
    if (colB && isTrainingRow(colB)) {
      if (!currentWeek) {
        // Create a default week if none exists
        currentWeek = kb.addWeek({
          id: `week_${kb.weeks.length + 1}`,
          dateRange: "",
          description: "Unnamed Week",
          intensity: ""
        });
      }

      const trainingInfo = parseTrainingInfo(colB);
      currentTraining = kb.addTraining(currentWeek.id, {
        id: `${currentWeek.id}_training_${currentWeek.trainings.length + 1}`,
        trainingNumber: trainingInfo.number,
        intensityPercent: trainingInfo.intensity,
        description: trainingInfo.description
      });
      currentBlock = null;
      // Don't continue - same row might have exercise/block info in column C
    }

    // Check if this is a block row (Column C has block format like "1\1" or "2\AMRAP 12 мин")
    if (colC && isBlockRow(colC)) {
      if (!currentTraining) continue;

      const blockInfo = parseBlockInfo(colC);
      currentBlock = kb.addBlock(currentTraining.id, {
        id: `${currentTraining.id}_block_${currentTraining.blocks.length + 1}`,
        blockNumber: blockInfo.blockNum,
        rounds: blockInfo.rounds,
        restInfo: blockInfo.restInfo,
        setType: blockInfo.setType,
        description: blockInfo.description
      });
      continue;
    }

    // Check if this is an exercise row (Column C has exercise name)
    if (colC && currentTraining) {
      // If no block exists, create a default one
      if (!currentBlock) {
        currentBlock = kb.addBlock(currentTraining.id, {
          id: `${currentTraining.id}_block_${currentTraining.blocks.length + 1}`,
          blockNumber: 1,
          rounds: null,
          restInfo: "",
          setType: null,
          description: ""
        });
      }

      const exerciseName = colC.trim();
      const repetitions = colD ? String(colD).trim() : "";
      const weight = colE ? String(colE).trim() : "";

      const weightInfo = parseWeight(weight);

      kb.addExercise(currentBlock.id, {
        id: `${currentBlock.id}_ex_${currentBlock.exercises.length + 1}`,
        name: exerciseName,
        repetitions: repetitions,
        weight: weight,
        weightType: weightInfo.type
      });
    }
  }

  // Update metadata
  kb.updateMetadata();

  return kb;
}

/**
 * Get cell value and handle various types
 * @param {*} cell - Cell value from xlsx
 * @returns {string|null} - String value or null
 */
function getCellValue(cell) {
  if (cell === null || cell === undefined || cell === '') {
    return null;
  }
  return String(cell).trim();
}

/**
 * Check if a row is a week row
 * @param {string} text - Cell A value
 * @returns {boolean}
 */
function isWeekRow(text) {
  // Week rows have date ranges like "8-14.01" or "15-21.01"
  return /\d{1,2}-\d{1,2}\.\d{1,2}/.test(text);
}

/**
 * Parse week information from Column A
 * @param {string} text - Cell A value
 * @returns {Object} - { dateRange, description, intensity }
 */
function parseWeekInfo(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let dateRange = "";
  let description = "";
  let intensity = "";

  // First line usually contains date range
  if (lines.length > 0 && /\d{1,2}-\d{1,2}\.\d{1,2}/.test(lines[0])) {
    dateRange = lines[0].match(/\d{1,2}-\d{1,2}\.\d{1,2}/)[0];
  }

  // Rest is description
  description = lines.join(' ');

  // Extract intensity keywords from description
  // Check in order of priority: тест > жесткий кач > легк
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('тест')) {
    intensity = 'тест';
  } else if (lowerDesc.includes('жесткого кача') || lowerDesc.includes('жесткий кач')) {
    intensity = 'высокая';
  } else if (lowerDesc.includes('легк')) {
    intensity = 'низкая';
  }

  return { dateRange, description, intensity };
}

/**
 * Check if a row is a training row
 * @param {string} text - Cell B value
 * @returns {boolean}
 */
function isTrainingRow(text) {
  // Training rows have numbers, possibly with intensity percentage
  // Examples: "1\n60-70%", "2 на здоровье", "3\n80-60%", "4", "отдых"
  const normalized = text.toLowerCase();

  // Check for common patterns
  if (normalized.includes('отдых')) return true;
  if (normalized.includes('тест')) return true;
  if (normalized.includes('на здоровье')) return true;
  if (normalized.includes('бассейн')) return true;

  // Check for number at start
  return /^\d+/.test(text.trim());
}

/**
 * Parse training information from Column B
 * @param {string} text - Cell B value
 * @returns {Object} - { number, intensity, description }
 */
function parseTrainingInfo(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let number = null;
  let intensity = "";
  let description = text.trim();

  // Extract training number
  const numberMatch = text.match(/^(\d+)/);
  if (numberMatch) {
    number = parseInt(numberMatch[1]);
  }

  // Extract intensity percentage
  const intensityMatch = text.match(/(\d+(?:-\d+)?%)/);
  if (intensityMatch) {
    intensity = intensityMatch[1];
  }

  return { number, intensity, description };
}

/**
 * Check if a row is a block row
 * @param {string} text - Cell C value
 * @returns {boolean}
 */
function isBlockRow(text) {
  // Block rows have format like:
  // "1\1", "2\4\каждые 2-3 минуты", "4\AMRAP 12 мин", "1\сделать 3 раунда"

  // Check for backslash followed by number or keyword
  if (/^\d+\\/.test(text)) {
    return true;
  }

  return false;
}

/**
 * Parse block information from Column C
 * @param {string} text - Cell C value
 * @returns {Object} - { blockNum, rounds, restInfo, setType, description }
 */
function parseBlockInfo(text) {
  const parts = text.split('\\').map(p => p.trim());

  let blockNum = null;
  let rounds = null;
  let restInfo = "";
  let setType = null;
  let description = text;

  // First part is always block number
  if (parts.length > 0) {
    blockNum = parseInt(parts[0]);
  }

  // Second part could be rounds, AMRAP, or description
  if (parts.length > 1) {
    const secondPart = parts[1];

    // Check for AMRAP
    if (secondPart.includes('AMRAP')) {
      setType = 'AMRAP';
      restInfo = secondPart;
    }
    // Check for "сделать X раунда"
    else if (secondPart.includes('сделать') && secondPart.includes('раунд')) {
      setType = 'rounds';
      const roundsMatch = secondPart.match(/(\d+)/);
      if (roundsMatch) {
        rounds = parseInt(roundsMatch[1]);
      }
      restInfo = secondPart;
    }
    // Check for number (rounds)
    else if (/^\d+$/.test(secondPart)) {
      rounds = parseInt(secondPart);

      // Third part is rest info
      if (parts.length > 2) {
        restInfo = parts.slice(2).join(' ');

        if (restInfo.includes('каждые')) {
          setType = 'every_x_minutes';
        } else if (restInfo.includes('мин')) {
          setType = 'timed';
        }
      }
    }
    // Otherwise it's a description/rest info
    else {
      restInfo = parts.slice(1).join(' ');

      if (secondPart.includes('каждые')) {
        setType = 'every_x_minutes';
      } else if (secondPart.includes('мин')) {
        setType = 'timed';
      } else if (secondPart.includes('круг')) {
        setType = 'rounds';
      }
    }
  }

  return { blockNum, rounds, restInfo, setType, description };
}

/**
 * Extract intensity from text
 * @param {string} text - Text to analyze
 * @returns {Object} - { percent, level }
 */
function extractIntensity(text) {
  if (!text) return { percent: "", level: "" };

  let percent = "";
  let level = "";

  // Extract percentage
  const percentMatch = text.match(/(\d+(?:-\d+)?%)/);
  if (percentMatch) {
    percent = percentMatch[1];

    // Determine level based on percentage
    const numMatch = percent.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      if (num >= 80) level = "high";
      else if (num >= 60) level = "medium";
      else level = "low";
    }
  }

  // Extract from keywords
  const lowerText = text.toLowerCase();
  if (lowerText.includes('жесток')) {
    level = "high";
  } else if (lowerText.includes('на здоровье') || lowerText.includes('легк')) {
    level = "low";
  } else if (lowerText.includes('отдых')) {
    level = "rest";
  }

  return { percent, level };
}

/**
 * Parse repetitions from text
 * @param {string} text - Repetitions text
 * @returns {Object} - { value, type, description }
 */
function parseRepetitions(text) {
  if (!text) return { value: "", type: "none", description: "" };

  const trimmed = String(text).trim();

  // Check for various formats
  if (trimmed.toLowerCase() === 'макс') {
    return { value: 'max', type: 'max', description: trimmed };
  }

  // Check for "X/X" format (left/right)
  if (/^\d+\/\d+$/.test(trimmed)) {
    return { value: trimmed, type: 'split', description: trimmed };
  }

  // Check for "X\X" format
  if (/^\d+\\\d+$/.test(trimmed)) {
    return { value: trimmed, type: 'split', description: trimmed };
  }

  // Check for single number
  if (/^\d+$/.test(trimmed)) {
    return { value: trimmed, type: 'fixed', description: trimmed };
  }

  // Check for time-based
  if (trimmed.includes('сек') || trimmed.includes('мин')) {
    return { value: trimmed, type: 'timed', description: trimmed };
  }

  // Check for distance (need to be more specific - must have number before км/м)
  if (/\d+\s*(км|м)/.test(trimmed)) {
    return { value: trimmed, type: 'distance', description: trimmed };
  }

  // Default
  return { value: trimmed, type: 'text', description: trimmed };
}

/**
 * Parse weight from text
 * @param {string} text - Weight text
 * @returns {Object} - { value, unit, type, range }
 */
function parseWeight(text) {
  if (!text) return { value: "", unit: "", type: null, range: null };

  const trimmed = String(text).trim();
  const lowerText = trimmed.toLowerCase();

  // Check for kg
  if (lowerText.includes('кг')) {
    // Check for range like "2-3 кг" or "8-12"
    const rangeMatch = trimmed.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      return {
        value: trimmed,
        unit: 'kg',
        type: 'range',
        range: { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) }
      };
    }

    // Single value
    const numMatch = trimmed.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      return {
        value: trimmed,
        unit: 'kg',
        type: 'fixed',
        range: null
      };
    }

    // Just "кг" with no number
    return { value: trimmed, unit: 'kg', type: 'text', range: null };
  }

  // Check for bodyweight indicator
  if (lowerText.includes('вес тела') || lowerText.includes('собственный')) {
    return { value: trimmed, unit: 'bodyweight', type: 'bodyweight', range: null };
  }

  // Check for number-only (assume kg)
  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    return { value: trimmed, unit: 'kg', type: 'fixed', range: null };
  }

  // Check for range without unit
  const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return {
      value: trimmed,
      unit: '',
      type: 'range',
      range: { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) }
    };
  }

  return { value: trimmed, unit: '', type: 'text', range: null };
}

// Export functions for use in browser
if (typeof window !== 'undefined') {
  window.parseTrainingFile = parseTrainingFile;
  window.extractIntensity = extractIntensity;
  window.parseBlockInfo = parseBlockInfo;
  window.parseRepetitions = parseRepetitions;
  window.parseWeight = parseWeight;
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseTrainingFile,
    parseRows,
    extractIntensity,
    parseBlockInfo,
    parseRepetitions,
    parseWeight,
    parseWeekInfo,
    parseTrainingInfo,
    isWeekRow,
    isTrainingRow,
    isBlockRow
  };
}
