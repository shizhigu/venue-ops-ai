# Venue Ops AI

> AI-powered venue operations platform replacing walkie-talkies with conversation-driven task management via LangGraph and voice input.

## What is this?

Venue Ops AI is a full-stack operations platform for stadiums, convention centers, and concert halls with two distinct interfaces. Field workers use a voice-first, camera-first mobile app to report issues (snap photos, record voice memos, let AI analyze and classify). Managers use an AI Deputy chat interface where natural language commands like "Show me urgent tasks in Zone B" or "Assign the plumbing issue to Wang" are interpreted and executed against real database operations.

## Why?

I watched venue operations managers drown in radio chatter during events -- the gap between "someone found a problem" and "the right person is fixing it" was measured in tens of minutes when it should be seconds. Every existing tool I evaluated was a glorified ticket system that digitized paperwork but added no intelligence.

## How it works

The system implements a dual-layer AI architecture with human-in-the-loop controls at every critical decision point:

1. **Worker Capture Flow**: Photos and voice memos enter a LangGraph StateGraph pipeline (capture -> analysis -> conditional routing). Claude 3.5 Sonnet via OpenRouter produces structured JSON analysis with issue type, priority, confidence score, suggested tools, and estimated resolution time.
2. **Two-Step Task Creation**: AI analysis is returned to the worker for review before any database record is created. Only after human confirmation does the system persist the task and trigger notifications.
3. **AI Deputy (Manager)**: A LangGraph ReAct agent with 5 registered tools (`get_pending_tasks`, `get_task_details`, `assign_task_to_worker`, `get_venue_statistics`, `escalate_to_emergency`) maintains persistent conversation memory per thread via InMemorySaver checkpointing.
4. **Dual-Layer Conversations**: A Main Deputy Context maintains the global venue view while isolated Task Contexts let managers drill into specific issues without losing the bigger picture.
5. **Smart Assignment**: Workers are scored using a weighted multi-factor model -- skill match (30%), location proximity (30%), current workload (20%), and historical performance (20%).
6. **Event-Driven Audit Trail**: PostgreSQL triggers automatically generate `task_status_changed` events on every status update, ensuring complete audit coverage at the database level.

## Key Technical Highlights

- **LangGraph StateGraph + ReAct Agent**: Deterministic multi-step workflows with conditional routing for task processing, plus a tool-calling conversation agent for the manager interface -- both with checkpointed memory.
- **Human-in-the-Loop at Three Levels**: Workers confirm AI analysis before task creation, managers approve high-priority assignments, and emergency escalations require explicit acknowledgment.
- **Multi-Tenant Data Isolation**: Every query is scoped by `venue_id` resolved from Clerk organization membership, with PostgreSQL foreign keys and ON DELETE CASCADE enforcing tenant boundaries at the data layer.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| AI Orchestration | LangGraph (StateGraph + ReAct agent) |
| LLM | Claude 3.5 Sonnet via OpenRouter |
| Voice-to-Text | Deepgram (Nova-2) |
| Streaming Chat | Vercel AI SDK (`useChat`) |
| Auth | Clerk (org-based multi-tenancy) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (Neon) + JSONB + GIN indexes |
| Infrastructure | Docker Compose (app + Redis + Postgres) |

## Quick Start

```bash
git clone https://github.com/gushizhi/venue-ops-ai.git
cd venue-ops-ai
cp .env.local.example .env.local   # Add Clerk, OpenRouter, Deepgram, Neon keys
npm install
docker compose up -d               # Start Redis + Postgres
psql "$DATABASE_URL" < db/venue-ops-schema.sql
npm run dev                        # Frontend on localhost:3000
```

## License

MIT
