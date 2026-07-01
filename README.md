<div align="center">

# Venue Ops AI

**A conversational operations layer for large venues: field workers report issues by photo and voice, managers triage and dispatch them by chat.**

![Next.js 15](https://img.shields.io/badge/Next.js-15-black)
![React 19](https://img.shields.io/badge/React-19-149eca)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)
![LangGraph](https://img.shields.io/badge/LangGraph-agent-1c3c3c)

</div>

---

## What it is

Stadiums, convention centers, and concert halls still run day-of operations on walkie-talkies and spreadsheets. A worker finds a burst pipe, radios dispatch, and dispatch tries to find a free plumber who may not hear the call. The manager tracks a dozen issues at once with no view of priority or who is available.

Venue Ops AI has two interfaces over one operations database.

The worker app lets a field worker snap a photo, record a voice memo, and tag a location. The backend transcribes the audio, runs an AI analysis pass, and returns a draft issue (type, priority, suggested tools, time estimate). Nothing is written until the worker confirms.

The manager AI Deputy is a chat interface. Commands like "show me urgent tasks" or "assign the plumbing issue to Wang" are read by a tool-calling agent that runs the actual database operations and asks for confirmation before anything high-stakes.

It is a working prototype, not a production system. See [Status](#status).

## Agent design

The manager side is a tool-calling agent, not a single LLM call. The core is a LangGraph ReAct agent (`create_react_agent`) that decides which tools to call on each turn.

Five tools in `langgraph-service/app/agents/deputy_agent.py` run real queries against Postgres: `get_pending_tasks`, `get_task_details`, `assign_task_to_worker`, `get_venue_statistics`, `escalate_to_emergency`. Each returns a structured payload (a display message plus typed data and action buttons) so the chat UI can render task lists, details, or confirmations instead of plain text.

Memory comes from an `InMemorySaver` checkpointer keyed by `thread_id`. Main venue chat uses `venue:{venue_id}`; drilling into an issue opens a separate `venue:{venue_id}:task:{task_id}` thread. Each thread keeps its own history, so a follow-up like "assign the first one to Wang" resolves against the previous turn's tool output.

For the human in the loop, high-priority assignments (`priority >= 4`) and emergency escalations short-circuit: the tool returns a confirmation request with confirm/cancel buttons instead of executing. The confirm click re-invokes the tool with `require_confirmation=False`.

The agent also defaults to doing nothing unless asked. Casual messages ("hi", "thanks") are filtered so it stops treating every input as a database query. That guardrail lives in both the system prompt and the API layer (`app/api/deputy_v2.py`), not one or the other.

The worker capture side is a separate LangGraph `StateGraph` (`app/agents/task_graph.py`): a `capture` node processes images, voice, and location, an `analysis` node calls the model for structured JSON, and a conditional edge routes on the result (emergency and low-confidence cases go to manager review, high-confidence routine cases are marked auto-assignable). State is typed and checkpointed.

A third, lighter tool-calling agent runs inside the Next.js app (`app/api/chat/route.ts`) using the Vercel AI SDK `streamText` with `maxSteps: 3`, for streaming manager chat that queries Neon directly.

## Architecture

Two deployable services talking over REST.

| Layer | What it does | Stack |
|---|---|---|
| Frontend | Worker capture, manager dashboards, AI Deputy chat, auth, voice transcription. Acts as a BFF that adds Clerk auth before calling the backend. | Next.js 15, React 19, Tailwind, shadcn/ui |
| Backend | LangGraph graphs and the ReAct agent, tool execution, all database writes. | FastAPI, LangGraph, LangChain |
| Model | Analysis and conversation. | Claude 3.5 Sonnet via OpenRouter |
| Voice | Worker voice memos to text. | Deepgram Nova-2 |
| Data | Tasks in a JSONB column, append-only `events` audit log, Postgres triggers that log status changes automatically. | Postgres (Neon), Redis |
| Auth | One Clerk organization per venue; every query is scoped by `venue_id`. | Clerk |

## Quick start

Frontend:

```bash
git clone https://github.com/shizhigu/venue-ops-ai.git
cd venue-ops-ai
npm install
# create .env.local with Clerk, OpenRouter, Deepgram, and Neon keys
npm run dev            # http://localhost:3000
```

Backend (LangGraph service):

```bash
cd langgraph-service
pip install -r requirements.txt
# create .env with OPENROUTER_API_KEY, DATABASE_URL, REDIS_URL
uvicorn app.main:app --reload --port 8001   # docs at /docs
```

Database schema, and the local backend stack (app + Redis + Postgres):

```bash
psql "$DATABASE_URL" -f db/venue-ops-schema.sql
cd langgraph-service && docker compose up -d
```

## Status

Advanced prototype. What works end to end: worker capture and AI analysis, the two-step confirm-then-create flow, the AI Deputy ReAct agent with its five tools and per-thread memory, human-in-the-loop confirmation, and the event audit trail with automatic status-change logging.

Rough edges and open work: the task graph currently ends after analysis, so the assignment, execution, and completion stages described in `langgraph-service/ARCHITECTURE.md` are not wired in (the assignment node exists as code but imports helpers that are not in the repo); the analysis cache is in-memory rather than Redis-backed, so Redis is provisioned in Docker Compose but not yet the checkpointer or cache backend; worker dispatch notifications are logged but not delivered; and the vector search over past issues for pattern detection is not built yet. Tests in `langgraph-service/` are ad-hoc scripts that hit a running server, not a `pytest` suite, and there is no CI.

## License

No license file is included and `package.json` declares none, so all rights are reserved by the author by default. Ask before reuse.
