# 📚 Documentation Structure

## Overview

This document provides a map of all documentation in the project and when to use each guide.

## 📂 Structure

```
docs/
├── README.md                          # Documentation index (start here)
├── getting-started.md                 # First-time setup (5 minutes)
│
├── guides/                           # Step-by-step how-to guides
│   ├── local-development.md          # Development workflow
│   ├── updating-data.md              # Add new Spotify exports
│   ├── enrichment.md                 # Full enrichment guide (detailed)
│   ├── enrichment-quickstart.md      # Fast enrichment setup (quick)
│   └── deployment.md                 # Deploy to Vercel
│
├── architecture/                     # Technical architecture docs
│   ├── navigation.md                 # Tab navigation & filter state
│   ├── database.md                   # DuckDB + Postgres design
│   ├── data-pipeline.md              # Ingestion & enrichment flow
│   └── api-routes.md                 # API endpoint reference
│
└── archive/                          # Historical implementation notes
    ├── ARTIST_EVOLUTION.md           # Bump chart feature
    ├── MIGRATION.md                  # Server-side migration
    ├── SESSION_3_SUMMARY.md          # Polish & production
    └── TIMEZONE.md                   # UTC conversion
```

## 🎯 When to Use Each Guide

### Getting Started

**New to the project?**
1. **[getting-started.md](./getting-started.md)** - Your first stop
2. **[guides/local-development.md](./guides/local-development.md)** - Run locally
3. **[guides/deployment.md](./guides/deployment.md)** - Deploy to production

### Regular Operations

**Adding new data?**
- **[guides/updating-data.md](./guides/updating-data.md)** - Update workflow

**Want enriched metadata (genres, release years)?**
- **Quick path:** [guides/enrichment-quickstart.md](./guides/enrichment-quickstart.md) (5 min setup)
- **Complete guide:** [guides/enrichment.md](./guides/enrichment.md) (full details)

### Understanding the System

**How does it work?**
- **[architecture/navigation.md](./architecture/navigation.md)** - Navigation & filters
- **[architecture/database.md](./architecture/database.md)** - Database design
- **[architecture/data-pipeline.md](./architecture/data-pipeline.md)** - Data flow
- **[architecture/api-routes.md](./architecture/api-routes.md)** - API reference

### Development

**Building features?**
- **[guides/local-development.md](./guides/local-development.md)** - Dev workflow
- **[architecture/*](./architecture/)** - System architecture
- **[../types.ts](../types.ts)** - TypeScript types

## 📖 Guide Comparison

### Enrichment Guides

| Guide | Length | Audience | When to Use |
|-------|--------|----------|-------------|
| **[enrichment-quickstart.md](./guides/enrichment-quickstart.md)** | Short (5 min) | First-time users | Just want to get started quickly |
| **[enrichment.md](./guides/enrichment.md)** | Complete (15 min) | All users | Need details, troubleshooting, or reference |

**Recommendation:** Start with quickstart, reference full guide if needed.

## 🗂️ Document Types

### 1. **Guides** (`guides/`)
- **Purpose:** Step-by-step instructions
- **Audience:** Users performing tasks
- **Style:** Task-oriented, procedural
- **Examples:** Setup, deployment, updates

### 2. **Architecture** (`architecture/`)
- **Purpose:** System design & technical details
- **Audience:** Developers, contributors
- **Style:** Explanatory, technical
- **Examples:** Database schema, API design, data flow

### 3. **Archive** (`archive/`)
- **Purpose:** Historical context & implementation notes
- **Audience:** Future maintainers, curious readers
- **Style:** Implementation logs, decisions made
- **Examples:** Feature implementations, migrations

## 🔍 Quick Reference

### Common Tasks

| Task | Document |
|------|----------|
| Initial setup | [getting-started.md](./getting-started.md) |
| Add new data | [guides/updating-data.md](./guides/updating-data.md) |
| Enable genres/years | [guides/enrichment-quickstart.md](./guides/enrichment-quickstart.md) |
| Deploy to Vercel | [guides/deployment.md](./guides/deployment.md) |
| Develop locally | [guides/local-development.md](./guides/local-development.md) |

### Technical Reference

| Topic | Document |
|-------|----------|
| Navigation & filters | [architecture/navigation.md](./architecture/navigation.md) |
| Database design | [architecture/database.md](./architecture/database.md) |
| Data pipeline | [architecture/data-pipeline.md](./architecture/data-pipeline.md) |
| API endpoints | [architecture/api-routes.md](./architecture/api-routes.md) |
| Type definitions | [../types.ts](../types.ts) |

## 🆕 Adding Documentation

When adding new docs:

1. **Choose the right location:**
   - User guides → `guides/`
   - Technical details → `architecture/`
   - Implementation notes → `archive/`

2. **Update indexes:**
   - Add link to `docs/README.md`
   - Add to main `README.md` if user-facing
   - Update this structure doc

3. **Follow naming conventions:**
   - Kebab-case: `my-guide.md` ✅
   - Not: `My Guide.md` ❌

4. **Link to related docs:**
   - Add "See also" section
   - Use relative paths
   - Keep links current

## 📊 Documentation Metrics

Current documentation:
- **Total docs:** 12 files
- **Guides:** 5 files (user-focused)
- **Architecture:** 4 files (technical)
- **Archive:** 4 files (historical)

**Coverage:**
- ✅ Getting started
- ✅ Local development
- ✅ Deployment
- ✅ Data updates
- ✅ Enrichment (quick & complete)
- ✅ Architecture reference
- ✅ API documentation

## 🎯 Future Documentation

Potential additions:
- [ ] Performance optimization guide
- [ ] Custom visualization guide
- [ ] Backup & restore guide
- [ ] Multi-user deployment guide
- [ ] Testing guide

## 📞 Getting Help

**Can't find what you need?**

1. Check [README.md](./README.md) - documentation index
2. Browse [guides/](./guides/) - task-oriented help
3. Review [architecture/](./architecture/) - technical details
4. Search project [TODO.md](../TODO.md) - planned features

---

**Last updated:** January 2026

