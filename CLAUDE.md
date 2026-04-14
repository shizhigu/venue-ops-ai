# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Venue Ops AI is an AI-powered venue operations management system with natural language interfaces, built with Next.js 15 and TypeScript.

## Development Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production with Turbopack
npm start          # Start production server
npm run lint       # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (located in `components/ui/`)
- **Database**: PostgreSQL with JSONB for flexible data storage

### Key Architectural Patterns

1. **Component Structure**: 
   - UI components from shadcn/ui are in `components/ui/`
   - Feature components (WorkerDashboard, ManagerDashboard) are in `components/venue-ops/`
   - Components use React Server Components by default

2. **Database Design**:
   - Two main tables: `tasks` and `events`
   - Uses PostgreSQL enums for `task_status` and `task_priority`
   - JSONB columns for flexible AI analysis and task data storage
   - Automatic event logging via database triggers for audit trails

3. **Path Aliases**: 
   - `@/*` maps to the root directory
   - Use `@/components`, `@/lib`, etc. for imports

### AI Integration Points

The system is designed for AI integration with:
- AI-detected issues tracking (`ai_detected`, `ai_confidence`, `ai_analysis` fields)
- Natural language interfaces for workers and managers
- Planned integrations: Google Vertex AI (Gemini) for visual recognition, Deepgram for voice-to-text

## Database Setup

```bash
psql -d your_database_url -f db/venue-ops-schema.sql
```

The schema includes:
- Tasks table with AI detection capabilities
- Events table for atomic operation logging
- Automatic triggers for status change tracking
- Referenced tables needed: `staff`, `organizations`