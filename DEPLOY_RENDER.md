# Deploy to Render - Quick Commands

## Prerequisites
- GitHub account with repo pushed
- Render account (render.com)

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Virtual Jewellery Try-On - Production Ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/virtual_try_on.git
git push -u origin main
```

## Step 2: Deploy on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Fill in:
   - **Name:** virtual-jewellery-tryon
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click "Deploy Web Service"

## Alternative: Using Render CLI

```bash
# Install Render CLI
npm install -g @render-web/cli

# Login
render login

# Create render.yaml in project root
cat > render.yaml << 'EOF'
services:
  - type: web
    name: virtual-jewellery-tryon
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
EOF

# Deploy
render deploy
```

## Step 3: Environment Variables (if needed)

In Render Dashboard:
- Settings → Environment
- Add any required variables (usually none for this app)

## Step 4: Verify Deployment

```bash
# After deployment completes, your app will be live at:
# https://virtual-jewellery-tryon.onrender.com
```

## Automatic Deploys

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update description"
git push origin main
# Render detects push and redeploys automatically
```

## Troubleshooting

```bash
# View logs in Render Dashboard
# Settings → Logs

# Rebuild manually
# Settings → Manual Deploy → Deploy latest commit
```

## Performance Tips

For better performance on Render's free tier:
- Keep bundle size small ✓ (already optimized)
- Use lazy loading ✓ (already implemented)
- Enable caching in next.config.js ✓

## That's it! 🚀

Your app is now live and accessible worldwide.
