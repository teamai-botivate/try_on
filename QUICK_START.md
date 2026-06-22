# Quick Start Guide

## 30-Second Setup

```bash
cd virtual_try_on
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

## The Application

### What It Does
Tests virtual jewellery try-on quality by:
1. Uploading any image
2. Automatically detecting face/hands/pose
3. Placing jewellery intelligently
4. Downloading the result

### Navigation
```
Home Page (Category Selection)
    ↓
Category Page (Product Browsing)
    ↓
Try-On Page (Upload & Result)
```

## Quick Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production build |
| `npm run lint` | Check code (if configured) |

## File Structure at a Glance

```
📁 app/                    → Pages & routing
📁 components/             → UI components
📁 lib/                    → Business logic
📁 services/               → ML & external APIs
📁 types/                  → TypeScript types
📁 public/data/            → Product & category data
📄 package.json            → Dependencies
📄 tsconfig.json           → TypeScript config
📄 tailwind.config.ts      → Styling config
```

## Adding Products

Edit `public/data/products.json`:

```json
{
  "id": "unique-id",
  "name": "Product Name",
  "category": "rings",
  "thumbnail": "/images/thumb.jpg",
  "preview": "/images/preview.jpg",
  "modelPath": "/models/model.glb",
  "scale": { "x": 1, "y": 1, "z": 1 },
  "rotation": { "x": 0, "y": 0, "z": 0 },
  "position": { "x": 0, "y": 0, "z": 0 },
  "placementArea": "ring"
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 busy | Use `npm run dev -- -p 3001` |
| Module not found | Run `npm install` |
| TypeScript errors | Run `npm run build` to see full list |
| Images not loading | Check `public/` directory and paths |

## Key Features

✅ 10 jewelry categories
✅ Smart landmark detection
✅ Automatic placement
✅ Image quality analysis
✅ Export results
✅ Mobile responsive
✅ Zero backend required

## Technologies

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind** - Styling
- **MediaPipe** - AI detection
- **Zustand** - State management
- **Framer Motion** - Animations

## Testing Locally

1. **Mobile**: DevTools device emulation (F12 → Toggle Device Toolbar)
2. **Desktop**: Just use browser normally
3. **Different resolutions**: Resize browser window

## Deployment

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t vto .
docker run -p 3000:3000 vto
```

## Documentation

| File | Content |
|------|---------|
| README.md | Features & overview |
| INSTALLATION.md | Setup & deployment |
| DEVELOPMENT.md | How to extend |
| ARCHITECTURE.md | System design |
| PROJECT_SUMMARY.md | Completion summary |
| CHECKLIST.md | Quality checklist |

## Environment Variables

Optional - Create `.env.local`:
```
NEXT_PUBLIC_APP_NAME=Virtual Jewellery Try-On
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Performance Tips

- Clear browser cache: Ctrl+Shift+Delete
- Use Chrome DevTools Performance tab
- Check Network tab for slow loads
- Use Chrome Lighthouse for audits

## File Size Check

```bash
# Check next output directory
du -sh .next/
ls -lh public/
```

## Browser DevTools Tips

1. **F12** - Open DevTools
2. **Ctrl+Shift+P** - Command palette
3. **Toggle Device Toolbar** - Mobile view
4. **React DevTools** - Component inspection
5. **Network tab** - Monitor requests

## Terminal Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Clearing cache
npm cache clean --force  # Clear npm cache
rm -rf node_modules      # Delete node modules
rm package-lock.json     # Delete lock file
npm install              # Fresh install
```

## Project Capabilities

### Current ✅
- Image-based try-on
- Face, hand, pose detection
- 10 jewelry categories
- Responsive design
- Quality analysis
- Export results

### Future 🚀
- Real-time camera mode
- Multi-person detection
- Physics simulation
- Database backend
- Admin dashboard
- E-commerce integration

## Quick Debugging

```javascript
// In browser console
// Check store state
zustandStore.getState()

// Check MediaPipe
window.faceLandmarker

// Check canvas
document.querySelector('canvas')
```

## Support Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **MediaPipe**: https://mediapipe.dev
- **Tailwind**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org

## Performance Benchmarks (Target)

- **Home page load**: < 1s
- **Category page load**: < 1s
- **Image processing**: < 3s
- **Landmark detection**: < 2s
- **Canvas render**: 60 FPS
- **Bundle size**: < 500KB

## Accessibility Checklist

- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Focus indicators
- ✅ Alt text on images
- ✅ Clear error messages

## Mobile Optimization

- Touch targets 48px+
- Readable font sizes
- No horizontal scroll
- Optimized images
- Fast interactions

## Success Criteria

You'll know it's working when:
1. ✅ Categories display on home page
2. ✅ Products load on category page
3. ✅ Can upload images on try-on page
4. ✅ Landmarks detect and display
5. ✅ Can download result as PNG/JPEG

## One-Page Feature Summary

| Feature | Status | Details |
|---------|--------|---------|
| Category Selection | ✅ | 10 categories with icons |
| Product Browsing | ✅ | Grid view with search |
| Image Upload | ✅ | Drag-drop, paste, browse |
| Quality Analysis | ✅ | Brightness, contrast, blur |
| Landmark Detection | ✅ | Face, hands, pose |
| Placement Engine | ✅ | Smart placement per category |
| Controls | ✅ | Scale, rotation, position |
| Export | ✅ | PNG & JPEG download |
| Responsive | ✅ | 320px to 1920px |
| Error Handling | ✅ | User-friendly messages |

---

**Questions?** Check the relevant documentation file above.

**Ready to code?** Jump into `components/` or `lib/` directories.

**Need help?** See DEVELOPMENT.md for patterns and conventions.

**Happy coding! 🚀**
