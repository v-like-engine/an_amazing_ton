# Training Plan Parser & Manager - Project Overview

## Project Goal
Create a web-based training plan parser and manager that:
- Parses xlsx training files
- Provides powerful search and filtering
- Features a beautiful, phone-friendly UI with Tabata timer
- Allows editing and adding custom exercises
- Exports trainings to PDF/images for gym use
- Works entirely in browser (no npm, Docker, or server needed)

## Agent Responsibilities

### Agent 1: Parser & Knowledge Base
**Files:** `app/js/parser.js`, `app/js/data-model.js`
**Tasks:**
- Parse xlsx files using SheetJS (CDN)
- Create structured knowledge base
- Handle Cyrillic text
- Extract intensity, blocks, exercises
- Performance: <500ms for parsing

### Agent 2: Search & Filtering
**Files:** `app/js/search.js`, `app/js/filters.js`
**Tasks:**
- Exercise-based search (include/exclude)
- Intensity filtering
- Set type filtering
- Combined filters
- Accurate, fast search (<100ms)
- No false positives!

### Agent 3: Frontend, UI & Design
**Files:** `app/index.html`, `app/css/styles.css`, `app/js/ui.js`, `app/js/timer.js`, `app/assets/`
**Tasks:**
- Beautiful, training-themed UI
- Responsive design (phone-first!)
- Smooth animations
- Tabata timer (large, color-coded, phone-friendly)
- No layout issues (elements stacking)
- Accessibility

### Agent 4: Storage, Editing & Export
**Files:** `app/js/storage.js`, `app/js/editor.js`, `app/js/export.js`
**Tasks:**
- Auto-save to localStorage
- Export/import JSON
- Edit existing exercises/trainings
- Add new content
- Export to PDF/images (jsPDF, html2canvas)
- Data integrity

### Agent 5: Testing, Documentation & QA
**Files:** `tests/`, `docs/`
**Tasks:**
- Write comprehensive tests
- Create test runner (browser-based)
- Write documentation (README, user guide, architecture, API reference)
- **Monitor other 4 agents**
- Write feedback in their claude.md files
- Verify quality gates
- Ensure everything works correctly

## File Ownership (No Conflicts!)

| File | Owner |
|------|-------|
| app/js/parser.js | Agent 1 |
| app/js/data-model.js | Agent 1 |
| app/js/search.js | Agent 2 |
| app/js/filters.js | Agent 2 |
| app/index.html | Agent 3 |
| app/css/styles.css | Agent 3 |
| app/js/ui.js | Agent 3 |
| app/js/timer.js | Agent 3 |
| app/assets/* | Agent 3 |
| app/js/storage.js | Agent 4 |
| app/js/editor.js | Agent 4 |
| app/js/export.js | Agent 4 |
| tests/* | Agent 5 |
| docs/* | Agent 5 |
| .agent-workspace/agent1-parser/claude.md | Agent 1 (read), Agent 5 (write feedback) |
| .agent-workspace/agent2-search/claude.md | Agent 2 (read), Agent 5 (write feedback) |
| .agent-workspace/agent3-frontend/claude.md | Agent 3 (read), Agent 5 (write feedback) |
| .agent-workspace/agent4-storage/claude.md | Agent 4 (read), Agent 5 (write feedback) |
| .agent-workspace/agent5-testing/claude.md | Agent 5 (read/write) |

## Integration Points

- Agent 1 provides KnowledgeBase → Used by Agents 2, 3, 4
- Agent 2 provides Search functions → Called by Agent 3
- Agent 3 provides UI → Integrates all other agents
- Agent 4 provides Save/Load → Used by all agents
- Agent 5 tests everyone → Writes feedback to all claude.md files

## Libraries (from CDN, no npm!)

- SheetJS (xlsx.js): https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js
- jsPDF: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
- html2canvas: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
- Font Awesome: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css

## Quality Requirements

- **Correctness:** Search must be accurate, parser must handle all data
- **Performance:** Parser <500ms, Search <100ms
- **Responsive:** Works on 320px - 1920px+ screens
- **Reliability:** Auto-save works, no data loss
- **Usability:** Intuitive UI, clear documentation
- **Completeness:** All features implemented and tested

## Success Criteria

- [ ] Parses training.xlsx correctly
- [ ] Search filters work accurately
- [ ] UI is beautiful and responsive
- [ ] Timer works correctly
- [ ] Can edit/add exercises and trainings
- [ ] Can export to PDF/images
- [ ] Auto-save works reliably
- [ ] All tests pass
- [ ] Documentation complete
- [ ] No bugs or issues
- [ ] Ready to use without any setup

## Current Status

Agents are being launched in parallel. Each agent will work on their assigned files.
Agent 5 will monitor progress and write feedback.

---

**Let's build an amazing training plan manager! 💪**
