# Quick Start: Spotify API Enrichment

## 📋 Prerequisites Checklist

- [ ] Spotify Developer account created
- [ ] App created in Spotify Dashboard
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Credentials added to `.env` file

---

## 🚀 Step-by-Step Instructions

### 1. Get Spotify API Credentials (5 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - Name: "Spotify Wrapped Personal"
   - Description: "Personal analytics"
   - Redirect URI: `http://localhost:3000`
   - Check "Web API"
4. Click "Settings" → Copy **Client ID** and **Client Secret**

### 2. Add Credentials (2 minutes)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit the `.env` file:

```bash
code .env
```

Add your actual credentials (lines 23-24):

```bash
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
```

**IMPORTANT:** Never commit the `.env` file! It's already in `.gitignore`.

### 3. Run Enrichment (~1-2 hours)

```bash
./scripts/run_enrichment.sh
```

**What happens:**
- ✅ Validates your credentials
- ✅ Enriches 19,418 tracks (~6.5 minutes)
- ✅ Enriches 5,776 artists (~96 minutes)
- ✅ Shows progress every 100 items
- ✅ Saves data incrementally (safe to cancel and resume)

**You can:**
- ✅ Run it overnight
- ✅ Cancel (Ctrl+C) and resume later
- ✅ Re-run anytime (only processes new items)

### 4. Verify Data

After enrichment completes:

```bash
source venv/bin/activate

python -c "
import duckdb
con = duckdb.connect('data/spotify.duckdb')

# Check tracks
track = con.execute('''
  SELECT track_name, release_year, release_decade, popularity 
  FROM tracks 
  LIMIT 1
''').fetchone()
print(f'Sample track: {track[0]}')
print(f'  Released: {track[1]} ({track[2]})')
print(f'  Popularity: {track[3]}')

# Check artists
artist = con.execute('''
  SELECT artist_name, genres, popularity 
  FROM artists 
  WHERE genres IS NOT NULL
  LIMIT 1
''').fetchone()
print(f'\nSample artist: {artist[0]}')
print(f'  Genres: {artist[1]}')
print(f'  Popularity: {artist[2]}')
"
```

### 5. Test Locally

Start the dev server and check the new features:

```bash
npm run dev
```

Visit http://localhost:3000

**New features available:**
- Genre analysis
- Release year/decade insights
- Popularity data

### 6. Deploy to Production

Sync to Vercel Postgres and deploy:

```bash
# Sync enriched data
python scripts/sync_to_postgres.py

# Commit and push
git add .
git commit -m "Add enriched Spotify metadata"
git push origin main
```

Vercel will automatically deploy your updated data!

---

## ⚡ Quick Commands Reference

```bash
# Check enrichment status
source venv/bin/activate && python -c "import duckdb; con = duckdb.connect('data/spotify.duckdb'); print('Tracks:', con.execute('SELECT COUNT(*) FROM tracks').fetchone()[0]); print('Artists:', con.execute('SELECT COUNT(*) FROM artists').fetchone()[0])"

# Run enrichment
./scripts/run_enrichment.sh

# Test locally
npm run dev

# Sync to production
python scripts/sync_to_postgres.py

# Deploy
git push origin main
```

---

## ⏱️ Time Estimates

**Your dataset:**
- 77,800 total plays
- 19,418 unique tracks → ~6.5 minutes
- 5,776 unique artists → ~96 minutes
- **Total: ~102 minutes (1 hour 42 minutes)**

**On subsequent runs:**
- Only new tracks/artists are enriched
- Much faster (usually < 5 minutes)

---

## 🔧 Troubleshooting

### "Missing Spotify credentials"

Check if credentials are set in `.env`:
```bash
cat .env | grep SPOTIFY
```

Should show your client ID and secret. If not found, make sure you've created `.env` from `.env.example`.

### "Rate limit exceeded"

Don't worry! The script automatically:
- Retries with exponential backoff
- Waits and continues
- You don't need to do anything

### Takes too long

Options:
1. **Run overnight:** Let it complete while you sleep
2. **Run in background:** `nohup ./scripts/run_enrichment.sh > enrichment.log 2>&1 &`
3. **Cancel and resume:** Press Ctrl+C, run again later (progress is saved)

### Artist not found

Some artists may not be found (rare):
- Misspelled names in your data
- Artist removed from Spotify
- Script logs warning and continues
- Not a problem!

---

## 📊 What Gets Enriched

### Tracks Table
- Release date, year, decade
- Album name
- Popularity (0-100)
- Duration
- Explicit flag

### Artists Table
- Genres (comma-separated)
- Popularity (0-100)
- Follower count
- Spotify artist ID

### New API Endpoints
- `/api/genres` - Genre distribution
- `/api/release-years?groupBy=decade` - Decade analysis

---

## 🎯 Next Steps After Enrichment

1. ✅ Test locally to see new features
2. ✅ Verify data looks correct
3. ✅ Sync to Postgres
4. ✅ Deploy to production
5. ✅ Enjoy your enriched analytics!

---

## 📚 More Information

- **[Full Enrichment Guide](./enrichment.md)** - Detailed guide with troubleshooting
- **[Spotify API Documentation](https://developer.spotify.com/documentation/web-api)** - Official API reference
- **[Project Documentation](../README.md)** - Complete docs index
- **[Data Pipeline Architecture](../architecture/data-pipeline.md)** - How enrichment fits in

