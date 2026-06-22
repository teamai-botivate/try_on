# Architecture Documentation

## System Overview

Virtual Jewellery Try-On is a modular, production-ready testing application designed for evaluating jewellery placement quality. The architecture emphasizes clean separation of concerns and preparation for future platform integration.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
│          (Pages: Home, Category, Try-On)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌─────────┐   ┌──────────┐
   │ React  │    │ Zustand │   │ Framer   │
   │Component│   │ Store   │   │ Motion   │
   └────────┘    └─────────┘   └──────────┘
        │              │
        └──────┬───────┘
               ▼
        ┌─────────────────┐
        │  Business Logic │
        │  (lib/, hooks/) │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Image   │ │Placement│ │MediaPipe │
│Process. │ │Engine   │ │Integration
└─────────┘ └─────────┘ └──────────┘
```

## Core Layers

### 1. Presentation Layer (Components)

**Responsibility**: Rendering UI and handling user interactions.

**Key Components**:
- `TryOnWorkspace.tsx` - Orchestrates the try-on interface
- `PreviewCanvas.tsx` - Renders image with landmarks
- `ControlPanel.tsx` - User controls for adjustments
- `ImageUpload.tsx` - File upload interface

**Design Principles**:
- Components are presentational (minimal logic)
- State is managed via Zustand
- Animations via Framer Motion
- Responsive Tailwind styling

### 2. State Management Layer (Zustand Store)

**Responsibility**: Centralized state for try-on session.

**State Structure**:
```typescript
interface TryOnState {
  product: JewelleryProduct | null;
  image: ProcessedImage | null;
  faceLandmarks: FaceLandmarks | null;
  handLandmarks: HandLandmarks[] | null;
  poseLandmarks: PoseLandmarks | null;
  segmentation: ImageSegmentation | null;
  controls: JewelleryControls;
  isProcessing: boolean;
  error: string | null;
}
```

**Mutations**:
- Immutable updates only
- Clear naming (setX, resetX)
- Single responsibility per method

### 3. Business Logic Layer (lib/, services/, hooks/)

**Image Processing Pipeline**:
1. Validation → 2. Quality Analysis → 3. Enhancement
```
File Upload
    ↓
validateImageFile()
    ↓
processImage()
    ├→ Load as Image
    ├→ Create Canvas
    ├→ analyzeImageQuality()
    └→ enhanceImageQuality()
```

**Landmark Detection Pipeline**:
1. Initialize MediaPipe → 2. Detect per type → 3. Calculate placement
```
Canvas Ready
    ↓
initializeMediaPipe()
    ↓
Parallel Detection:
├→ detectFace()
├→ detectHands()
├→ detectPose()
└→ segmentImage()
    ↓
