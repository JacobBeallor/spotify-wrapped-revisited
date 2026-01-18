# Deployment Guide

Deploy your Spotify Wrapped dashboard to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Data synced to Vercel Postgres
- Code pushed to GitHub repository

---

## Initial Deployment

### Step 1: Set Up Vercel Postgres

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Navigate to Storage tab

2. **Create Postgres Database**
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., "spotify-wrapped-db")
   - Select region closest to users

3. **Connect to Project**
   - Select your project
   - Enable for: **Production** and **Preview** environments
   - Copy `POSTGRES_URL` (automatically set as env var)

### Step 2: Sync Data to Postgres

```bash
# Set Postgres URL from Vercel dashboard
export POSTGRES_URL="postgres://..."

# Sync data
source venv/bin/activate
python scripts/sync_to_postgres.py
```

**Output:**
```
Syncing DuckDB → Vercel Postgres
✓ plays synced: 77,800 rows in 1.0s
✓ tracks synced: 5,234 rows in 0.2s
✓ artists synced: 1,892 rows in 0.1s
SYNC COMPLETE ✓
```

### Step 3: Deploy to Vercel

1. **Connect GitHub Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Select the repo: `spotify-wrapped-revisited`

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Environment Variables**
   - Postgres URL is automatically injected
   - No manual env vars needed (unless using enrichment)

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Get your live URL: `https://your-app.vercel.app`

---

## Continuous Deployment

**Automatic deployments on every push:**

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Updates live URL
```

**Branch previews:**
- Every branch gets a preview URL
- Test changes before merging
- Preview URL: `https://your-app-branch.vercel.app`

---

## Updating Data

### Process

```bash
# 1. Add new Spotify JSON files to data_raw/
cp ~/Downloads/Streaming_History*.json data_raw/

# 2. Re-run ingestion locally
./scripts/run_pipeline.sh

# 3. (Optional) Re-run enrichment
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
python scripts/enrich_metadata.py

# 4. Sync to Vercel Postgres
export POSTGRES_URL="postgres://..."
python scripts/sync_to_postgres.py

# 5. Verify locally
npm run dev
# Test at http://localhost:3000

# 6. Deploy
git add data_raw/  # If committing raw data
git commit -m "Update listening data to $(date +%Y-%m)"
git push origin main

# Vercel auto-deploys
```

**Note:** You don't need to commit `data_raw/` - it's gitignored. Only commit if you want to version control your raw data.

---

## Environment Variables

### Production

Set in Vercel Dashboard → Project → Settings → Environment Variables:

**Automatically set:**
- `POSTGRES_URL` - Set when connecting database
- `VERCEL` - Set to `"1"` by Vercel
- `NODE_ENV` - Set to `"production"` by Vercel

**Optional (for enrichment features):**
- `SPOTIFY_CLIENT_ID` - Your Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Your Spotify app secret

**To add:**
1. Go to project settings
2. Click "Environment Variables"
3. Add variable name and value
4. Select environments (Production, Preview, Development)
5. Save

### Local vs Production

| Environment | Database | Config |
|-------------|----------|--------|
| Local dev | DuckDB | No .env.local needed |
| Vercel | Postgres | Auto-configured |

---

## Vercel Configuration

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Settings:**
- `regions`: Deploy to US East (iad1) - change if needed
- `memory`: 1024 MB for API routes (default)
- `maxDuration`: 10 seconds timeout

### `next.config.js`

```javascript
module.exports = {
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('duckdb-async')
    }
    return config
  }
}
```

**Key settings:**
- `unoptimized: true` - No image optimization (faster builds)
- Webpack externals - Exclude DuckDB from server bundle

---

## Performance

### Build Times
- Initial build: 30-60 seconds
- Subsequent builds: 15-30 seconds

### Cold Starts
- First request: ~1-2 seconds
- Subsequent requests: ~50-200ms
- Vercel keeps functions warm with traffic

### Database Performance
- Queries: 50-150ms (includes network)
- Vercel Postgres is globally distributed
- Add caching to reduce queries

