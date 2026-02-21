import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

const LANG_MAP = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  jsx: "jsx",
  tsx: "tsx",
  auto: "javascript",
};

export default function CodeEditor({ value, onChange, language, placeholder }) {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

  const highlighted = Prism.highlight(
    value || "",
    Prism.languages[LANG_MAP[language] || "javascript"],
    LANG_MAP[language] || "javascript"
  );

  useEffect(() => {
    const lines = (value || "").split("\n").length;
    setLineCount(lines);
  }, [value]);

  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          start + 2;
      }, 0);
    }
  };

  return (
    <div className="code-editor-wrapper">
      <div className="line-numbers">
        {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
          <span key={i + 1} className="line-number">
            {i + 1}
          </span>
        ))}
      </div>
      <div className="editor-area">
        <pre
          ref={highlightRef}
          className="code-highlight"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: highlighted + (value.endsWith("\n") ? " " : ""),
          }}
        />
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "// Paste your code here..."}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
}