calculatePlacement()
```

**Placement Engine**:
- Modular per jewelry type
- Position → Rotation → Scale calculation
- Uses landmark coordinates for automatic fitting

### 4. Data Layer (public/data/)

**JSON Database Structure**:

**categories.json**:
```json
{
  "id": "rings",
  "name": "Rings",
  "slug": "rings",
  "description": "...",
  "icon": "💍"
}
```

**products.json**:
```json
{
  "id": "ring-1",
  "name": "Classic Gold Ring",
  "category": "rings",
  "thumbnail": "...",
  "preview": "...",
  "modelPath": "...",
  "scale": { "x": 1, "y": 1, "z": 1 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "position": { "x": 0, "y": 0, "z": 0 },
  "placementArea": "ring"
}
```

**Future**: Easy migration to API endpoints or database.

## Data Flow Diagrams

### User Upload Flow
```
User selects image
    ↓
ImageUpload component
    ├→ Validate file
    ├→ Process image
    └→ Store in Zustand
        ↓
    TryOnWorkspace triggers detection
        ↓
    Display preview
```

### Landmark Detection Flow
```
TryOnWorkspace mounted
    ↓
useEffect triggers
    ├→ Initialize MediaPipe
    └→ Detect landmarks
        ├→ Face (478 landmarks)
        ├→ Hands (42 landmarks/hand)
        └→ Pose (33 landmarks)
            ↓
    Calculate placement
        ↓
    Update Zustand store
        ↓
    PreviewCanvas re-renders
```

### Control Adjustment Flow
```
User adjusts slider
    ↓
ControlPanel onChange
    ↓
setControls() in Zustand
    ↓
PreviewCanvas subscribes
    ↓
Re-render with new values
```

## Jewelry Placement Strategies

### Ring Placement
- **Detection**: Right hand, ring finger landmark
- **Calculation**: 
  - Position: Ring finger coordinates
  - Rotation: Finger orientation angle
  - Scale: Finger width based

### Bracelet/Bangle Placement
- **Detection**: Left hand, wrist landmark
- **Calculation**:
  - Position: Wrist center
  - Rotation: Arm orientation
  - Scale: Wrist circumference estimate

### Necklace/Chain Placement
- **Detection**: Face + Pose (shoulders, chin)
- **Calculation**:
  - Position: Center between shoulders
  - Rotation: Based on shoulder angle
  - Scale: Shoulder width based

### Earring Placement
- **Detection**: Face landmarks (ear position)
- **Calculation**:
  - Position: Ear landmark
  - Rotation: Face orientation
  - Scale: Face width based

### Watch Placement
- **Detection**: Left hand, wrist + fingers
- **Calculation**:
  - Position: Wrist center
  - Rotation: Arm + hand orientation
  - Scale: Wrist width + hand size

## Image Quality Pipeline

### Analysis Steps

1. **Resolution Check**
   - Minimum: 640x480
   - Warning if below threshold

2. **Brightness Analysis**
   - Average pixel luminance
   - Warning if too dark (<50) or bright (>200)

3. **Contrast Analysis**
   - Pixel variance calculation
   - Warning if too low (<20)

4. **Blur Detection**
   - Laplacian edge detection
   - Sample region analysis
   - Flag if edge ratio < 0.05

### Quality Metrics
```typescript
interface ImageQuality {
  isValid: boolean;        // Overall validity
  isBlurry: boolean;       // Blur detection
  brightness: number;      // 0-255
  contrast: number;        // Variance
  issues: string[];        // User-friendly messages
}
```

## MediaPipe Integration

### Lazy Loading
```typescript
// Loaded on-demand, not at app start
await initializeMediaPipe();
```

### Model URLs
```typescript
// Via CDN to minimize bundle
https://cdn.jsdelivr.net/npm/@mediapipe/...
```

### Detection Functions
```typescript
detectFace(canvas)      → FaceLandmarks
detectHands(canvas)     → HandLandmarks[]
detectPose(canvas)      → PoseLandmarks
segmentImage(canvas)    → ImageSegmentation
```

## Responsive Design Architecture

### Breakpoint Strategy
```
xs (320px) → sm (640px) → md (768px) → lg (1024px) → xl (1280px) → 2xl (1920px)
```

### Layout Modes

**Mobile (<768px)**:
- Single column
- Stacked controls below preview
- Full-width canvas
- Touch-optimized buttons

**Tablet (768px-1024px)**:
- Two columns (preview + controls side-by-side)
- Adjusted spacing
- Readable labels

**Desktop (>1024px)**:
- Three columns (info + preview + controls)
- Sticky controls
- Full information display

## Performance Optimization Strategies

### Code Splitting
- Dynamic imports for heavy components
- Lazy loading of MediaPipe models
- Route-based code splitting

### Memory Management
- Canvas cleanup after processing
- Image data released after use
- Zustand store reset on navigation

### Rendering Optimization
- Memoized components with React.memo (where beneficial)
- Zustand selector optimization
- Conditional rendering of heavy components

## Error Handling Strategy

### Error Boundaries
```
Try-On Workspace
  └→ PreviewCanvas
     └→ Rendering errors caught
```

### User-Friendly Error Messages
- "Face detection failed" → "Please use a clear photo with a visible face"
- "Hand detection failed" → "Please ensure your hands are visible in the photo"
- "Detection failed" → Continue with default placement

### Error Recovery
1. Display error message
2. Allow user to upload new image
3. Provide tips for improvement
4. Fallback to default values

## Future Architecture Additions

### 1. Real-time Camera Mode
```
Planned: app/camera/page.tsx
├→ getUserMedia()
├→ Real-time canvas rendering
├→ Kalman filter for smoothing
└→ 30+ FPS processing
```

### 2. Backend Integration
```
Planned: services/api-client.ts
├→ Replace loadCategories() with API call
├→ Replace loadProducts() with API call
└→ Add authentication
```

### 3. Cloud Storage
```
Planned: services/storage-service.ts
├→ Upload original image
├→ Store result
├→ Share links
```

### 4. Database Models
```
Planned: models/
├→ Category
├→ Product
├→ TryOnSession
└→ UserAnalytics
```

### 5. Admin Dashboard
```
Planned: app/admin/
├→ Product management
├→ Analytics
├→ Quality metrics
└→ User feedback
```

## Type Safety

**100% TypeScript Coverage**:
- No `any` types allowed
- Strict mode enabled
- All interfaces defined in `types/index.ts`

**Type Organization**:
```typescript
// High-level domain types
export interface JewelleryProduct { }
export interface Category { }

// Detection results
export interface FaceLandmarks { }
export interface HandLandmarks { }

// State types
export interface TryOnState { }

// API types
export interface APIResponse<T> { }
```

## Scalability Considerations

### Data Volume
- Current: JSON files (100 products easily supported)
- Future: Database with pagination

### User Concurrency
- Stateless processing (no server-side state)
- Each user independent
- Scales horizontally

### Model Management
- CDN delivery of ML models
- Lazy loading on demand
- No local storage overhead

## Security Considerations

### Client-Side Only
- No sensitive data transmission
- Image processing local only
- No user tracking (except session)

### File Validation
- Type checking
- Size validation
- No script injection risks

### CORS
- External resources loaded via CORS
- CDN-based model delivery

## Maintenance Guidelines

### Adding New Features
1. Define types in `types/index.ts`
2. Add business logic to appropriate service
3. Create components in `components/`
4. Update Zustand store if needed
5. Test across breakpoints

### Updating Dependencies
- Use `npm update` for minor/patch
- Review breaking changes for major
- Test after updates

### Code Review Checklist
- TypeScript strict mode compliance
- Mobile responsiveness tested
- Error handling implemented
- Performance implications considered
- Documentation updated
