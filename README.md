# Venue Ops AI

AI-powered venue operations management system with natural language interfaces.

## Features

- **Worker App**: Simple, voice-first interface for field workers
- **Manager Dashboard**: AI command center with natural language queries
- **AI-Native Design**: Built from the ground up with AI at its core

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **AI Models**: 
  - Google Vertex AI (Gemini) for visual recognition
  - Deepgram for voice-to-text
- **Database**: PostgreSQL with JSONB for flexible data storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then fill in your configuration values.

4. Set up the database:
   ```bash
   psql -d your_database_url -f db/venue-ops-schema.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to see the landing page
7. Navigate to [http://localhost:3000/venue-ops](http://localhost:3000/venue-ops) to see the demo

## Project Structure

```
venue-ops-ai/
├── app/
│   ├── page.tsx           # Landing page
│   └── venue-ops/
│       └── page.tsx        # Demo page with role switcher
├── components/
│   ├── ui/                # shadcn/ui components
│   └── venue-ops/
│       ├── WorkerDashboard.tsx   # Worker interface
│       └── ManagerDashboard.tsx  # Manager interface
├── db/
│   └── venue-ops-schema.sql     # Database schema
└── lib/
    └── utils.ts           # Utility functions
```

## Database Schema

The system uses two main tables:

- **tasks**: Core task management with AI capabilities
- **events**: Atomic operation logging for audit trails

Both tables support:
- AI-detected issues with confidence scores
- Flexible JSONB storage for task-specific data
- Full audit trails with automatic status change tracking

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT