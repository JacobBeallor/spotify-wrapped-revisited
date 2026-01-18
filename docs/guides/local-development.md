# Local Development Guide

Complete guide for working on Spotify Wrapped 2.0 locally.

## Development Setup

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/JacobBeallor/spotify-wrapped-revisited.git
cd spotify-wrapped-revisited

# Install dependencies
npm install

# Set up Python environment
./scripts/setup_venv.sh

# Ingest data
./scripts/run_pipeline.sh
```

---

## Database Configuration

### Local Development Uses DuckDB

**By default**, local development uses DuckDB automatically:
- No configuration needed
- Fast queries (1-10ms)
- No network calls
- No Vercel Postgres quota usage

**How it works:**
- `app/api/db.ts` detects environment
- No `POSTGRES_URL` = uses `data/spotify.duckdb`
- Fast, free, offline

### Testing with Postgres Locally (Optional)

If you need to test against Postgres:

```bash
# Create .env.local
echo "POSTGRES_URL=postgres://localhost:5432/spotify" > .env.local

# Restart dev server
npm run dev

# Delete .env.local when done
rm .env.local
```

**Why you might need this:**
- Testing Postgres-specific queries
- Debugging production issues
- Comparing performance

**Remember:** Delete `.env.local` after testing to avoid hitting Vercel quota!

---

## Development Workflow

### Starting Development

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
```

**Hot reload enabled:**
- Frontend changes reload instantly
- API route changes reload on request
- No restart needed

### Common Tasks

#### **Update Dashboard Code**
1. Edit files in `app/`, `components/`
2. Save - auto-reloads
3. Test in browser

#### **Add New API Endpoint**
```bash
# Create route file
mkdir -p app/api/your-endpoint
touch app/api/your-endpoint/route.ts

# Add query logic
# See docs/architecture/api-routes.md
```

#### **Modify Database Schema**
```bash
# 1. Edit scripts/ingest_spotify.py
# 2. Re-run ingestion
./scripts/run_pipeline.sh

# 3. Restart dev server
npm run dev
```

#### **Add New Visualization**
```bash
# 1. Create component
touch components/YourChart.tsx

# 2. Import in app/page.tsx
# 3. Fetch data with useApiData hook
```

---

## Project Structure

```
spotify-wrapped-revisited/
├── app/
│   ├── api/              # API routes (backend)
│   │   ├── db.ts        # Database connection
│   │   └── */route.ts   # Individual endpoints
│   ├── hooks/           # React hooks
│   │   └── useSpotifyData.ts
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard
├── components/          # React components
│   ├── Header.tsx
│   ├── KPICards.tsx
│   ├── MonthlyChart.tsx
│   └── ...
├── scripts/             # Python data pipeline
├── data/                # DuckDB (gitignored)
├── data_raw/            # Spotify JSON (gitignored)
└── types.ts             # TypeScript types
```

---

## Making Changes

### Frontend Changes

**Components:**
```typescript
// components/YourComponent.tsx
export function YourComponent() {
  const { data, loading } = useApiData<YourType>('your-endpoint')
  
  if (loading) return <LoadingSpinner />
  
  return <div>{/* your UI */}</div>
}
```

**Styling:**
- Uses Tailwind CSS
- Global styles in `app/globals.css`
- Component styles inline with className

**State management:**
- React hooks (useState, useEffect)
- Custom `useApiData` hook for API calls
- No external state library needed

### Backend Changes

**Adding an API endpoint:**

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '../db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const param = searchParams.get('param')
  
  const results = await executeQuery(`
    SELECT * FROM plays WHERE year = ?
  `, [param])
  
  return NextResponse.json({ data: results })
}
```

**Testing:**
```bash
curl http://localhost:3000/api/your-endpoint?param=2024
```

### Database Changes

**Modifying schema:**
1. Edit `scripts/ingest_spotify.py`
2. Update CREATE TABLE statements
3. Re-run pipeline: `./scripts/run_pipeline.sh`

**Adding derived columns:**
```python
# In ingest_spotify.py
con.execute("""
  ALTER TABLE plays ADD COLUMN your_column TYPE
""")
```

---

## Testing

### Manual Testing

```bash
# Test API endpoints
curl http://localhost:3000/api/summary | jq
curl http://localhost:3000/api/top-artists?limit=5 | jq

# Test frontend
npm run dev
# Open browser, test interactions
```

### Build Testing

```bash
# Test production build
npm run build

# Check for errors
npm run lint
```

---

## Debugging

### Frontend Debugging

**Browser DevTools:**
- Open Network tab to see API calls
- Check Console for errors
- Use React DevTools extension

**Common issues:**
- `data is undefined` → Check loading state
- API returns 500 → Check terminal for server errors
- Chart not rendering → Check data format

### Backend Debugging

**API route errors:**
```typescript
// Add logging
console.log('Query params:', searchParams)
console.log('Query result:', results)

// Check terminal output
```

**Database errors:**
```bash
# Check DuckDB file exists
ls -lh data/spotify.duckdb

# Test query manually
python3 -c "import duckdb; con = duckdb.connect('data/spotify.duckdb'); print(con.execute('SELECT COUNT(*) FROM plays').fetchone())"
```

---

## Code Style

### TypeScript

```typescript
// Use types
interface YourType {
  field: string
  count: number
}

// Async/await over promises
async function fetchData(): Promise<YourType[]> {
  const data = await fetch('/api/endpoint')
  return data.json()
}
```

### React Components

```typescript
// Functional components
export function Component({ prop }: { prop: string }) {
  return <div>{prop}</div>
}

// Use hooks
const [state, setState] = useState(initial)
useEffect(() => { /* side effect */ }, [deps])
```

### Python

```python
# Follow PEP 8
def function_name(param):
    """Docstring."""
    result = do_something(param)
    return result
```

---

## Environment Variables

**Local development:**
```bash
# .env.local (optional)
POSTGRES_URL=...  # Only if testing with Postgres

# For enrichment scripts
export SPOTIFY_CLIENT_ID=...
export SPOTIFY_CLIENT_SECRET=...
```

**Production (Vercel):**
- Set in Vercel dashboard
- Auto-injected into environment
- Never commit to git

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature-name

# Make changes
git add .
git commit -m "Description"

# Push to GitHub
git push origin feature-name

# Create PR on GitHub
```

**Commit messages:**
- Use present tense: "Add feature" not "Added feature"
- Be descriptive: "Fix timezone conversion bug in ingestion"
- Reference issues: "Fix #123: Handle missing track URIs"

---

## Performance Tips

### Frontend

- Use `React.memo()` for expensive components
- Lazy load large visualizations
- Debounce search/filter inputs

### Backend

- Add indexes for frequently queried columns
- Limit result sets with LIMIT clause
- Cache responses with `revalidate`

### Database

- DuckDB is already fast for analytics
- Keep queries simple
- Use COUNT(*) not COUNT(column)

---

## Troubleshooting

### "Module not found: duckdb"
```bash
source venv/bin/activate
pip install duckdb
```

### "Port 3000 already in use"
```bash
# Kill existing process
pkill -f "next dev"

# Or use different port
npm run dev -- -p 3001
```

### "Cannot find module './db'"
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Hitting Vercel Postgres quota
```bash
# Delete .env.local
rm -f .env.local

# Confirm using DuckDB
# Should see fast query times (< 10ms)
```

---

## See Also

- [Getting Started](../getting-started.md) - Initial setup
- [API Routes](../architecture/api-routes.md) - Backend documentation
- [Database Architecture](../architecture/database.md) - Schema details
- [Deployment Guide](./deployment.md) - Publishing changes

