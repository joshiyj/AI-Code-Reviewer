import { useState, useCallback } from "react";
import CodeEditor from "./components/CodeEditor";
import ScanningLoader from "./components/ScanningLoader";
import ReviewPanel from "./components/ReviewPanel";
import "./App.css";

const LANGUAGES = [
  { value: "auto", label: "Auto Detect" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "React (JSX)" },
  { value: "tsx", label: "React (TSX)" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const EXAMPLE_CODE = `function fetchUserData(userId) {
  var data = null;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.example.com/users/' + userId, false);
  xhr.send();
  
  if (xhr.status == 200) {
    data = JSON.parse(xhr.responseText);
  }
  
  // TODO: handle errors someday
  return data;
}

function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].age > 18) {
      result.push(users[i]);
    }
  }
  return result;
}`;

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

  const handleCodeChange = useCallback((val) => {
    setCode(val);
    setCharCount(val.length);
  }, []);

  const handleReview = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review.");
      return;
    }

    setLoading(true);
    setError(null);
    setReview(null);
    setStreamText("");

    try {
      const response = await fetch(`${API_BASE}/ai/review/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.chunk) {
              setStreamText((t) => t + parsed.chunk);
            }
            if (parsed.done && parsed.review) {
              setReview(parsed.review);
              setLoading(false);
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e.message !== "Unexpected token") throw e;
          }
        }
      }
    } catch (err) {
      setError(err.message || "Failed to get review. Check your connection.");
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setReview(null);
    setError(null);
    setStreamText("");
    setCharCount(0);
  };

  const handleExample = () => {
    setCode(EXAMPLE_CODE);
    setCharCount(EXAMPLE_CODE.length);
    setLanguage("javascript");
    setReview(null);
    setError(null);
  };

  return (
    <div className="app">
      {/* Background grid */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <span>⬡</span>
            </div>
            <div className="logo-text">
              <span className="logo-name">CodeLens</span>
              <span className="logo-tagline">AI Code Reviewer</span>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge">Gemini 2.0</span>
            <span className="badge">Streaming</span>
            <div className="status-indicator">
              <span className="status-dot" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="main">
        {/* Editor Pane */}
        <div className="editor-pane">
          <div className="pane-header">
            <div className="pane-title-row">
              <span className="pane-title">Code Input</span>
              <div className="pane-actions">
                <button className="action-btn ghost" onClick={handleExample}>
                  Load Example
                </button>
                <button className="action-btn ghost" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>

            <div className="editor-controls">
              <div className="lang-select-wrap">
                <select
                  className="lang-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="char-count">
                {charCount.toLocaleString()} chars
              </span>
            </div>
          </div>

          <div className="editor-container">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
              placeholder={`// Paste or type your code here...\n// Supports JavaScript, Python, Java, C++, Go, Rust, and more\n\n// Click "Load Example" to try a sample`}
            />
          </div>

          <div className="editor-footer">
            {error && (
              <div className="error-banner fade-in">
                <span>✕</span> {error}
              </div>
            )}
            <button
              className={`review-btn ${loading ? "loading" : ""}`}
              onClick={handleReview}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="btn-icon">◈</span>
                  Analyze Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Review Pane */}
        <div className="review-pane">
          <div className="pane-header">
            <span className="pane-title">Review Output</span>
            {review && (
              <span className="review-done-badge">
                ✓ Analysis Complete
              </span>
            )}
          </div>

          <div className="review-container">
            {loading && <ScanningLoader streamText={streamText} />}
            {!loading && review && <ReviewPanel review={review} />}
            {!loading && !review && (
              <div className="empty-review fade-in">
                <div className="empty-icon-large">◈</div>
                <h3>No Review Yet</h3>
                <p>
                  Paste your code in the editor and click{" "}
                  <strong>Analyze Code</strong> to get a detailed AI-powered
                  review including bug detection, security analysis, and
                  best-practice suggestions.
                </p>
                <div className="feature-pills">
                  <span className="pill">🔍 Bug Detection</span>
                  <span className="pill">🛡 Security Audit</span>
                  <span className="pill">⚡ Performance</span>
                  <span className="pill">📖 Best Practices</span>
                  <span className="pill">✨ Fixed Code</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
