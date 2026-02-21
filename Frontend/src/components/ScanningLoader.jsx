import { useEffect, useState } from "react";

const SCAN_MESSAGES = [
  "Initializing code analysis engine...",
  "Parsing abstract syntax tree...",
  "Detecting language patterns...",
  "Scanning for vulnerabilities...",
  "Analyzing code complexity...",
  "Checking best practices...",
  "Evaluating performance patterns...",
  "Running security audit...",
  "Generating improvement suggestions...",
  "Compiling review report...",
];

const FAKE_CODE_LINES = [
  "fn analyze_complexity(ast: &ASTNode) -> ComplexityScore {",
  "  let mut score = BaseScore::default();",
  '  match ast.kind { NodeKind::Loop => score.cyclomatic += 1,',
  "  NodeKind::Branch => score.branch_count += 1, _ => {} }",
  "  score.calculate_weighted(0.7, 0.3)",
  "}",
  "",
  "impl SecurityAudit for CodeBlock {",
  "  fn scan_injections(&self) -> Vec<Vulnerability> {",
  "    INJECTION_PATTERNS.iter()",
  "      .filter_map(|p| p.matches(&self.tokens))",
  "      .collect()",
  "  }",
  "}",
];

export default function ScanningLoader({ streamText }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length);
    }, 1800);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);

    const progInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        return p + Math.random() * 3;
      });
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="loader-container fade-in">
      <div className="loader-header">
        <div className="loader-logo">
          <div className="loader-ring outer" />
          <div className="loader-ring inner" />
          <div className="loader-icon">⬡</div>
        </div>
        <div className="loader-title-group">
          <h3 className="loader-title">Analyzing Code</h3>
          <span className="loader-status">
            {SCAN_MESSAGES[msgIdx]}
            <span className="dots">{dots}</span>
          </span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(progress, 95)}%` }}
        />
        <span className="progress-label">{Math.round(Math.min(progress, 95))}%</span>
      </div>

      <div className="fake-terminal">
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">analysis.rs</span>
        </div>
        <div className="terminal-body">
          {FAKE_CODE_LINES.map((line, i) => (
            <div
              key={i}
              className="terminal-line"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="terminal-ln">{String(i + 1).padStart(2, "0")}</span>
              <span className="terminal-code">{line}</span>
            </div>
          ))}
          <div className="scan-line" />
        </div>
      </div>

      {streamText && (
        <div className="stream-preview">
          <span className="stream-label">▸ AI Response</span>
          <div className="stream-text">
            {streamText.slice(-200)}
            <span className="cursor-blink">█</span>
          </div>
        </div>
      )}
    </div>
  );
}
