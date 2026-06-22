# Virtual Jewellery Try-On Engine

A production-quality testing application for virtual jewellery try-on capabilities.

## Overview

This is a **standalone testing application** designed to evaluate jewellery try-on quality before integrating into a larger production platform. It's NOT an e-commerce website, admin panel, or complete product.

## Features

- **10+ Jewellery Categories**: Rings, earrings, necklaces, bracelets, bangles, watches, pendants, chains, nose rings, and mangalsutra
- **Smart Image Upload**: Support for PNG, JPEG, and WebP (up to 20MB)
- **Automatic Landmark Detection**: Uses MediaPipe for face, hand, and pose detection
- **Intelligent Placement**: Category-specific placement logic for realistic positioning
- **Quality Analysis**: Automatic image quality assessment with helpful warnings
- **Responsive Design**: Works perfectly on all screen sizes (320px - 1920px)
- **Interactive Controls**: Scale, rotation, position, and view adjustments
- **High-Quality Export**: Download results as PNG or JPEG

## Technology Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn UI** components
- **Zustand** for state management
- **Framer Motion** for animations
- **MediaPipe Tasks Vision** for landmark detection
- **React Dropzone** for file uploads

## Project Structure

```
app/                    # Next.js app directory
  layout.tsx           # Root layout
  page.tsx             # Home page with categories
  category/            # Category selection page
  try-on/              # Try-on workspace

components/            # React components
  ProductGrid.tsx      # Product grid display
  ImageUpload.tsx      # Image upload interface
  TryOnWorkspace.tsx   # Main try-on interface
  PreviewCanvas.tsx    # Image preview canvas
  ControlPanel.tsx     # Control sliders and buttons
  ActionButtons.tsx    # Download and action buttons
  QualityWarnings.tsx  # Quality assessment warnings
  SliderControl.tsx    # Reusable slider component

lib/                   # Utility functions
  store.ts             # Zustand state management
  image-loader.ts      # Data loading utilities
  image-processing.ts  # Image processing and quality analysis
  placement-engine.ts  # Jewellery placement logic

services/              # Business logic services
  mediapipe-service.ts # MediaPipe integration

types/                 # TypeScript type definitions
  index.ts             # All shared types

public/
  data/
    categories.json    # Category definitions
    products.json      # Product catalogue

utils/                 # Helper utilities

```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Workflow

1. **Select Category** - Choose a jewellery type from the home page
2. **View Products** - Browse available items in that category
3. **Upload Image** - Provide a photo for try-on
4. **Auto Detection** - System automatically detects face, hands, and pose
5. **Manual Adjustment** - Fine-tune placement with sliders
6. **Export Result** - Download the result as PNG or JPEG

### Adding New Products

Edit `public/data/products.json`:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "rings",
  "thumbnail": "/images/rings/thumb.jpg",
  "preview": "/images/rings/preview.jpg",
  "modelPath": "/models/rings/model.glb",
  "scale": { "x": 1, "y": 1, "z": 1 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "position": { "x": 0, "y": 0, "z": 0 },
  "placementArea": "ring"
}
```

### Supported Placement Areas

- `ring` - Ring finger placement
- `bracelet` - Wrist placement
- `bangle` - Wrist diameter-based placement
- `necklace` - Neck curve fitting
- `pendant` - Chest center placement
- `earrings` - Ear positioning
- `watch` - Wrist watch placement
- `chain` - Neck chain placement
- `nose_ring` - Nostril placement
- `mangalsutra` - Neck placement (traditional)

## Architecture Decisions

### Modular Design

The application is structured to be easily migrated to a larger system:

- **Placement Logic** is isolated in `lib/placement-engine.ts`
- **Image Processing** is in `lib/image-processing.ts`
- **MediaPipe Integration** is in `services/mediapipe-service.ts`
- **State Management** uses Zustand for easy persistence

### Image-Based (Not Real-time)

This version processes static images. The architecture is prepared for future real-time camera mode:

- Landmark detection code is service-based
- Smoothing filters are placeholders for future enhancement
- Canvas rendering is optimized for both images and video

### No Backend Required

Uses JSON files for data:

- Easy to replace with API calls later
- No database setup needed
- Perfect for testing

## Performance Optimization

- Lazy loading of MediaPipe models
- Responsive canvas rendering
- Efficient image processing
- Code splitting via dynamic imports
- Optimized bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

This architecture supports:

- Real-time camera try-on
- Database integration
- Cloud storage
- Admin dashboard
- E-commerce integration
- Analytics tracking
- Multiple person detection
- Physics simulation
- Depth estimation

## Development

### Adding New Features

1. Create type definitions in `types/index.ts`
2. Add business logic to appropriate service
3. Create React components in `components/`
4. Update Zustand store if needed
5. Test responsiveness across breakpoints

### Responsive Breakpoints

The application is tested on:

- 320px, 360px, 375px, 390px, 412px, 480px (Mobile)
- 768px, 1024px (Tablet)
- 1280px, 1440px, 1920px (Desktop)

## Troubleshooting

### Face detection fails

- Ensure face is clearly visible
- Check lighting conditions
- Try a different angle

### Hand detection fails

- Hands must be fully visible
- Good contrast with background
- Clear lighting

### Image quality warnings

- These are informational
- The app still works with lower quality images
- Accuracy may be reduced

## License

Proprietary - For testing purposes only

## Support

For issues or questions, contact the development team.
