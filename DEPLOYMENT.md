# LexiLog Deployment Guide

## Quick Deploy Options

### 🚀 Option 1: Vercel (Recommended - 2 minutes)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? → No
   - Project name → lexilog-vocabulary
   - Directory → ./ (current directory)

4. **Your site will be live at:** `https://lexilog-vocabulary.vercel.app`

### 🌐 Option 2: Netlify (Drag & Drop)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your entire project folder
3. Wait for deployment
4. Get your live URL

### 📚 Option 3: GitHub Pages

1. **Create GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lexilog.git
   git push -u origin main
   ```

2. **Enable Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Save

3. **Your site will be at:** `https://YOUR_USERNAME.github.io/lexilog`

## File Structure for Deployment

```
lexilog/
├── index.html          # Main app
├── index-demo.html     # Demo version
├── app.js             # Main JavaScript
├── app-demo.js        # Demo JavaScript
├── styles.css         # Styling
├── vercel.json        # Vercel config
├── README.md          # Documentation
└── DEPLOYMENT.md      # This file
```

## Custom Domain (Optional)

### Vercel:
1. Go to project dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records

### Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Update DNS records

## Environment Variables (if needed)

If you want to use Firebase in production:

1. **Vercel:**
   - Project dashboard → Settings → Environment Variables
   - Add Firebase config variables

2. **Netlify:**
   - Site settings → Environment variables
   - Add Firebase config variables

## Testing Your Deployment

1. **Test main version:** `your-domain.com/`
2. **Test demo version:** `your-domain.com/demo`
3. **Test features:**
   - Name input
   - Language selection
   - Word search
   - Voice search
   - Word saving

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - The app uses external APIs, but they should work fine
   - If issues occur, check browser console

2. **Firebase Not Working:**
   - Demo version works without Firebase
   - For full version, configure Firebase properly

3. **Voice Search Not Working:**
   - Requires HTTPS (all deployment options provide this)
   - Check microphone permissions

## Performance Optimization

Your site is already optimized:
- ✅ Static files (fast loading)
- ✅ CDN delivery (Vercel/Netlify)
- ✅ Minimal dependencies
- ✅ Responsive design

## Analytics (Optional)

Add Google Analytics:
1. Get tracking ID from Google Analytics
2. Add to HTML head section
3. Track user engagement

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all files are uploaded
3. Test on different browsers
4. Check deployment platform status

---

**Your LexiLog vocabulary builder is ready to go live! 🎉**
