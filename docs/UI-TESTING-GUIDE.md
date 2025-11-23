# UI Testing Guide - Agent 3 Frontend

This guide helps test the UI implementation created by Agent 3.

## Quick Start

1. Open `app/index.html` in a modern web browser
2. The app should display with the Timer section active
3. Test each section using the navigation

## Testing Checklist

### 1. Initial Load
- [ ] Page loads without errors (check console)
- [ ] Timer section is visible and active
- [ ] Navigation is visible (desktop or mobile depending on screen size)
- [ ] No broken images or missing resources

### 2. Responsive Design

#### Mobile (320px - 767px)
Open browser dev tools and test at:
- [ ] 320px width (iPhone SE)
- [ ] 375px width (iPhone X)
- [ ] 414px width (iPhone Plus)

**Expected:**
- Bottom navigation bar visible
- Single column layouts
- Touch-friendly buttons (44px+)
- No horizontal scrolling
- Hamburger menu for main nav
- Content readable and not overlapping

#### Tablet (768px - 1023px)
Test at:
- [ ] 768px width (iPad)
- [ ] 834px width (iPad Pro)

**Expected:**
- Desktop navigation appears
- Two-column layouts (sidebar + main)
- Bottom nav hidden
- Grid layouts adapt

#### Desktop (1024px+)
Test at:
- [ ] 1024px width
- [ ] 1440px width
- [ ] 1920px width

**Expected:**
- Full desktop navigation
- Multi-column grids
- Maximum content width constraints
- Proper spacing

### 3. Navigation

#### Desktop Navigation
- [ ] Click each nav link
- [ ] Active state shows correctly
- [ ] Sections switch properly
- [ ] Smooth transitions

#### Mobile Navigation
- [ ] Bottom nav items work
- [ ] Active state updates
- [ ] Tap targets are large enough

#### Keyboard Navigation
- [ ] Tab through navigation
- [ ] Enter activates links
- [ ] Focus states visible

### 4. Timer Section (CRITICAL!)

#### Visual Display
- [ ] Timer countdown is LARGE (readable from distance)
- [ ] Current exercise name displayed
- [ ] State indicator visible
- [ ] Progress bar updates
- [ ] Set counter visible (e.g., "3 / 8")
- [ ] Exercise counter visible (e.g., "2 / 4")

#### Color Coding
Start the timer and verify colors change:
- [ ] IDLE state: Gray
- [ ] WORK state: Green background/border
- [ ] REST state: Yellow/orange background/border
- [ ] EXERCISE-REST state: Blue background/border
- [ ] FINISHED state: Orange/gold

#### Controls
- [ ] Start button starts timer
- [ ] Pause button appears when running
- [ ] Pause/Resume toggles correctly
- [ ] Stop button resets timer
- [ ] Fullscreen button works

#### Settings
- [ ] Work duration can be changed
- [ ] Rest duration can be changed
- [ ] Sets per exercise can be changed
- [ ] Exercise rest duration can be changed
- [ ] Exercise list can be edited (one per line)
- [ ] Apply Settings button updates timer
- [ ] Sound toggle works

#### Functionality
- [ ] Timer counts down correctly (1 second per tick)
- [ ] Transitions from work to rest automatically
- [ ] Advances to next set after rest
- [ ] Advances to next exercise after all sets
- [ ] Exercise rest happens between exercises
- [ ] Timer finishes after all exercises

#### Sound
- [ ] Sound checkbox toggles sound
- [ ] Work start: 1 beep
- [ ] Rest start: 2 beeps
- [ ] Exercise change: 3 beeps
- [ ] Finished: celebration beeps

#### Keyboard Shortcuts
- [ ] Space: Start/Pause
- [ ] Escape: Stop or exit fullscreen
- [ ] F: Toggle fullscreen

#### Fullscreen Mode
- [ ] Fullscreen button enters fullscreen
- [ ] Timer display fills screen
- [ ] Controls remain accessible
- [ ] Exit fullscreen works

### 5. Upload Section

#### Visual
- [ ] Upload area is visible
- [ ] Icon and text centered
- [ ] Dashed border
- [ ] Hover effect on desktop

#### Functionality
- [ ] Click to browse works
- [ ] File input accepts .xlsx and .xls
- [ ] Drag and drop area responds to dragover
- [ ] Drop file triggers upload
- [ ] Loading state shows during parsing
- [ ] Progress indicator animates
- [ ] Success message appears
- [ ] Navigates to Knowledge Base after upload

#### Error Handling
- [ ] Wrong file type shows error toast
- [ ] Parse errors show error message
- [ ] Loading overlay hides on error

### 6. Knowledge Base Section

This section requires a parsed file. Upload `training.xlsx` first.

#### Sidebar
- [ ] Weeks are listed
- [ ] Week headers are clickable
- [ ] Expand/collapse works
- [ ] Chevron rotates on expand
- [ ] Training items are listed
- [ ] Clicking training shows detail

#### Training Detail
- [ ] Training name displayed
- [ ] Week shown in metadata
- [ ] Intensity shown
- [ ] Exercise count shown
- [ ] Blocks are separated
- [ ] Block titles visible
- [ ] Exercises listed with sets
- [ ] Set types shown as chips

