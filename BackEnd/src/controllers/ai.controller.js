import { reviewCode, reviewCodeStream } from "../services/ai.service.js";

const formatError = (err) => {
  const msg = err.message || "";
  if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota")) {
    const retryMatch = msg.match(/retry in (\d+)s/i) || msg.match(/retryDelay":"(\d+)s/);
    const seconds = retryMatch ? retryMatch[1] : "30";
    return `Rate limit reached on the free tier. Please wait ${seconds} seconds and try again. To remove limits, enable billing at https://ai.dev/rate-limit`;
  }
  if (msg.includes("API_KEY") || msg.includes("401")) {
    return "Invalid API key. Please check your GEMINI_API_KEY in the .env file.";
  }
  return msg || "Failed to generate review. Please try again.";
};

export const getReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    if (code.length > 50000) {
      return res
        .status(400)
        .json({ error: "Code too long. Maximum 50,000 characters." });
    }

    const review = await reviewCode(code, language);
    res.json({ success: true, review });
  } catch (err) {
    console.error("Review error:", err);

    if (err instanceof SyntaxError) {
      return res
        .status(500)
        .json({ error: "AI returned malformed response. Please try again." });
    }

    const status = (err.message || "").includes("429") ? 429 : 500;
    res.status(status).json({ error: formatError(err) });
  }
};

export const getReviewStream = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let fullText = "";

    await reviewCodeStream(code, language, (chunk) => {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Parse and send the final structured result
    try {
      const cleaned = fullText
        .replace(/^```json\n?/, "")
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      const review = JSON.parse(cleaned);
      res.write(`data: ${JSON.stringify({ done: true, review })}\n\n`);
    } catch {
      res.write(
        `data: ${JSON.stringify({ error: "Failed to parse AI response" })}\n\n`
      );
    }

    res.end();
  } catch (err) {
    console.error("Stream error:", err);
    res.write(
      `data: ${JSON.stringify({ error: formatError(err) })}\n\n`
    );
    res.end();
  }
};
