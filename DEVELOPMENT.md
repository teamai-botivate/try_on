# Development Guide

## Overview

This document provides guidance for developing and extending the Virtual Jewellery Try-On application.

## Code Organization

### Core Directories

#### `app/`
Next.js App Router pages and layouts. Each folder represents a route.

- `page.tsx` - Home page with category selection
- `category/[slug]/page.tsx` - Product listing for a category
- `try-on/[id]/page.tsx` - Try-on workspace for a product
- `layout.tsx` - Root layout
- `globals.css` - Global styles

#### `components/`
Reusable React components with strict responsibility separation.

- `ProductGrid.tsx` - Grid display of products
- `ImageUpload.tsx` - Image upload and drag-drop interface
- `TryOnWorkspace.tsx` - Main try-on interface coordinator
- `PreviewCanvas.tsx` - Canvas for rendering the image with landmarks
- `ControlPanel.tsx` - Control panel for adjustments
- `ActionButtons.tsx` - Download and navigation buttons
- `QualityWarnings.tsx` - Image quality feedback
- `SliderControl.tsx` - Reusable slider component

#### `lib/`
Shared business logic and utilities.

- `store.ts` - Zustand state management
- `image-loader.ts` - Data fetching and product/category loading
- `image-processing.ts` - Image quality analysis and enhancement
- `placement-engine.ts` - Jewellery placement calculations

#### `services/`
External service integrations.

- `mediapipe-service.ts` - MediaPipe face, hand, and pose detection

#### `hooks/`
Custom React hooks for reusable logic.

- `useImageProcessing.ts` - Image processing hook
- `useLandmarkDetection.ts` - Landmark detection hook

#### `types/`
TypeScript type definitions.

- `index.ts` - All shared types

#### `utils/`
Pure utility functions.

- `math.ts` - Mathematical calculations
- `validation.ts` - Validation helpers

#### `public/data/`
JSON database files.

- `categories.json` - Category definitions
- `products.json` - Product catalog

## Development Workflow

### Adding a New Jewellery Category

1. **Add to categories.json:**
```json
{
  "id": "new-category",
  "name": "Category Name",
  "slug": "new-category",
  "description": "Description",
  "icon": "🌟"
}
```

2. **Add products to products.json:**
```json
{
  "id": "product-id",
  "name": "Product Name",
  "category": "new-category",
  "thumbnail": "/images/path/thumb.jpg",
  "preview": "/images/path/preview.jpg",
  "modelPath": "/models/path/model.glb",
  "scale": { "x": 1, "y": 1, "z": 1 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "position": { "x": 0, "y": 0, "z": 0 },
  "placementArea": "category-placement-area"
}
```

3. **Add placement logic (if needed) in placement-engine.ts:**
```typescript
export function calculateNewCategoryPlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null,
  handLandmarks: HandLandmarks[] | null,
  poseLandmarks: PoseLandmarks | null
): PlacementResult {
  // Implementation
}
```

4. **Update calculatePlacement function:**
```typescript
case "new_placement_area":
  return calculateNewCategoryPlacement(product, faceLandmarks, handLandmarks, poseLandmarks);
```

### Adding Image Processing Features

Image processing logic is in `lib/image-processing.ts`. To add new features:

1. **Add analysis function:**
```typescript
function analyzeNewProperty(canvas: HTMLCanvasElement): number {
  // Analysis logic
  return result;
}
```

2. **Update analyzeImageQuality:**
```typescript
const newProperty = analyzeNewProperty(canvas);
// Add to issues if needed
```

### Extending Landmark Detection

MediaPipe integration is in `services/mediapipe-service.ts`:

1. **Add new detection function:**
```typescript
export function detectNewBodyPart(canvas: HTMLCanvasElement): DetectionResult | null {
  // Detection logic
}
```

2. **Use in component:**
```typescript
const newLandmarks = detectNewBodyPart(image.canvas);
```

## State Management

Using Zustand for state management in `lib/store.ts`:

### Accessing State
```typescript
const product = useTryOnStore((state) => state.product);
```

### Updating State
```typescript
const setProduct = useTryOnStore((state) => state.setProduct);
setProduct(newProduct);
```

### Resetting State
```typescript
const reset = useTryOnStore((state) => state.reset);
reset();
```

## Component Best Practices

### Props
```typescript
interface ComponentProps {
  // Define all props with types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Implementation
}
```

### Animations
Use Framer Motion for animations:

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Responsive Design
Use Tailwind breakpoints:

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

## Testing Considerations

### Image Upload Testing
- Test with various image formats (JPEG, PNG, WebP)
- Test with different sizes (small, large, oversized)
- Test with poor quality images
- Test with missing body parts

### Landmark Detection Testing
- Face detection: various angles, lighting, expressions
- Hand detection: different hand positions, lighting
- Pose detection: different body positions

### Responsiveness Testing
Breakpoints to test:
- 320px (small mobile)
- 375px (standard mobile)
- 768px (tablet)
- 1024px (large tablet)
- 1280px (desktop)
- 1920px (large desktop)

## Performance Optimization

### Code Splitting
- Use dynamic imports for heavy modules
- Lazy load MediaPipe models

### Image Optimization
- Compress preview images
- Use WebP format where supported
- Implement responsive images

### Bundle Size
- Monitor bundle size with `next/bundle-analyzer`
- Remove unused dependencies
- Tree-shake unused code

## Future Enhancements

### Real-time Camera Support
The architecture supports adding real-time camera:

1. Create `app/camera` page
2. Use `getUserMedia()` API
3. Implement real-time rendering loop
4. Use Kalman filter for smoothing

### Backend Integration
Replace JSON files with API:

1. Create API endpoints in Next.js
2. Update data loading functions
3. Add authentication if needed
4. Implement caching

### Admin Dashboard
For product management:

1. Create `/admin` routes
2. Add product creation/editing
3. Image upload management
4. Analytics dashboard

## Debugging

### Browser DevTools
- Use React DevTools to inspect components
- Use Redux DevTools to inspect store state
- Use Network tab to check data loading

### Console Logging
Keep debug logs minimal in production:

```typescript
if (process.env.NODE_ENV === "development") {
  console.log("Debug info");
}
```

### MediaPipe Debugging
Enable detailed logging:

```typescript
// In mediapipe-service.ts
console.log("Landmarks detected:", results.landmarks);
```

## Deployment

### Building for Production
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### Optimization Checklist
- [ ] Remove console logs
- [ ] Optimize images
- [ ] Check bundle size
- [ ] Test responsiveness
- [ ] Verify accessibility
- [ ] Test on actual devices

## Common Issues and Solutions

### MediaPipe Not Loading
- Check network connectivity
- Verify CDN URLs in mediapipe-service.ts
- Check browser console for errors

### Image Not Processing
- Verify file format is supported
- Check file size is under 20MB
- Ensure proper browser permissions

### Landmarks Not Detected
- Check image quality
- Verify lighting conditions
- Ensure body parts are visible

## Contributing Guidelines

1. Follow the existing code style
2. Add TypeScript types for new code
3. Update documentation when adding features
4. Test on mobile and desktop
5. Keep components small and focused
6. Avoid prop drilling - use store when appropriate

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [MediaPipe Documentation](https://mediapipe.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