#### Interactions
- [ ] Clicking different trainings updates detail
- [ ] Active training highlighted
- [ ] Scrolling works smoothly
- [ ] No overlapping content

### 7. Search Section

This requires parsed data. Upload training file first.

#### Filters Panel
- [ ] Include exercises input works
- [ ] Autocomplete dropdown appears
- [ ] Selecting exercise adds chip
- [ ] Remove button on chip works
- [ ] Exclude exercises same as above
- [ ] Intensity slider updates value
- [ ] Set type dropdown works
- [ ] Apply button triggers search
- [ ] Reset button clears all filters

#### Results
- [ ] Result count shows
- [ ] Results displayed as cards
- [ ] Training name visible
- [ ] Intensity badge shown
- [ ] Exercise chips shown (max 3 + more)
- [ ] Clicking result navigates to detail
- [ ] Empty state shows when no results

### 8. Editor Section

- [ ] Section shows placeholder
- [ ] Text indicates Agent 4 will populate
- [ ] No errors in console

### 9. Animations & Transitions

#### Smooth Animations
- [ ] Section transitions fade in
- [ ] Cards slide in
- [ ] Buttons have hover effects
- [ ] Timer pulses during countdown
- [ ] Progress bar animates smoothly
- [ ] Loading spinner rotates

#### Performance
- [ ] Animations run at 60fps (no jank)
- [ ] Page scrolling is smooth
- [ ] No layout shifts during load

### 10. Toast Notifications

Trigger toasts by:
- Uploading a file
- Applying timer settings
- Triggering errors

Check:
- [ ] Toast appears from bottom
- [ ] Icon matches type (success, error, warning, info)
- [ ] Message is readable
- [ ] Toast auto-hides after 3 seconds
- [ ] Position is centered on mobile

### 11. Accessibility

#### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus indicators visible
- [ ] Escape closes dropdowns
- [ ] Enter activates buttons

#### Screen Reader
- [ ] Semantic HTML structure
- [ ] Buttons have aria-labels
- [ ] Sections have headings
- [ ] Images have alt text (when added)

#### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Primary text: #ffffff on #0f1419 (pass)
- [ ] Timer states distinguishable
- [ ] Links have sufficient contrast

#### Motion
- [ ] prefers-reduced-motion respected
- [ ] Animations can be disabled

### 12. Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 13. Integration Points

#### With Agent 1 (Parser)
- [ ] `parseTrainingFile()` is called on upload
- [ ] KnowledgeBase object is received
- [ ] Training data displays correctly

#### With Agent 2 (Search)
- [ ] Search functions available
- [ ] Exercise autocomplete works
- [ ] Filter results are accurate

#### With Agent 4 (Storage)
- [ ] Auto-save functions (if available)
- [ ] Load from storage on refresh
- [ ] Export functions work (when implemented)

### 14. Performance

#### Load Time
- [ ] Initial page load < 2 seconds
- [ ] CSS loads without FOUC
- [ ] Scripts load in correct order

#### Runtime
- [ ] Timer ticks without lag
- [ ] Search completes < 100ms
- [ ] Parsing completes < 500ms
- [ ] No memory leaks during extended use

### 15. Layout Issues

#### No Overlapping
- [ ] Header doesn't overlap content
- [ ] Sidebar and main don't overlap
- [ ] Bottom nav doesn't cover content
- [ ] Modals center properly
- [ ] Toast doesn't block important UI

#### Proper Spacing
- [ ] Margins and padding consistent
- [ ] Grid gaps appropriate
- [ ] Content not touching edges
- [ ] Reading width comfortable

#### Z-index Layers
- [ ] Navigation on top
- [ ] Modals above content
- [ ] Toasts above everything
- [ ] Dropdowns above other elements

## Common Issues & Fixes

### Issue: Bottom nav covers content
**Fix:** Check `#main-content` has `padding-bottom: 80px`

### Issue: Timer too small on mobile
**Fix:** Verify `clamp()` functions in countdown styles

### Issue: Navigation doesn't switch sections
**Fix:** Check console for JS errors, verify `showSection()` function

### Issue: Autocomplete doesn't show
**Fix:** Verify Agent 2's search functions are loaded

### Issue: Timer doesn't tick
**Fix:** Check `setInterval` in `_startInterval()`, verify `_tick()` is called

### Issue: Animations janky
**Fix:** Use GPU-accelerated properties (transform, opacity), check for layout thrashing

## Test Data

Use the provided `training.xlsx` file in the root directory.

For manual timer testing, use these settings:
- Work: 10 seconds (for quick testing)
- Rest: 5 seconds
- Sets: 2
- Exercise Rest: 8 seconds
- Exercises: 2 exercises

This gives a ~50 second test cycle.

## Reporting Issues

When reporting to Agent 5, include:
1. Browser and version
2. Screen size
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
6. Screenshots

## Success Criteria

The UI is ready when:
- ✅ All sections load without errors
- ✅ Responsive on all screen sizes (320px - 1920px+)
- ✅ Timer works correctly with all features
- ✅ Navigation is smooth
- ✅ No overlapping or layout issues
- ✅ Animations are smooth (60fps)
- ✅ Accessibility features work
- ✅ Integration with other agents functional
- ✅ Looks professional and beautiful

---

**Created by Agent 3 - Frontend, UI & Design**
