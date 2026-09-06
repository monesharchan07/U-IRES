# U-IRES Backend

Node.js + Express API server for the **Unified Intelligent Resource & Environment System**.

## Prerequisites

- Node.js ≥ 18

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

The only required variable for Phase 1 is:

| Variable | Default | Description          |
|----------|---------|----------------------|
| `PORT`   | `5000`  | HTTP listen port     |

## Development server

```bash
npm run dev
```

Uses **nodemon** — the server restarts automatically when source files change.

## Production server

```bash
npm start
```

## Port

The backend listens on **port 5000** by default, matching the proxy configured in the frontend's `vite.config.js`.

## Health endpoint

```
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "u-ires-backend"
}
```

## Route architecture

All routes are mounted under `/api`.  
Sub-routers are registered in `src/routes/index.js`.

| Prefix (future)         | Purpose                         |
|-------------------------|---------------------------------|
| `/api/health`           | Health check (Phase 1 ✅)       |
| `/api/campus`           | Zone state                      |
| `/api/sensors`          | Sensor readings                 |
| `/api/telemetry`        | Time-series ingestion           |
| `/api/control`          | Actuator commands               |
| `/api/actuators`        | Actuator state                  |
| `/api/intelligence`     | AI predictions & optimizer      |
| `/api/analytics`        | Analytics summaries             |
