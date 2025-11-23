# Training Plan App - Issues & Testing Requirements

**Generated:** 2025-11-23
**QA Agent:** Testing & QA Lead
**Status:** Issues Found - Fixes Needed

---

## Summary

**Total Issues:** 5
**Total Testing Requirements:** 6
**Total Suggestions:** 3

**By Priority:**
- 🔴 **CRITICAL:** 0 issues
- 🟠 **HIGH:** 1 issue (must fix before production)
- 🟡 **MEDIUM:** 2 issues (should fix before production)
- 🟢 **LOW:** 2 issues (nice to fix)

**By Status:**
- ⏳ **PENDING:** 5 issues (not yet fixed)
- ✅ **FIXED:** 0 issues
- 🔍 **TESTING NEEDED:** 6 manual testing requirements

---

## CRITICAL Issues (MUST FIX IMMEDIATELY)

**None found!** ✅

The application has no critical, app-breaking bugs.

---

## HIGH Priority Issues (MUST FIX BEFORE PRODUCTION)

### Issue #4: Missing error handling for empty/corrupt Excel files
**Priority:** 🟠 HIGH
**Component:** Parser
**Status:** ⏳ PENDING

**Problem:**
If a user uploads an empty Excel file or a corrupt .xlsx file, the parser will crash with unclear error messages. There's no graceful error handling for malformed input.

**Impact:**
- Poor user experience
- App crashes instead of showing helpful error
- Users don't know what to do when upload fails

**Steps to Reproduce:**
1. Create an empty .xlsx file
2. Upload it to the application
3. Observe the error (or crash)

**Location:**
- File: `/home/user/an_amazing_ton/app/js/parser.js`
- Function: `parseTrainingFile` (line 21-61)
- Function: `parseRows` (line 68+)

**Fix Required:**
Add comprehensive validation checks:
- Check if workbook has sheets
- Check if worksheet exists and has data
- Check if there are at least 2 rows (header + data)
- Check if parsing produced any results
- Wrap in try-catch with meaningful error messages

**Acceptance Criteria:**
- [ ] Empty files show user-friendly error message
- [ ] Corrupt files are caught and reported
- [ ] App doesn't crash on invalid input
- [ ] Error messages guide user on what to do
- [ ] All automated tests still pass

---

## MEDIUM Priority Issues (SHOULD FIX BEFORE PRODUCTION)

### Issue #1: Missing getCellValue export in parser.js
**Priority:** 🟡 MEDIUM
**Component:** Parser
**Status:** ⏳ PENDING

**Problem:**
The function `getCellValue` is defined in parser.js (line 180) and is used internally, but it's not exported in the module.exports section. This causes test-edge-cases.js to fail when trying to import it for testing purposes.

**Impact:**
- Test file cannot properly test this function
- Minor code quality issue
- Not user-facing

**Location:**
- File: `/home/user/an_amazing_ton/app/js/parser.js`
- Line: 521-534 (module.exports section)

**Fix Required:**
Add `getCellValue` to the module.exports object

**Acceptance Criteria:**
- [ ] `getCellValue` is exported
- [ ] `test-edge-cases.js` can import it
- [ ] No other functionality broken

---

### Issue #3: No data validation on file upload
**Priority:** 🟡 MEDIUM
**Component:** UI / Parser
**Status:** ⏳ PENDING

**Problem:**
The application doesn't validate that the uploaded file is actually a valid Excel file before attempting to parse it. Users could upload any file type (.txt, .pdf, .jpg) and get confusing error messages.

**Impact:**
- Poor user experience
- Confusing error messages
- Wasted processing time on invalid files

**Location:**
- File: `/home/user/an_amazing_ton/app/js/ui.js`
- Function: `handleFileUpload` (approximate line 150-180)

**Fix Required:**
Add validation before parsing:
- Check file extension (.xlsx or .xls)
- Check file size (max 10MB)
- Show clear error message for invalid files

**Acceptance Criteria:**
- [ ] Non-Excel files rejected with clear message
- [ ] Files over 10MB rejected with clear message
- [ ] Valid files still work correctly
- [ ] Toast notifications show for errors

---

## LOW Priority Issues (NICE TO FIX)

### Issue #2: Typo in exercise name in parsed data
**Priority:** 🟢 LOW
**Component:** Data / Source File
**Status:** ⏳ PENDING

**Problem:**
The parsed training data contains a misspelled exercise name: "австралийсие" which should likely be "австралийские" (note the missing 'к'). This appears in the unique exercises list from parsing training.xlsx.

**Impact:**
- Data quality issue
- Not a code bug, but a data typo
- May confuse users slightly

**Location:**
- File: `/home/user/an_amazing_ton/training.xlsx` (source data)

**Fix Options:**
1. Fix the typo in training.xlsx source file (if you have edit access)
2. Add a normalization/spell-check feature to the parser
3. Document as known data issue

**Acceptance Criteria:**
- [ ] Typo fixed in source data OR
- [ ] Documented as known issue

---

