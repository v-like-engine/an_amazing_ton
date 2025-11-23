# Assets Directory

This directory contains all images, icons, and media files for the TrainingPlan application.

## Recommended Assets

### Background Images
For the best visual experience, add high-quality, free fitness/gym images:

1. **Hero Background** (`hero-bg.jpg`) - 1920x1080px
   - Gym equipment, weights, or fitness scene
   - Apply dark overlay for readability
   - Sources: Unsplash, Pexels, Pixabay

2. **Timer Background** (`timer-bg.jpg`) - 1920x1080px
   - Clean, motivational fitness image
   - Should work well in fullscreen mode

3. **Upload Section** (`upload-bg.jpg`) - 1920x1080px
   - Lighter, welcoming fitness image

### Icons
The application currently uses Font Awesome icons via CDN.
Custom icons can be added here as SVG files.

### Logo
A simple SVG logo is provided (`logo.svg`) for branding purposes.

## Usage

To use background images in CSS:
```css
.section {
    background: url('../assets/hero-bg.jpg') center/cover no-repeat;
}
```

## Image Optimization

- Use compressed images (JPG for photos, PNG for graphics, SVG for icons)
- Recommended max size: 500KB per image
- Use WebP format for better compression (with JPG fallback)

## Copyright

Ensure all images are licensed for free use:
- Unsplash: Free for commercial use
- Pexels: Free for commercial use
- Pixabay: Free for commercial use

Always provide attribution if required by the license.
