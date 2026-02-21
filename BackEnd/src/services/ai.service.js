import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are an elite senior software engineer and code reviewer with 15+ years of experience across all major languages and frameworks. Your reviews are precise, actionable, and educational.

Analyze the provided code and respond ONLY in this exact JSON structure (no markdown, no extra text):

{
  "summary": "2-3 sentence executive summary of the code quality and main findings",
  "score": <integer 0-100 representing overall code quality>,
  "language": "<detected programming language>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "line": <line number or null>,
      "title": "<short issue title>",
      "description": "<detailed explanation of the problem>",
      "fix": "<specific actionable fix>"
    }
  ],
  "bestPractices": [
    {
      "category": "<category like Performance|Security|Readability|Maintainability|Testing>",
      "title": "<practice title>",
      "description": "<why this matters and how to apply it>"
    }
  ],
  "fixedCode": "<complete corrected version of the code with all issues resolved>",
  "metrics": {
    "complexity": "<Low|Medium|High>",
    "maintainability": "<Low|Medium|High>",
    "security": "<Low|Medium|High>",
    "performance": "<Low|Medium|High>"
  }
}

Be thorough but prioritize the most impactful issues. Always provide the complete fixed code.`;

export const reviewCode = async (code, language = "auto") => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const prompt =
    language !== "auto"
      ? `Language: ${language}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``
      : `Code to review:\n\`\`\`\n${code}\n\`\`\``;

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: prompt },
  ]);

  const text = result.response.text();

  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/^```json\n?/, "")
    .replace(/^```\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return JSON.parse(cleaned);
};

export const reviewCodeStream = async (code, language = "auto", onChunk) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const prompt =
    language !== "auto"
      ? `Language: ${language}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``
      : `Code to review:\n\`\`\`\n${code}\n\`\`\``;

  const result = await model.generateContentStream([
    { text: SYSTEM_PROMPT },
    { text: prompt },
  ]);

  let fullText = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(chunkText);
  }

  return fullText;
};
