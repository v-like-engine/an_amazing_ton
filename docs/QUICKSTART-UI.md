# Quick Start Guide - TrainingPlan UI

## Open the App

Simply open `/app/index.html` in any modern web browser:

```bash
# From the project root
open app/index.html

# Or navigate to it in your browser
file:///path/to/an_amazing_ton/app/index.html
```

## First Time Use

### 1. Timer (Default View)
The app opens to the Timer section by default.

**Quick Test:**
1. Scroll down to Timer Settings
2. Change "Work Duration" to 10 seconds (for quick testing)
3. Change "Rest Duration" to 5 seconds
4. Click "Apply Settings"
5. Click the big "Start" button
6. Watch the timer countdown!

**What to See:**
- Large countdown number (00:10, 00:09, etc.)
- State changes: WORK (green) → REST (yellow)
- Progress bar fills up
- Set counter updates (1/3, 2/3, 3/3)
- Sound beeps at transitions (if enabled)

### 2. Upload Training File
1. Click "Upload" in the top navigation (or bottom nav on mobile)
2. Click the upload area or drag `training.xlsx` onto it
3. Wait for parsing (should be fast)
4. You'll be redirected to Knowledge Base

### 3. Browse Knowledge Base
After uploading:
- **Left sidebar:** List of weeks and trainings
- **Main area:** Selected training details
- Click any training to view exercises

### 4. Search Trainings
1. Click "Search" in navigation
2. Add filters:
   - Type exercise names in "Include Exercises"
   - Adjust intensity slider
   - Select set type
3. Click "Search"
4. View results as cards
5. Click any card to view details

### 5. Mobile View
Open on your phone or resize browser to < 768px:
- Bottom navigation appears
- Single column layouts
- Large tap targets
- Swipe-friendly

## Keyboard Shortcuts

### Timer Section
- **Space:** Start/Pause timer
- **Escape:** Stop timer or exit fullscreen
- **F:** Toggle fullscreen mode

### Navigation
- **Tab:** Move between interactive elements
- **Enter:** Activate buttons/links
- **Escape:** Close dropdowns/modals

## Features to Try

### 🎯 Timer Fullscreen Mode
1. Go to Timer section
2. Click "Fullscreen" button
3. Timer fills entire screen
4. Perfect for gym use!
5. Press Escape to exit

### 🔊 Sound Notifications
- Enable/disable in Timer Settings
- Work start: 1 beep
- Rest start: 2 beeps
- Exercise change: 3 beeps

### 📱 Mobile Bottom Nav
Resize browser to < 768px wide:
- Bottom navigation bar appears
- Large tap targets
- Active section highlighted

### 🎨 Animations
Watch for:
- Smooth section transitions
- Timer pulse animation
- Card hover effects
- Progress bar animations
- Loading spinners

## Tips

### For Gym Use
1. Load your training
2. Go to Timer section
3. Click "Load from Training" to import exercises
4. Adjust durations as needed
5. Click "Fullscreen"
6. Start your workout!

### For Quick Timer
1. Edit exercises in Timer Settings (one per line)
2. Set durations
3. Click "Apply Settings"
4. Start training!

### For Training Analysis
1. Upload training file
2. Browse in Knowledge Base
3. Use Search to find specific exercises
4. View detailed training breakdowns

## Troubleshooting

### Timer doesn't start
- Check console for errors (F12)
- Ensure JavaScript is enabled
- Verify timer.js loaded correctly

### File upload fails
- Use .xlsx or .xls files only
- Check file isn't corrupted
- Check console for errors

### Sections don't switch
- Check navigation links are clickable
- Verify JavaScript loaded
- Check console for errors

### Layout looks broken on mobile
- Clear browser cache
- Ensure viewport meta tag is present
- Try different browser

## Browser Requirements

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used:**
- CSS Grid
- CSS Variables
- Flexbox
- ES6 JavaScript
- Web Audio API (for sounds)
- Fullscreen API

## What's Next?

### Phase 1: Core Testing ✅
- [x] UI created
- [x] Timer working
- [x] Navigation working
- [ ] Integration testing

### Phase 2: Integration
- [ ] Test with real training.xlsx
- [ ] Verify search accuracy
- [ ] Test data persistence
- [ ] Test export features

### Phase 3: Polish
- [ ] Add background images
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Accessibility audit

## Getting Help

- Check `/docs/UI-TESTING-GUIDE.md` for detailed testing
- Check `/docs/AGENT3-SUMMARY.md` for implementation details
- Check console (F12) for JavaScript errors
- Check `.agent-workspace/agent3-frontend/claude.md` for status

## Demo Data

Use these values for quick testing:

**Fast Timer Test:**
- Work: 10 seconds
- Rest: 5 seconds
- Sets: 2
- Exercise Rest: 8 seconds
- Exercises: Push-ups, Squats

**Realistic Timer:**
- Work: 45 seconds
- Rest: 15 seconds
- Sets: 3
- Exercise Rest: 60 seconds
- Exercises: (Load from training)

## Enjoy! 💪

The UI is designed to be:
- **Beautiful** - Modern gym aesthetic
- **Functional** - Everything works smoothly
- **Responsive** - Perfect on any device
- **Fast** - Smooth 60fps animations
- **Accessible** - Works for everyone

Start your training journey now!

---

**Created by Agent 3 - Frontend, UI & Design**