### Optimization Tips

**1. Add Response Caching:**
```typescript
// app/api/summary/route.ts
export const revalidate = 300  // Cache 5 minutes

export async function GET() {
  // Query only runs every 5 minutes
  const data = await executeQuery(...)
  return NextResponse.json(data)
}
```

**2. Reduce API Calls:**
- Fetch multiple data sources in parallel
- Combine related queries
- Use React Query for client-side caching

**3. Optimize Queries:**
- Add indexes for frequently queried columns
- Use LIMIT on large result sets
- Avoid SELECT * - specify columns

---

## Monitoring

### Vercel Analytics

**View in dashboard:**
- Page views
- Unique visitors
- Top pages
- Load times

**Enable:**
1. Go to project settings
2. Click "Analytics"
3. Enable Web Analytics

### Database Usage

**Vercel Postgres Dashboard:**
- Operations count (60k/month free)
- Storage used (512 MB free)
- Data transfer

**Check quota:**
1. Go to Storage tab
2. Select your database
3. View "Usage" section

**If hitting limits:**
- Add response caching (reduces operations)
- Upgrade to Pro tier ($20/month)
- See [Database Architecture](../architecture/database.md)

### Logs

**View logs:**
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs https://your-app.vercel.app
```

**Or in dashboard:**
- Go to project
- Click "Logs" tab
- Filter by time/severity

---

## Custom Domain

### Add Custom Domain

1. **Buy domain** (e.g., from Namecheap, Google Domains)

2. **Add to Vercel:**
   - Go to project settings
   - Click "Domains"
   - Add your domain
   - Follow DNS instructions

3. **Configure DNS:**
   - Add A record pointing to Vercel
   - Or add CNAME to `cname.vercel-dns.com`

4. **Wait for SSL:**
   - Vercel auto-provisions SSL certificate
   - Takes 10-60 minutes

**Example:**
- Your domain: `spotify.yourdomain.com`
- Vercel provides: `https://spotify.yourdomain.com`
- Auto SSL + CDN

---

## Troubleshooting

### Build Errors

**"No Next.js version detected"**
- Check `package.json` has "next" in dependencies
- Verify root directory setting in Vercel

**"Module parse failed" or webpack errors**
- Check `next.config.js` has webpack externals
- Clear cache: Settings → General → Clear Build Cache

**"POSTGRES_URL not found"**
- Verify Postgres database is connected to project
- Check Environment Variables in settings

### Runtime Errors

**"Database connection failed"**
- Check Postgres database is running
- Verify POSTGRES_URL is correct
- Check Vercel logs for details

**API routes return 500**
- Check Vercel logs for error details
- Verify queries are Postgres-compatible (not DuckDB-specific)
- Check data exists in Postgres tables

**Slow queries**
- Add indexes for filtered columns
- Add response caching
- Check query complexity

### Quota Issues

**"Operations limit exceeded"**
- Enable response caching on API routes
- Check .env.local is deleted locally (shouldn't hit prod DB)
- Consider upgrading to Pro tier

---

## Rollback

**If deployment breaks:**

1. **Via Dashboard:**
   - Go to Deployments tab
   - Find last working deployment
   - Click "Promote to Production"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Via Vercel CLI:**
   ```bash
   vercel rollback
   ```

---

## Best Practices

✅ **Test locally first** - Always run `npm run build` before pushing

✅ **Use preview deployments** - Test on branch before merging to main

✅ **Monitor quota** - Check Vercel Postgres usage regularly

✅ **Add caching** - Reduce database operations with revalidate

✅ **Keep data synced** - Re-sync after updating local data

✅ **Version control** - Use git tags for releases

✅ **Monitor logs** - Check for errors after deployment

---

## See Also

- [Database Architecture](../architecture/database.md) - Understanding the database
- [Local Development](./local-development.md) - Testing before deploy
- [Updating Data](./updating-data.md) - Data refresh workflow

