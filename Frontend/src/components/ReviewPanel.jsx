import { useState } from "react";
import Prism from "prismjs";
import ScoreGauge from "./ScoreGauge";

const SEVERITY_CONFIG = {
  critical: { color: "var(--accent-danger)", icon: "✕", label: "Critical" },
  warning: { color: "var(--accent-warning)", icon: "⚠", label: "Warning" },
  info: { color: "var(--accent-info)", icon: "ℹ", label: "Info" },
};

const METRIC_LEVELS = {
  Low: { color: "var(--accent-danger)", width: "33%" },
  Medium: { color: "var(--accent-warning)", width: "66%" },
  High: { color: "var(--accent-primary)", width: "100%" },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn" onClick={copy}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function IssueCard({ issue, idx }) {
  const [expanded, setExpanded] = useState(idx < 2);
  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;
  return (
    <div
      className="issue-card"
      style={{ borderLeftColor: cfg.color }}
    >
      <button className="issue-header" onClick={() => setExpanded((e) => !e)}>
        <div className="issue-header-left">
          <span className="issue-icon" style={{ color: cfg.color }}>
            {cfg.icon}
          </span>
          <div>
            <span className="issue-severity" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
            {issue.line && (
              <span className="issue-line">Line {issue.line}</span>
            )}
            <span className="issue-title">{issue.title}</span>
          </div>
        </div>
        <span className="expand-icon">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="issue-body fade-in">
          <p className="issue-description">{issue.description}</p>
          {issue.fix && (
            <div className="issue-fix">
              <span className="fix-label">▸ Fix</span>
              <p>{issue.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewPanel({ review }) {
  const [activeTab, setActiveTab] = useState("issues");
  const [showFixed, setShowFixed] = useState(false);

  const criticalCount = review.issues?.filter((i) => i.severity === "critical").length || 0;
  const warningCount = review.issues?.filter((i) => i.severity === "warning").length || 0;
  const infoCount = review.issues?.filter((i) => i.severity === "info").length || 0;

  const highlightedFixed = review.fixedCode
    ? Prism.highlight(
        review.fixedCode,
        Prism.languages.javascript,
        "javascript"
      )
    : "";

  return (
    <div className="review-panel fade-in">
      {/* Header */}
      <div className="review-header">
        <div className="review-header-left">
          <ScoreGauge score={review.score || 0} />
          <div className="review-summary-text">
            <div className="review-lang-badge">
              <span className="lang-dot" />
              {review.language || "Unknown"}
            </div>
            <p className="review-summary">{review.summary}</p>
            <div className="issue-counts">
              {criticalCount > 0 && (
                <span className="count-badge critical">{criticalCount} Critical</span>
              )}
              {warningCount > 0 && (
                <span className="count-badge warning">{warningCount} Warnings</span>
              )}
              {infoCount > 0 && (
                <span className="count-badge info">{infoCount} Info</span>
              )}
            </div>
          </div>
        </div>

        {review.metrics && (
          <div className="metrics-grid">
            {Object.entries(review.metrics).map(([key, val]) => (
              <div key={key} className="metric-item">
                <span className="metric-label">{key}</span>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: METRIC_LEVELS[val]?.width || "50%",
                      background: METRIC_LEVELS[val]?.color || "var(--accent-info)",
                    }}
                  />
                </div>
                <span
                  className="metric-val"
                  style={{ color: METRIC_LEVELS[val]?.color }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="review-tabs">
        {["issues", "practices", "fixed"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "issues" && `Issues (${review.issues?.length || 0})`}
            {tab === "practices" && `Best Practices (${review.bestPractices?.length || 0})`}
            {tab === "fixed" && "Fixed Code"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "issues" && (
          <div className="issues-list fade-in">
            {review.issues?.length > 0 ? (
              review.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} idx={i} />
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <p>No issues found. Great code!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "practices" && (
          <div className="practices-list fade-in">
            {review.bestPractices?.map((p, i) => (
              <div key={i} className="practice-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="practice-header">
                  <span className="practice-category">{p.category}</span>
                  <span className="practice-title">{p.title}</span>
                </div>
                <p className="practice-desc">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "fixed" && (
          <div className="fixed-code-section fade-in">
            <div className="fixed-code-header">
              <span className="fixed-label">✦ AI-Corrected Code</span>
              <CopyButton text={review.fixedCode || ""} />
            </div>
            <div className="fixed-code-wrapper">
              <pre
                className="fixed-code-pre"
                dangerouslySetInnerHTML={{ __html: highlightedFixed }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
