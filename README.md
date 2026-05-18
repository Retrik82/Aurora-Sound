# Aurora Sound

Aurora Sound is a local AI music and ambient sound generation platform MVP. It includes a premium Next.js interface, FastAPI backend, Dramatiq background jobs, OpenRouter prompt orchestration, Suno integration, and mock generation for demos without API keys.

## Features

- Text to Music prompt generation
- Music Constructor with structured controls
- D3-powered Emotion Map with 13 emotions
- Reference style synthesis presets
- Ambient Soundscape mode with mock-ready layering architecture
- Async generation jobs with polling
- Stored generated tracks with waveform previews
- Wavesurfer.js player dock with download support
- Docker Compose with Redis, backend, worker, and frontend

## Environment

Copy `.env.example` to `.env` and fill the keys when you are ready to use real APIs:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
SUNO_API_KEY=your_suno_api_key_here
MOCK_GENERATION=true
```

Keep `MOCK_GENERATION=true` for a fully local demo. Set it to `false` when Suno credentials are configured.

## Local Run Without Docker

This is the default workflow. It does not require Redis or Docker because `.env.example` has `LOCAL_INLINE_JOBS=true`, so FastAPI runs generation jobs in its own background task process.

### Fast Start

Open `cmd` or PowerShell in the project root:

```bat
cd D:\projects\CourseWork
install-backend.bat
start-all.bat
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

### Manual Start

Terminal 1, backend:

```bat
cd D:\projects\CourseWork\backend
if not exist .env copy ..\.env.example .env
if not exist .venv\Scripts\python.exe py -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2, frontend:

```bat
cd D:\projects\CourseWork\frontend
npm install
npm run dev
```

### PowerShell Scripts

You can also use the PowerShell scripts:

```powershell
cd D:\projects\CourseWork
powershell -ExecutionPolicy Bypass -File .\scripts\setup-backend.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\start-all-local.ps1
```

This opens two PowerShell windows:

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## API Keys

For local backend development, edit:

```text
backend/.env
```

Use mock mode without API keys:

```env
MOCK_GENERATION=true
LOCAL_INLINE_JOBS=true
```

Use real APIs:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
SUNO_API_KEY=your_suno_api_key_here
MOCK_GENERATION=false
LOCAL_INLINE_JOBS=true
```

Restart backend after editing `.env`.

## Docker Run

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Local Backend Internals

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install .
uvicorn app.main:app --reload
```

Only run the worker if you set `LOCAL_INLINE_JOBS=false` and have Redis running:

```bash
cd backend
.venv\Scripts\activate
dramatiq app.workers.tasks
```

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

## Soundscape Assets

The MVP has deterministic mock rendering so the UX works immediately. To evolve the soundscape engine, add seamless WAV loops to `backend/assets/soundscape` using the names documented there.

## API

- `POST /generate/text`
- `POST /generate/constructor`
- `POST /generate/emotion`
- `POST /generate/reference`
- `POST /generate/ambient`
- `GET /generation/{id}`
- `GET /tracks`
- `GET /track/{id}`
- `GET /track/{id}/download`
