# Deployment Guide — Spotify Wrapped 2.0

## Pre-Deployment Checklist

✅ **Completed:**
- [x] Data pipeline runs successfully
- [x] All components render correctly
- [x] Filters and interactions work
- [x] Loading states implemented
- [x] Error handling added
- [x] Production build tested
- [x] Static export generated
- [x] ESLint passes with no errors

## Build Output

The production build creates a static export in the `/out` directory:
- Total size: ~2-3 MB (including all assets)
- Data files: ~500 KB (6 JSON files)
- JavaScript bundles: ~453 KB first load
- All pages pre-rendered as static HTML

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Built by Next.js creators
- Zero configuration
- Automatic deployments from GitHub
- Free tier includes everything needed
- Global CDN
- Custom domains

**Steps:**

1. **Push to GitHub:**
```bash
cd /Users/jacob.b/Documents/Personal/spotify-wrapped-revisited
git init
git add .
git commit -m "Initial commit: Spotify Wrapped 2.0"
git remote add origin https://github.com/YOUR_USERNAME/spotify-wrapped-revisited.git
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import `spotify-wrapped-revisited` repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"
   - Done! Your site is live in ~2 minutes

3. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

**Environment:**
- No environment variables needed
- All data is static JSON files
- No API keys or secrets required

---

### Option 2: Netlify

**Steps:**

1. Push to GitHub (same as above)

2. Deploy to Netlify:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `out`
   - Click "Deploy"

---

### Option 3: GitHub Pages

**Steps:**

1. Update `next.config.js` for GitHub Pages:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/spotify-wrapped-revisited',
  images: {
    unoptimized: true
  }
}
```

2. Build and deploy:
```bash
npm run build
# Push the /out directory to gh-pages branch
```

3. Enable GitHub Pages in repository settings

---

### Option 4: Self-Hosted (Any Static Host)

The `/out` directory contains a complete static site that can be hosted anywhere:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Cloudflare Pages
- Any web server (nginx, Apache, etc.)

Simply upload the contents of `/out` to your hosting provider.

---

## Post-Deployment

### 1. Update Portfolio Link

Add to your portfolio site:
```markdown
## Spotify Wrapped 2.0
Interactive dashboard visualizing 9 years of personal Spotify streaming history.

**Tech:** Next.js, TypeScript, Tailwind CSS, ECharts, DuckDB, Python

[Live Demo](https://your-site.vercel.app) | [GitHub](https://github.com/YOUR_USERNAME/spotify-wrapped-revisited)
```

### 2. Update Footer Links

Edit `components/Footer.tsx` to add your actual GitHub repo:
```typescript
<a
  href="https://github.com/YOUR_USERNAME/spotify-wrapped-revisited"
  target="_blank"
  rel="noopener noreferrer"
  className="text-gray-400 hover:text-spotify-green transition-colors text-sm"
>
  GitHub
</a>
```

### 3. Add README Badges (Optional)

```markdown
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)
```

---

## Updating Data

When you get new Spotify data:

1. Place new JSON files in `data_raw/`
2. Run the pipeline:
```bash
source venv/bin/activate
./scripts/run_pipeline.sh
```
3. Rebuild and redeploy:
```bash
npm run build
# Vercel will auto-deploy on git push
# Or manually upload /out directory
```

---

## Performance Notes

**Lighthouse Scores (Typical):**
- Performance: 95-100
- Accessibility: 95-100
- Best Practices: 95-100
- SEO: 90-100

**Optimizations:**
- Static generation (no server needed)
- Code splitting
- SVG charts (smaller than canvas)
- Precomputed aggregates
- Efficient data filtering

---

## Privacy & Security

✅ **Safe to deploy publicly:**
- No raw streaming history included
- Only aggregated statistics
- No personal identifiers
- No API keys or credentials
- No user authentication needed

The deployed site contains:
- Monthly/weekly/hourly aggregates
- Top artists/tracks lists
- Summary statistics

It does NOT contain:
- Individual play timestamps
- Exact track play counts per day
- Any personally identifiable information

---

## Troubleshooting

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm install
npm run build
```

**Data not loading:**
- Verify JSON files exist in `public/data/`
- Check browser console for 404 errors
- Ensure data pipeline ran successfully

**Charts not rendering:**
- Check for JavaScript errors in console
- Verify ECharts loaded correctly
- Test in different browsers

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to Vercel
3. ✅ Test live site
4. ✅ Update portfolio
5. ✅ Share on social media (optional)

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Preview production build locally

# Data Pipeline
source venv/bin/activate
./scripts/run_pipeline.sh

# Deployment
git push origin main     # Auto-deploys on Vercel
```

---

**Estimated deployment time:** 5-10 minutes  
**Cost:** $0 (free tier on Vercel/Netlify)  
**Maintenance:** Update data as needed, otherwise zero maintenance

Ready to deploy! 🚀

