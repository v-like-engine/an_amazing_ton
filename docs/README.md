# Training Plan Parser & Manager

A powerful, browser-based application for managing and searching training plans from Excel files. Built entirely with vanilla JavaScript - no build tools, no dependencies, no server required.

## Features

### Core Functionality
- **Parse Training Files** - Upload Excel files and instantly parse them into a searchable knowledge base
- **Powerful Search** - Find trainings by exercises, intensity, set type, and more
- **Intelligent Filters** - Include/exclude exercises with precise AND/OR logic
- **Beautiful UI** - Phone-friendly, responsive design that works on any device
- **Tabata Timer** - Built-in workout timer with visual cues and audio notifications
- **Edit & Customize** - Add exercises, edit trainings, customize your program
- **Export** - Export trainings to PDF or images for easy gym use
- **Auto-Save** - Your data is automatically saved to your browser

### Key Benefits
- 100% Client-Side - All data processing happens in your browser
- Privacy First - Your training data never leaves your device
- Works Offline - No internet connection required after initial load
- No Installation - Just open the HTML file and start
- Mobile Optimized - Full functionality on phones and tablets
- Cyrillic Support - Full support for Russian and other Cyrillic languages

## Quick Start

### Option 1: Open Directly
1. Navigate to the `app` folder
2. Open `index.html` in your web browser
3. Upload your `training.xlsx` file
4. Start searching and training!

### Option 2: Local Server (Optional)
```bash
# If you prefer to use a local server:
cd an_amazing_ton/app
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

## Browser Support

Tested and working on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

## File Structure

```
an_amazing_ton/
├── app/
│   ├── index.html           # Main application
│   ├── css/
│   │   └── styles.css       # All styles
│   ├── js/
│   │   ├── data-model.js    # Data structures (KnowledgeBase, Week, Training, etc.)
│   │   ├── parser.js        # Excel file parser
│   │   ├── search.js        # Search engine
│   │   ├── filters.js       # Filter logic
│   │   ├── ui.js            # UI interactions
│   │   ├── timer.js         # Tabata timer
│   │   ├── storage.js       # LocalStorage management
│   │   ├── editor.js        # Edit functionality
│   │   └── export.js        # PDF/Image export
│   └── assets/              # Images, icons, etc.
├── tests/
│   ├── test-runner.html     # Test runner
│   └── *.test.js            # All test files
├── docs/
│   ├── README.md            # This file
│   ├── user-guide.md        # How to use the app
│   ├── architecture.md      # Technical overview
│   ├── api-reference.md     # Developer API docs
│   └── testing-guide.md     # How to run tests
└── training.xlsx            # Example training file
```

## How It Works

1. **Upload** - User uploads an Excel file (training.xlsx)
2. **Parse** - SheetJS library parses the Excel file
3. **Build** - Parser creates a structured KnowledgeBase
4. **Display** - UI renders the knowledge base in a beautiful interface
5. **Search** - User applies filters to find specific trainings
6. **Use** - User can view, edit, export, or run timer with selected trainings
7. **Save** - All changes are auto-saved to browser's localStorage

## Technology Stack

### Core Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JS

### External Libraries (CDN)
- **SheetJS (xlsx.js)** - Excel file parsing
- **jsPDF** - PDF generation
- **html2canvas** - Image generation
- **Font Awesome** - Icons

## Use Cases

### Personal Training
- Search for trainings with specific exercises
- Customize programs to your equipment
- Export workouts to take to the gym
- Track your progress over weeks

### Coaches
- Manage multiple training programs
- Quickly find alternative exercises
- Create client-specific plans
- Export professional-looking PDFs

### Gym Owners
- Build exercise libraries
- Create varied programming
- Share workouts with members
- Maintain workout history

## Security & Privacy

- **No Server** - All processing happens in your browser
- **No Uploads** - Files are processed locally, never uploaded
- **No Tracking** - No analytics, no cookies, no tracking
- **Open Source** - Full source code available for inspection

## Performance

- **Parse Speed** - < 500ms for typical training files
- **Search Speed** - < 100ms for search operations
- **UI Updates** - Real-time, no lag
- **File Size** - < 200KB total (excluding libraries)

## Documentation

- [User Guide](user-guide.md) - Complete guide to using the application
- [Architecture](architecture.md) - Technical architecture and design decisions
- [API Reference](api-reference.md) - Developer documentation for extending the app
- [Testing Guide](testing-guide.md) - How to run and write tests

## Testing

Run the comprehensive test suite:
```bash
# Open in browser:
tests/test-runner.html
```

Test coverage includes:
- Unit tests for all modules
- Integration tests for workflows
- Performance benchmarks
- Manual UI/UX tests

## Contributing

This is a multi-agent project with specialized responsibilities:
- **Agent 1** - Parser & Data Model
- **Agent 2** - Search & Filters
- **Agent 3** - Frontend & UI
- **Agent 4** - Storage & Export
- **Agent 5** - Testing & QA (Quality Gatekeeper)

See individual agent folders in `.agent-workspace/` for specific responsibilities.

## Quality Standards

All code must pass:
- 100% test pass rate
- Performance benchmarks
- Mobile responsiveness tests
- Accessibility checks
- Code review by Agent 5 (QA)

## License

This project is built for personal and educational use.

## Support

For issues or questions:
1. Check the [User Guide](user-guide.md)
2. Review the [API Reference](api-reference.md)
3. Run the test suite to identify issues
4. Check browser console for error messages

## Roadmap

Potential future features:
- Progressive Web App (PWA) support
- Export to Excel
- Workout history tracking
- Exercise video integration
- Social sharing
- Multiple language support
- Custom themes

## Acknowledgments

Built with modern web standards and best practices.
Designed for real-world use by athletes and coaches.

---

**Version:** 1.0.0
**Last Updated:** 2025-11-23
**Status:** In Development
