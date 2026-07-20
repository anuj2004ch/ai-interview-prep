# AI Interview Prep

A full-stack interview preparation platform that turns a resume or self-description plus a job description into a personalized interview plan.

## Features

- Personalized match score, skill-gap analysis, and seven-day roadmap
- Technical and behavioral questions with model answers
- Mock interview flow with AI scoring and actionable feedback
- DSA practice with progressive hints, approach/code editors, and AI review
- Flashcards with persisted Easy/OK/Hard ratings
- Daily preparation streak and task completion tracking
- Analytics for match-score history and recurring skill gaps
- Privacy-aware public report links
- ATS-oriented resume PDF generation

> DSA submissions are reviewed by an LLM; code is **not executed in a sandbox**. Treat correctness feedback as coaching, not as a judge verdict.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, SCSS |
| API | Node.js 20+, Express 5 |
| Database | MongoDB, Mongoose |
| AI | Groq (`llama-3.3-70b-versatile` by default) |
| Authentication | HttpOnly JWT cookie, bcrypt, token-ID revocation |
| Files | Multer, pdf-parse, Puppeteer |
| Validation | Zod and Mongoose schemas |
| Testing | Node test runner, Supertest, ESLint, Vite build |

## Architecture

```text
React client
    │  JSON / multipart PDF, HttpOnly cookie
    ▼
Express API
    ├── auth and request validation
    ├── interview/report controllers
    ├── Groq service with validated JSON output
    ├── PDF parsing and isolated resume rendering
    └── Mongoose models
            │
            ▼
         MongoDB
```

The browser never receives the JWT value directly. Private report queries always include the authenticated user ID. Public reports exclude the original resume, self-description, job description, private task progress, and DSA model solutions.

## Project structure

```text
ai-interview-prep-main/
├── Backend/
│   ├── .env.example
│   ├── server.js
│   ├── test/app.test.js
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── validation/
├── Frontend/
│   ├── .env.example
│   └── src/
│       ├── services/api.js
│       └── features/
│           ├── auth/
│           └── interview/
└── README.md
```

## Local setup

Requirements:

- Node.js 20 or newer
- MongoDB database
- Groq API key

### 1. Configure and run the API

```bash
cd Backend


npm run dev
```

Required values in `Backend/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.example.mongodb.net/ai-interview-prep
JWT_SECRET=replace_with_at_least_32_random_characters
GROQ_API_KEY=your_groq_api_key
```

Useful optional values:

```env
PORT=3000
GROQ_MODEL=llama-3.3-70b-versatile
CLIENT_ORIGINS=http://localhost:5173,http://localhost:4173
COOKIE_SAME_SITE=lax
```

`DNS_SERVERS` is optional and should only be set if the local network cannot resolve MongoDB SRV records. 

### 2. Run the frontend

```bash
cd Frontend

npm run dev
```

The development server proxies `/api` to `http://localhost:3000`. For a separately hosted API, set `VITE_API_URL` in `Frontend/.env` and add the frontend origin to `CLIENT_ORIGINS`.

## Commands

### Backend

```bash
npm run dev      # development with nodemon
npm start        # production-style start
npm test         # API and validation tests

```

### Frontend

```bash
npm run dev
npm run lint
npm run build
npm run check    # lint + production build
```

## API

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public/idempotent |
| GET | `/api/auth/get-me` | Private |

### Interview preparation

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/interview/` | Generate a report from multipart input |
| GET | `/api/interview/` | List the user's report summaries |
| GET | `/api/interview/report/:interviewId` | Fetch one private report |
| POST | `/api/interview/evaluate-answer` | Score a practice answer |
| POST | `/api/interview/dsa/evaluate` | Review a DSA approach/code submission |
| PATCH | `/api/interview/report/:interviewId/tasks` | Toggle a roadmap task |
| GET | `/api/interview/streak` | Fetch the user's streak |
| GET | `/api/interview/analytics` | Fetch progress analytics |
| PATCH | `/api/interview/report/:interviewId/share` | Toggle public sharing |
| GET | `/api/interview/public/:interviewId` | Fetch a public report |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Generate a resume PDF |
| GET | `/api/health` | Health check |

## Security and reliability choices

- Request bodies, route IDs, task indices, and AI response shapes are validated.
- Uploads allow one PDF up to 3MB and bound field counts, sizes, and nesting.
- Login/register endpoints and the overall API are rate-limited.
- Helmet security headers, explicit CORS origins, and origin checks are enabled.
- Authentication cookies are HttpOnly and become Secure in production.
- Logout revokes a random JWT ID until token expiry; raw JWTs are not stored.
- The server does not accept traffic until MongoDB connects and shuts down gracefully.
- LLM-generated resume HTML runs with JavaScript disabled and outbound requests blocked.
- AI-generated resume content is instructed not to invent candidate facts; users should still verify every line before use.

For multi-instance production deployment, replace the in-memory rate-limit store with a shared store such as Redis. Keep the frontend and API on the same site when possible; if they must be cross-site, configure `COOKIE_SAME_SITE=none`, use HTTPS, and keep the origin allow-list exact.
