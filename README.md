# CodeLens — AI Code Reviewer

> Professional AI-powered code review platform built with React, Node.js, and Google Gemini 2.5 flash 

## Features

- **Streaming AI Responses** — Real-time response streaming via SSE; no more staring at a blank screen
- **Animated Scanning Loader** — Engaging code-analysis animation while Gemini processes your code
- **Interactive Code Editor** — Syntax highlighting + line numbers for 11+ languages
- **Structured Review Report** — Score gauge, severity-tagged issues, best practices, and fixed code
- **Quality Metrics** — Visual bars for complexity, security, performance, and maintainability
- **12 Languages Supported** — JS, TS, JSX, Python, Java, C, C++, C#, Go, Rust, and more

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- A Google Gemini API key (free at https://aistudio.google.com/apikey)

---

### Step 1 — Clone / Download the project

Place the `BackEnd` and `Frontend` folders in your project root.

---

### Step 2 — Setup Backend

```bash
cd BackEnd
npm install
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Start the backend:
```bash
npm run dev      # development (auto-restart)
# OR
npm start        # production
```

The backend runs on **http://localhost:3000**

---

### Step 3 — Setup Frontend

Open a **new terminal**:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on **http://localhost:5173**

---

### Step 4 — Open in Browser

Visit **http://localhost:5173** and start reviewing code!

---

## 🌐 Deployment

### Backend (Render / Railway / Fly.io)
1. Push `BackEnd` folder to a GitHub repo
2. Set environment variables in your hosting dashboard:
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (your deployed frontend URL)
3. Set build command: `npm install`
4. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Push `Frontend` folder to a GitHub repo
2. Set environment variable: `VITE_API_URL=https://your-backend-url.com`
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 📁 Project Structure

```
BackEnd/
├── server.js
├── .env
├── package.json
└── src/
    ├── app.js
    ├── controllers/ai.controller.js
    ├── routes/ai.routes.js
    └── services/ai.service.js

Frontend/
├── index.html
├── vite.config.js
├── .env
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    └── components/
        ├── CodeEditor.jsx
        ├── ScanningLoader.jsx
        ├── ScoreGauge.jsx
        └── ReviewPanel.jsx
```

---

## Tech Stack

| Layer     | Tech                                  |
|-----------|---------------------------------------|
| Frontend  | React 18, Vite, PrismJS               |
| Backend   | Node.js, Express                      |
| AI        | Google Gemini 2.5 Flash (Streaming)   |
| Styling   | Pure CSS, CSS Variables, Animations   |
| Fonts     | Syne (display), JetBrains Mono (code) |
