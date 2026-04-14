# Venue Ops LangGraph Service

AI-powered task processing microservice using LangGraph for intelligent venue operations management.

## Architecture Overview

This service implements a unified task processing system where both Workers and Managers interact with the same intelligent task graph, providing different views and capabilities based on their roles.

```
Worker App → FastAPI → LangGraph → Database
                           ↓
                    Unified Task Context
                           ↑
Manager App → FastAPI → LangGraph → AI Decisions
```

## Key Features

### For Workers
- **Multimodal Input**: Submit issues with photos, voice, and location
- **AI Analysis**: Automatic issue categorization and priority assessment
- **Smart Assignment**: Tasks automatically assigned to best available worker
- **Real-time Updates**: Track task progress and add execution photos

### For Managers
- **Natural Language Commands**: "Show all urgent tasks" or "Assign plumbing to Wang"
- **AI Insights**: Pattern detection and predictive maintenance
- **Intervention Points**: Override AI decisions when needed
- **Analytics Dashboard**: Real-time operational overview

## LangGraph Workflow

The task processing graph consists of these nodes:

1. **Capture Node**: Process initial input (images, voice, location)
2. **Analysis Node**: AI analysis using GPT-4 Vision
3. **Assignment Node**: Smart worker allocation
4. **Manager Review Node**: Optional manager intervention
5. **Execution Node**: Task completion tracking
6. **Completion Node**: Resolution and learning

## Quick Start

### Prerequisites
- Python 3.11+
- Docker & Docker Compose
- OpenAI API Key

### Local Development

1. **Clone and setup**:
```bash
cd langgraph-service
cp .env.example .env
# Edit .env with your configurations
```

2. **Install dependencies**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Run with Docker Compose**:
```bash
docker-compose up -d
```

4. **Or run directly**:
```bash
uvicorn app.main:app --reload --port 8001
```

### API Documentation

Once running, visit:
- API Docs: http://localhost:8001/docs
- Health Check: http://localhost:8001/health

## API Endpoints

### Worker Endpoints
- `POST /api/tasks/create` - Create new task with images/voice
- `GET /api/tasks/{task_id}` - Get task details
- `POST /api/tasks/{task_id}/update-status` - Update task status
- `POST /api/tasks/{task_id}/add-photo` - Add execution photo

### Manager Endpoints
- `GET /api/managers/dashboard` - Dashboard overview
- `POST /api/managers/tasks/{task_id}/intervene` - Manager intervention
- `POST /api/managers/ai-command` - Natural language commands
- `GET /api/managers/analytics` - Analytics and insights

## Environment Variables

Key configurations in `.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4-vision-preview

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/venue_ops

# Redis (for LangGraph state)
REDIS_URL=redis://localhost:6379/0

# CORS (NextJS frontend)
CORS_ORIGINS=http://localhost:3000,http://localhost:3007
```

## Deployment

### Production Deployment

1. **Build Docker image**:
```bash
docker build -t venue-ops-langgraph .
```

2. **Deploy to cloud**:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Kubernetes

### Environment-specific configs:
- `APP_ENV=production`
- Use managed database (RDS, Cloud SQL)
- Use managed Redis (ElastiCache, Cloud Memorystore)
- Configure proper CORS origins

## Integration with NextJS Frontend

The frontend communicates with this service for:

1. **Task Creation** (Worker):
```javascript
const formData = new FormData()
formData.append('images', photoBlob)
formData.append('voice', audioBlob)
formData.append('location', JSON.stringify(location))

const response = await fetch('http://localhost:8001/api/tasks/create', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

2. **Manager Commands**:
```javascript
const response = await fetch('http://localhost:8001/api/managers/ai-command', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ command: "Show urgent tasks" })
})
```

## Development Tips

### Adding New Nodes
1. Create node in `app/nodes/`
2. Add to task graph in `app/agents/task_graph.py`
3. Update state transitions

### Customizing AI Analysis
Edit prompts in `app/utils/prompts.py` to adjust AI behavior

### Monitoring
- Logs: JSON structured logging with `structlog`
- Metrics: Prometheus endpoint at `:9090/metrics`
- Health: `/health` endpoint for container orchestration

## Testing

```bash
# Run tests
pytest tests/

# With coverage
pytest --cov=app tests/
```

## License

MIT