### Issue #5: Timer section shows as default but might confuse users
**Priority:** 🟢 LOW
**Component:** Timer / UI
**Status:** ⏳ PENDING

**Problem:**
The application defaults to showing the Timer section on load (line 9 in ui.js: `this.currentSection = 'timer'`), but the timer works independently and doesn't require training data to be loaded. This is actually fine, but there's no indication to the user that they should upload training data first if they want to use exercises from their plan.

**Impact:**
- Slightly confusing for first-time users
- Not a bug, but UX could be better

**Location:**
- File: `/home/user/an_amazing_ton/app/js/ui.js`
- Line: 9 (currentSection initialization)
- Line: 29 (showSection('timer'))

**Fix Options:**
1. Add a helpful hint in the timer section
2. Change default section to 'upload' if no saved data exists

**Acceptance Criteria:**
- [ ] First-time users see upload section OR
- [ ] Timer section has helpful hint about loading data

---

## TESTING REQUIREMENTS (MANUAL TESTING NEEDED)

### Test #1: Mobile Responsive Testing - CRITICAL
**Priority:** 🔴 CRITICAL
**Status:** ⏳ NOT TESTED
**Required Before:** Production deployment

**Test Plan:**
1. **iPhone SE (320px width):**
   - Open app/index.html on iPhone SE or simulator
   - Verify NO horizontal scrolling
   - Verify all buttons are tappable (44px+)
   - Test navigation (bottom nav should show)
   - Test timer visibility and size
   - Test file upload
   - Test search filters

2. **iPad (768px width):**
   - Open app on iPad or browser at 768px
   - Verify layout switches appropriately
   - Test all sections
   - Verify no element overlap

3. **Desktop (1024px+ width):**
   - Open in full desktop browser
   - Verify desktop navigation shows
   - Test all features
   - Verify responsive adjustments

**Acceptance Criteria:**
- [ ] Works on iPhone SE (320px)
- [ ] Works on iPhone 12/13 (390px)
- [ ] Works on iPad (768px)
- [ ] Works on desktop (1024px+)
- [ ] No horizontal scrolling on any device
- [ ] No element overlap/stacking issues
- [ ] All tap targets are 44px+ on mobile
- [ ] Bottom nav shows on mobile (<768px)
- [ ] Desktop nav shows on desktop (≥768px)

---

### Test #2: Timer Distance Readability - HIGH
**Priority:** 🟠 HIGH
**Status:** ⏳ NOT TESTED
**Required Before:** Production deployment

**Test Plan:**
1. Open app/index.html on phone
2. Start timer with any settings
3. Place phone 2-3 meters away (gym distance)
4. Verify countdown is readable from distance
5. Verify colors are distinguishable
6. Test in different lighting conditions

**Acceptance Criteria:**
- [ ] Timer countdown visible from 2-3 meters
- [ ] Numbers are large enough
- [ ] Colors clearly distinguish work/rest states
- [ ] Progress bar is visible
- [ ] Set/exercise counters are visible

---

### Test #3: Browser Compatibility Testing - HIGH
**Priority:** 🟠 HIGH
**Status:** ⏳ NOT TESTED
**Required Before:** Production deployment

**Test Plan:**
1. **Chrome (latest):**
   - All features work
   - Timer works
   - File upload works
   - Export works

2. **Firefox (latest):**
   - All features work
   - Timer works
   - File upload works
   - Export works

3. **Safari (latest):**
   - All features work
   - Timer works
   - File upload works
   - Export works

4. **Mobile Safari (iOS):**
   - All features work on iPhone
   - Touch interactions work
   - File upload works from Files app

5. **Chrome Mobile (Android):**
   - All features work on Android
   - Touch interactions work
   - File upload works

**Acceptance Criteria:**
- [ ] Works in Chrome desktop
- [ ] Works in Firefox desktop
- [ ] Works in Safari desktop
- [ ] Works in Mobile Safari (iOS)
- [ ] Works in Chrome Mobile (Android)
- [ ] No console errors in any browser

---

### Test #4: Integration Testing - MEDIUM
**Priority:** 🟡 MEDIUM
**Status:** ⏳ NOT TESTED

**Test Plan:**
1. **Full Workflow:**
   - Open app
   - Upload training.xlsx
   - Verify data appears in Knowledge Base
   - Navigate through weeks and trainings
   - Apply search filters
   - Verify results are correct
   - Edit an exercise
   - Verify change is saved
   - Reload page
   - Verify data persisted
   - Export to PDF
   - Verify PDF is readable
   - Start timer with exercises from a training
   - Verify timer works correctly

**Acceptance Criteria:**
- [ ] Upload works
- [ ] Knowledge Base displays correctly
- [ ] Search filters work
- [ ] Results are accurate
- [ ] Editing works
- [ ] Auto-save works
- [ ] Reload preserves data
- [ ] Export produces readable files
- [ ] Timer works with real data

---

### Test #5: Error Handling Testing - MEDIUM
**Priority:** 🟡 MEDIUM
**Status:** ⏳ NOT TESTED

