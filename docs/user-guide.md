# User Guide

Complete guide to using the Training Plan Parser & Manager

## Table of Contents

1. [Getting Started](#getting-started)
2. [Uploading Training Files](#uploading-training-files)
3. [Browsing Your Trainings](#browsing-your-trainings)
4. [Searching for Trainings](#searching-for-trainings)
5. [Using the Timer](#using-the-timer)
6. [Editing Trainings](#editing-trainings)
7. [Exporting for Gym Use](#exporting-for-gym-use)
8. [Managing Your Data](#managing-your-data)
9. [Tips & Tricks](#tips-and-tricks)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Opening the Application

1. Navigate to the `app` folder in your file manager
2. Double-click `index.html` to open in your default browser
3. Or right-click and choose your preferred browser

**Note:** The app works entirely in your browser - no installation or internet connection needed!

### First Time Setup

When you first open the app:
1. You'll see an empty state with an upload prompt
2. Click "Upload Training File" or drag-drop your Excel file
3. Wait a moment while the file is parsed
4. Your training plan appears, ready to use!

### Browser Requirements

The app works best on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers are fully supported

## Uploading Training Files

### Supported File Format

The app expects Excel files (.xlsx) with the following structure:
- Week information
- Training names
- Exercise blocks
- Exercise details (name, reps, weight)
- Intensity information

### Two Ways to Upload

#### Method 1: Click to Upload
1. Click the "Upload Training File" button
2. Browse to your training.xlsx file
3. Select the file and click "Open"
4. The file is parsed automatically

#### Method 2: Drag and Drop
1. Open your file manager
2. Drag your training.xlsx file
3. Drop it onto the app window
4. The file is parsed automatically

### What Happens During Upload

1. **Reading** - The Excel file is read into memory
2. **Parsing** - Each row is analyzed and structured
3. **Building** - A searchable knowledge base is created
4. **Displaying** - Your trainings appear in the interface
5. **Saving** - Data is automatically saved to your browser

This process typically takes less than a second!

### Upload Tips

- Files up to 5MB are supported
- The file never leaves your device
- You can upload a new file anytime (replaces existing data)
- Your browser remembers your last uploaded data

## Browsing Your Trainings

### Week View

After uploading, you'll see your trainings organized by week:

```
Week 1 ▶
Week 2 ▶
Week 3 ▶
...
```

Click the arrow (▶) to expand a week and see its trainings.

### Training Cards

Each training is shown as a card with:
- **Training Name** - e.g., "Monday Strength"
- **Type** - Strength, Cardio, Mixed, etc.
- **Exercise Count** - How many exercises
- **Intensity** - Difficulty level

Click a card to see full details.

### Training Details Modal

When you click a training, a detailed view opens showing:
- All exercise blocks
- Exercise names with reps and weights
- Set structure (AMRAP, rounds, etc.)
- Rest times
- Notes and intensity information

### Navigation

- **Scroll** - Scroll through weeks and trainings
- **Search** - Use filters to find specific trainings
- **Close** - Click X or press Escape to close modals

## Searching for Trainings

The search system helps you find exactly what you need.

### Search by Exercises

#### Include Exercises
Find trainings that contain specific exercises:

1. Click the "Include" search box
2. Start typing an exercise name (e.g., "squat")
3. Select from autocomplete suggestions
4. The exercise appears as a chip/tag
5. Results update to show only trainings with that exercise

**Adding Multiple Exercises (AND Logic):**
- Add multiple exercise chips
- Results show trainings containing ALL selected exercises
- Example: Include "Squats" + "Push-ups" → Only trainings with both

#### Exclude Exercises
Filter out trainings with unwanted exercises:

1. Click the "Exclude" search box
2. Type and select exercise(s) to exclude
3. Results hide any training containing those exercises

**Example Use Case:**
- Include: "Squats"
- Exclude: "Pull-ups"
- Result: All squats workouts WITHOUT pull-ups

### Search by Intensity

Filter by workout intensity:

1. Use the intensity slider
2. Set minimum and maximum percentage
3. Or select intensity levels (easy, moderate, hard)
4. Results show trainings within that intensity range

**Intensity Examples:**
- 60-70% - Moderate intensity
- 80-90% - High intensity
- "жесткий кач" - Hard workout (Russian)

### Search by Set Type

Filter by how exercises are organized:

- **AMRAP** - As Many Rounds As Possible
- **EMOM** - Every Minute On the Minute
- **Rounds** - Fixed number of rounds
- **Timed** - Time-based sets
- **Tabata** - 20/10 intervals

Select a set type to see only trainings with that structure.

### Combining Filters

All filters work together:

**Example Advanced Search:**
- Include: "Squats", "Push-ups"
- Exclude: "Pull-ups"
- Intensity: 70-80%
- Set Type: AMRAP

Result: AMRAP workouts at 70-80% intensity with squats and push-ups but no pull-ups!

### Autocomplete Features

As you type exercise names:
- Suggestions appear instantly
- Works with partial matches
- Supports Cyrillic text
- Case-insensitive
- Fuzzy matching (handles typos)

### Clearing Filters

- **Clear Individual** - Click X on any chip to remove it
- **Clear All** - Click "Clear Filters" button to reset
- **Results Count** - Always visible (e.g., "12 trainings found")

## Using the Timer

The built-in Tabata timer helps you execute workouts.

### Setting Up the Timer

1. Select a training from search results
2. Click "Start Timer" button
3. Configure timer settings:
   - Work time (default: 20 seconds)
   - Rest time (default: 10 seconds)
   - Number of rounds
4. Click "Begin Workout"

### During the Workout

The timer displays:
- **Large Time Display** - Readable from distance
- **Current Exercise** - What you should be doing
- **Next Exercise** - What's coming up
- **Round Counter** - Which round you're on
- **Progress Bar** - Visual progress

### Color Coding

- **Green** - Work period (exercise now!)
- **Red** - Rest period (take a break)
- **Yellow** - Transition (get ready)

### Timer Controls

- **Pause** - Pause the timer (click again to resume)
- **Stop** - Stop and reset the timer
- **Skip** - Move to next exercise
- **Adjust** - Change work/rest times on the fly

### Audio Cues

The timer provides audio notifications:
- Beep at start of work period
- Different beep at start of rest
- Warning beep 3 seconds before transition
- Completion sound at workout end

**Muting:** Click the speaker icon to mute/unmute

### Full Screen Mode

For gym use:
1. Click the full-screen icon
2. Timer fills your entire screen
3. Press Escape to exit full-screen

### Timer Tips

- Use on a tablet or phone at the gym
- Prop device where you can see it
- Test audio before starting
- Adjust times between rounds if needed

## Editing Trainings

Customize your program to match your needs.

### Editing an Exercise

1. Click a training to open details
2. Click "Edit" button on any exercise
3. Modify:
   - Repetitions (e.g., 10 → 12)
   - Weight (e.g., 100kg → 110kg)
   - Notes
4. Click "Save"
5. Changes are saved automatically

### Adding an Exercise

1. Open a training
2. Click "Add Exercise" in a block
3. Enter exercise details:
   - Exercise name
   - Repetitions
   - Weight
   - Notes
4. Click "Add"

### Removing an Exercise

1. Open a training
2. Click the trash icon next to an exercise
3. Confirm deletion
4. Exercise is removed

### Creating a New Training

1. Click "New Training" button
2. Enter training details:
   - Name
   - Type
   - Week
3. Add blocks and exercises
4. Save

### Creating a New Week

1. Click "New Week" button
2. Enter week number and name
3. Add trainings to the week

### Undo/Redo

Made a mistake?
- **Undo** - Ctrl+Z (Cmd+Z on Mac)
- **Redo** - Ctrl+Shift+Z

### Auto-Save

All changes are automatically saved to your browser. You never need to click "Save" - it happens in the background!

## Exporting for Gym Use

Take your workouts to the gym in a readable format.

### Export to PDF

1. Select a training
2. Click "Export to PDF"
3. PDF is generated with:
   - Training name and details
   - All exercises clearly formatted
   - Large, readable text
   - Professional layout
4. PDF downloads to your device
5. Print or view on your phone

### Export to Image

1. Select a training
2. Click "Export to Image"
3. High-resolution image is created
4. Save to your phone
5. View at the gym (no PDF reader needed)

### Print Directly

1. Select a training
2. Click "Print"
3. Your browser's print dialog opens
4. Choose printer or "Save as PDF"
5. Print-optimized layout ensures readability

### Export Multiple Trainings

1. Select multiple trainings (checkboxes)
2. Click "Export Selected"
3. All trainings in one PDF
4. Perfect for weekly planning

### Export Options

Customize your exports:
- **Page Size** - A4, Letter, etc.
- **Orientation** - Portrait or Landscape
- **Include** - Week number, intensity, notes
- **Font Size** - Larger for distance viewing

### Export Tips

- Export to PDF for multiple pages
- Export to image for quick phone viewing
- Use large fonts if viewing from distance
- Include notes section for tracking progress

## Managing Your Data

### Auto-Save

Your data is automatically saved to your browser's storage:
- After uploading a file
- After editing exercises
- After adding/removing items
- No manual save needed!

### Manual Backup

Create a backup file:
1. Click "Settings" (gear icon)
2. Click "Export Data"
3. JSON file downloads
4. Save this file somewhere safe

### Importing Data

Restore from a backup:
1. Click "Settings"
2. Click "Import Data"
3. Select your backup JSON file
4. Data is restored

### Clearing Data

Remove all data:
1. Click "Settings"
2. Click "Clear All Data"
3. Confirm deletion
4. All trainings removed
5. Upload a file to start fresh

### Storage Limits

Your browser has storage limits:
- Typical limit: 5-10MB
- Current usage shown in Settings
- Warning when approaching limit
- Create backups to avoid data loss

## Tips and Tricks

### Keyboard Shortcuts

- **Ctrl+F** - Focus search box
- **Escape** - Close modal
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z** - Redo
- **Space** - Pause/resume timer

### Mobile Tips

- Add to home screen for quick access
- Use landscape mode for better viewing
- Timer works great on phones
- Swipe gestures for navigation

### Search Tips

- Use partial names (e.g., "squa" finds "Squats")
- Combine filters for precise results
- Save common searches as bookmarks
- Clear filters often to explore

### Timer Tips

- Test audio before working out
- Use Bluetooth speaker for larger gyms
- Adjust times between rounds
- Pause for water breaks

### Organization Tips

- Use descriptive training names
- Add notes for form cues
- Track weights in exercise notes
- Export weekly plans on Sundays

### Performance Tips

- Close other browser tabs
- Clear browser cache occasionally
- Keep backup files
- Don't exceed storage limit

## Troubleshooting

### File Won't Upload

**Problem:** Click upload but nothing happens

**Solutions:**
- Check file format (.xlsx only)
- Ensure file isn't corrupted
- Try a different browser
- Check file size (< 5MB)

### Search Not Working

**Problem:** Filters don't show results

**Solutions:**
- Clear all filters and try again
- Check spelling of exercise names
- Verify exercises exist in your data
- Reload the page

### Timer Not Starting

**Problem:** Click start but timer doesn't begin

**Solutions:**
- Check if training has exercises
- Refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

### Changes Not Saving

**Problem:** Edits disappear after refresh

**Solutions:**
- Check browser storage settings
- Ensure cookies/storage enabled
- Browser may be in private mode
- Export data as backup

### Export Fails

**Problem:** PDF/Image doesn't download

**Solutions:**
- Check popup blocker settings
- Allow downloads in browser
- Ensure enough disk space
- Try different export format

### Slow Performance

**Problem:** App feels sluggish

**Solutions:**
- Close other browser tabs
- Clear browser cache
- Reduce number of trainings
- Use newer browser version

### Display Issues

**Problem:** Layout looks broken

**Solutions:**
- Zoom browser to 100%
- Refresh the page
- Update your browser
- Check screen resolution

### Data Lost

**Problem:** All trainings disappeared

**Solutions:**
- Check if you're in same browser
- Look for backup files
- Re-upload original Excel file
- Check browser storage wasn't cleared

### Can't Find Exercise

**Problem:** Exercise doesn't appear in autocomplete

**Solutions:**
- Check spelling (including Cyrillic)
- Ensure exercise exists in uploaded file
- Try partial name search
- Verify file was parsed correctly

## Getting Help

If you're still having issues:

1. Check browser console (F12)
2. Look for error messages
3. Run the test suite (tests/test-runner.html)
4. Review the API documentation
5. Check that you're using a supported browser

## What's Next?

Now that you know the basics:
- Explore advanced search combinations
- Customize your trainings
- Try the timer with different workouts
- Export for gym use
- Share the app with training partners!

---

**Need More Help?**
- [Architecture Documentation](architecture.md)
- [API Reference](api-reference.md)
- [Testing Guide](testing-guide.md)

**Version:** 1.0.0
**Last Updated:** 2025-11-23
