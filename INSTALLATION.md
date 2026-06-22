# Installation & Setup Guide

## Quick Start

### Prerequisites
- Node.js 18.17.0 or later
- npm 9+ or pnpm 8+
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Step 1: Install Dependencies

```bash
cd virtual_try_on
npm install
```

Or with pnpm:
```bash
pnpm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Step 3: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure Verification

After installation, verify these key directories exist:

```
virtual_try_on/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Business logic
├── services/            # External integrations
├── hooks/               # Custom hooks
├── types/               # TypeScript types
├── utils/               # Utility functions
├── public/              # Static assets
│   └── data/            # JSON database
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── next.config.js       # Next.js config
├── tailwind.config.ts   # Tailwind config
└── README.md            # Documentation
```

## Configuration Files

### package.json
Contains all project dependencies and scripts. Pre-configured with:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- MediaPipe (computer vision)
- React Dropzone (file upload)

### tsconfig.json
TypeScript strict mode enabled for type safety. Key settings:
- `strict: true` - Full type checking
- `noUnusedLocals: true` - Catch unused variables
- `noUnusedParameters: true` - Catch unused parameters
- Path alias: `@/*` for clean imports

### next.config.js
Next.js configuration with:
- WebAssembly support (for MediaPipe)
- Image optimization settings
- Build optimizations

### tailwind.config.ts
Tailwind CSS configuration with:
- Extended color palette
- Custom animations
- Responsive breakpoints

## Environment Setup

### Optional: Create .env.local

```bash
cp .env.example .env.local
```

Available environment variables:
```
NEXT_PUBLIC_APP_NAME=Virtual Jewellery Try-On
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_MEDIAPIPE_VERSION=0.10.0
```

Note: All `NEXT_PUBLIC_` variables are exposed to the browser.

## First Run Checklist

After starting the development server, verify:

- [ ] Home page loads with category cards
- [ ] Can click on a category (e.g., "Rings")
- [ ] Product grid displays with sample products
- [ ] Can see "Try On" buttons on products
- [ ] Click "Try On" opens upload page
- [ ] Image upload interface appears with drag-drop zone
- [ ] Can see upload tips section

## Development Tools

### IDE Setup

#### VS Code (Recommended)
Install extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- Prettier - Code formatter

#### Settings (Optional)
Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Package Manager

This project works with:
- **npm** (Node Package Manager - default)
- **pnpm** (Faster, more efficient)
- **yarn** (Compatible)

Stick to one manager to avoid conflicts.

## Common Issues & Solutions

### Issue: Port 3000 Already in Use
```bash
# Kill existing process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Node Modules Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: TypeScript Errors
```bash
# Rebuild TypeScript
npx tsc --noEmit

# Check for type errors
npm run build
```

### Issue: MediaPipe Models Not Loading
- Check browser console for CORS errors
- Ensure internet connection is stable
- Models are loaded from CDN on demand

### Issue: Slow Image Processing
- Close other browser tabs
- Clear browser cache
- Use a faster computer for testing
- Check browser DevTools for performance issues

## Building for Production

### Create Production Build
```bash
npm run build
```

Output goes to `.next/` directory.

### Run Production Build Locally
```bash
npm start
```

Server runs at `http://localhost:3000`

### Deployment Options

#### Vercel (Recommended)
1. Push code to GitHub
2. Connect to Vercel
3. Auto-deploys on push

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Self-hosted
1. Build: `npm run build`
2. Deploy `.next/` and `public/` directories
3. Run: `npm start`

## Performance Optimization

### Bundle Analysis
```bash
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})

# Run:
ANALYZE=true npm run build
```

### Image Optimization
- Add images to `public/` directory
- Use Next.js Image component for optimization
- Compress images before adding

## Testing Setup

### Unit Tests (Optional Setup)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### E2E Tests (Optional Setup)
```bash
npm install --save-dev @playwright/test
npx playwright install
```

## Debugging

### Chrome DevTools
1. Open DevTools: F12 or Right-click → Inspect
2. Use Console tab for logs
3. Use Performance tab for profiling
4. Use Network tab for API calls

### React Developer Tools
1. Install React DevTools browser extension
2. Inspect components in DevTools
3. Check props and state

### Next.js Debug Mode
```bash
# Run with debug output
DEBUG=* npm run dev
```

## Troubleshooting Deployment

### Build Errors
```bash
# Clean build cache
npm run build -- --clean

# Verbose output
npm run build -- --debug
```

### Runtime Errors
- Check `.next/server/` directory
- Review server logs
- Test locally first: `npm start`

### Performance Issues
- Analyze bundle size
- Check image optimization
- Enable compression
- Use CDN for static assets

## Getting Help

### Documentation
- [README.md](./README.md) - Overview and features
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design

### Resources
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [MediaPipe Docs](https://mediapipe.dev)

### Common Questions

**Q: Can I use this with a real database?**
A: Yes! Replace `lib/image-loader.ts` functions with API calls to your backend.

**Q: How do I add more products?**
A: Edit `public/data/products.json` and add new product entries.

**Q: Can I deploy this to X hosting?**
A: Yes, it's a standard Next.js app. See "Deployment Options" above.

**Q: How do I enable real-time camera mode?**
A: The architecture supports it. Create `app/camera/page.tsx` with real-time processing.

## Next Steps

1. **Explore the App**
   - Try uploading different images
   - Test different jewelry categories
   - Experiment with controls

2. **Customize Data**
   - Edit `public/data/products.json`
   - Add your jewelry products
   - Update category information

3. **Extend Features**
   - Review [DEVELOPMENT.md](./DEVELOPMENT.md)
   - Add new placement logic
   - Customize UI components

4. **Prepare for Production**
   - Set up environment variables
   - Configure domain/hosting
   - Test on real devices
   - Review security settings

## Support

For issues or questions:
1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) for common solutions
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design patterns
3. Check browser console for error messages
4. Review Next.js error pages for guidance