**Test Plan:**
1. Upload empty .xlsx file → Expect friendly error
2. Upload .txt file renamed to .xlsx → Expect friendly error
3. Upload 20MB file → Expect size error
4. Upload .pdf file → Expect type error
5. Upload corrupt .xlsx file → Expect parse error
6. Disconnect internet and try to load → Expect offline message (if applicable)

**Acceptance Criteria:**
- [ ] Empty files show clear error
- [ ] Invalid files show clear error
- [ ] Large files show size error
- [ ] Wrong type files rejected
- [ ] Corrupt files handled gracefully
- [ ] All error messages are user-friendly

---

### Test #6: Timer Functionality Testing - MEDIUM
**Priority:** 🟡 MEDIUM
**Status:** ⏳ NOT TESTED

**Test Plan:**
1. **Basic Timer:**
   - Set work: 10s, rest: 5s, sets: 3, exercises: 2
   - Start timer
   - Verify work → rest transitions (color changes)
   - Verify rest → work transitions
   - Verify set counter increments
   - Verify exercise transitions
   - Verify timer completes

2. **Timer Controls:**
   - Start → Pause → Resume (verify it pauses)
   - Start → Stop (verify it stops)
   - Test fullscreen mode (F key)
   - Test keyboard shortcuts (Space, Escape)

3. **Sound:**
   - Verify beeps on work start
   - Verify different beeps on rest
   - Verify beeps on exercise change

**Acceptance Criteria:**
- [ ] Timer counts down correctly
- [ ] State transitions work (work/rest)
- [ ] Colors change with states
- [ ] Progress bar updates
- [ ] Counters update correctly
- [ ] Pause/resume works
- [ ] Stop works
- [ ] Fullscreen works
- [ ] Keyboard shortcuts work
- [ ] Sound notifications work

---

## SUGGESTIONS (ENHANCEMENTS)

### Suggestion #1: Add comprehensive error messages for users
**Priority:** 🟡 MEDIUM
**Status:** ⏳ PENDING

**Current Behavior:**
Error messages are technical and developer-focused.

**Suggested Improvement:**
Add user-friendly error messages that explain what went wrong and how to fix it.

**Benefits:**
- Better user experience
- Easier troubleshooting
- Reduced support requests

**Implementation:**
Create error message mapping function in ui.js

---

### Suggestion #2: Add progress indicator during file parsing
**Priority:** 🟢 LOW
**Status:** ⏳ PENDING

**Current Behavior:**
Shows "Parsing..." with no progress details.

**Suggested Improvement:**
Show detailed progress:
- Reading file (0-20%)
- Extracting weeks (20-40%)
- Parsing trainings (40-70%)
- Building knowledge base (70-90%)
- Finalizing (90-100%)

**Benefits:**
- Better user feedback
- Shows app is working
- Professional appearance

---

### Suggestion #3: Add "Load Sample Data" button
**Priority:** 🟢 LOW
**Status:** ⏳ PENDING

**Current Behavior:**
Users must have training.xlsx to test.

**Suggested Improvement:**
Add button to load sample data for testing/demo.

**Benefits:**
- Easy onboarding
- Quick testing
- Better first impression

---

## Priority Order for Fixes

**Implementation Agent should work in this order:**

1. ✅ **CRITICAL Issues** (none found)
2. 🟠 **HIGH Priority Issue #4** - Error handling for empty/corrupt files
3. 🔴 **CRITICAL Testing** - Mobile responsive testing
4. 🟡 **MEDIUM Issues #1 & #3** - Missing export & file validation
5. 🟠 **HIGH Testing** - Timer distance readability & browser compatibility
6. 🟡 **MEDIUM Testing** - Integration & error handling tests
7. 🟢 **LOW Issues #2 & #5** - Data typo & default section
8. 💡 **Suggestions** - Error messages, progress indicator, sample data

---

## Next Steps

**For Implementation Agent:**
1. Read this document carefully
2. Fix Issue #4 first (HIGH priority)
3. Report progress after each fix
4. Update issue statuses as fixed
5. Write detailed fix logs

**For QA Agent:**
1. Verify each fix after implementation
2. Run manual tests in order of priority
3. Update test statuses
4. Report any regressions

---

## Known Data Issues

### Data Issue #1: Typo in exercise name "австралийсие"

**Source:** training.xlsx (source data file)
**Issue:** Exercise name "австралийсие" should likely be "австралийские" (missing 'к')
**Impact:** Low - Does not affect functionality, only data accuracy
**Status:** DOCUMENTED

**Details:**
This typo exists in the source Excel file (training.xlsx) and is correctly parsed by the application. The parser is working as intended - it accurately reads and preserves the data from the source file.

**Options to fix:**
1. **Preferred:** Correct the typo in the source training.xlsx file before uploading
2. **Alternative:** Implement spell-check/normalization in parser (may introduce unintended changes)
3. **Current:** Documented as known data quality issue

**Recommendation:**
Users should verify their source Excel files for spelling accuracy before uploading. The parser intentionally preserves exact text from source files to avoid data corruption.

---

**Status:** Implementation work in progress - Issues being fixed by Implementation Agent.
