import { useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/themes/prism-tomorrow.css";
import Markdown from "react-markdown";
import './App.css';
import Editor from "react-simple-code-editor";
import axios from "axios";

const App = () => {
  const [code, setCode] = useState(`function sum(a, b) {
  return a + b;
}`);

  const [review, setreview] = useState(``)
  const [loading, setLoading] = useState(false);


  async function reviewCode() {
  setLoading(true);   // start loading
  try {
    const response = await axios.post('https://ai-code-reviewer-backend-cfbn.onrender.com', { code });
    setreview(response.data);
  } catch (error) {
    console.error(error);
    setreview("❌ Error fetching review");
  } finally {
    setLoading(false); // stop loading
  }
}


  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) => Prism.highlight(code, Prism.languages.jsx, "jsx")}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              height: "100%",      // ✅ this makes editor fill the div
              width: "100%",
              outline: 0,
              overflow: "auto",
            }}
          />
        </div>
        <div 
        onClick={reviewCode}
        className="review">Review</div>
      </div>
      <div className="right">
        {loading ? <div className="loading">Loading...</div> : null}
        <Markdown>{review}</Markdown>
      </div>
    </main>
  );
};

export default App;
