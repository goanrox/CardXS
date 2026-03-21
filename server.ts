import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { callGroq } from "./server/groq";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/explain-paycheck", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const systemPrompt = `You are a financial assistant. Analyze the following paycheck text and return a JSON object with this exact schema:
{
  "summary": "A brief 1-sentence summary of the paycheck",
  "gross": "Total gross amount if found, else N/A",
  "net": "Total net/take-home amount if found, else N/A",
  "lineItems": [
    {"label": "Deduction Name", "meaning": "Simple explanation of what this is", "amount": "Amount if found"}
  ],
  "takeaway": "A simple, actionable takeaway or observation"
}
Ensure the output is valid JSON.`;

      const result = await callGroq(text, systemPrompt, "paycheck");
      res.json(result);
    } catch (error: any) {
      console.error("Paycheck API Error:", error);
      const errorMessage = error.message === "GROQ_API_KEY is not set." 
        ? "Groq API Key is missing. Please add GROQ_API_KEY to your environment variables in the Settings menu."
        : error.message || "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/explain-statement", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const systemPrompt = `You are a financial assistant. Analyze the following credit card statement text and return a JSON object with this exact schema:
{
  "balance": "Total statement balance if found (number only, e.g. 1500.50), else null",
  "minPayment": "Minimum payment due if found (number only), else null",
  "apr": "APR or interest rate if found (number only, e.g. 24.99), else null",
  "interestCharged": "Interest charged this month if found (number only), else null",
  "creditLimit": "Credit limit or credit line if found (number only), else null",
  "summary": "A brief 1-sentence plain-English explanation of their situation based on the text."
}
Ensure the output is valid JSON.`;

      const result = await callGroq(text, systemPrompt, "statement");
      res.json(result);
    } catch (error: any) {
      console.error("Statement API Error:", error);
      const errorMessage = error.message === "GROQ_API_KEY is not set." 
        ? "Groq API Key is missing. Please add GROQ_API_KEY to your environment variables in the Settings menu."
        : error.message || "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/explain-bill", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const systemPrompt = `You are a financial assistant. Analyze the following bill or statement text and return a JSON object with this exact schema:
{
  "summary": "A brief 1-sentence summary of what this bill is",
  "keyCharges": [
    {"description": "Name of charge", "amount": "Amount as string, e.g. $45.00"}
  ],
  "feesOrInterest": [
    {"description": "Name of fee or interest", "amount": "Amount as string"}
  ],
  "explanation": "A simple, jargon-free explanation of the most important part of this bill (e.g., 'You were charged $29 in interest this month because your balance was not fully paid.')",
  "insight": "A key takeaway or observation (e.g., 'You spent $87 on subscriptions this month.')"
}
Ensure the output is valid JSON.`;

      const result = await callGroq(text, systemPrompt, "bill");
      res.json(result);
    } catch (error: any) {
      console.error("Bill API Error:", error);
      const errorMessage = error.message === "GROQ_API_KEY is not set." 
        ? "Groq API Key is missing. Please add GROQ_API_KEY to your environment variables in the Settings menu."
        : error.message || "Internal server error";
      res.status(500).json({ error: errorMessage });
    }
  });

  const coachHandler = async (req: express.Request, res: express.Response) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      console.log(`[API] Coach request received: ${text.substring(0, 50)}...`);

      const systemPrompt = `You are a helpful, calm, and professional financial coach. Answer the user's finance question. Return a JSON object with this exact schema:
{
  "answer": "Your clear, jargon-free answer",
  "actionSteps": ["Step 1", "Step 2"]
}
Ensure the output is valid JSON. Keep responses concise and practical.`;

      const result = await callGroq(text, systemPrompt, "coach");
      res.json(result);
    } catch (error: any) {
      console.error("[API] Coach Error:", error.message);
      
      const isApiKeyMissing = error.message.includes("GROQ_API_KEY is not set");
      const errorMessage = isApiKeyMissing
        ? "Groq API Key is missing. Please add GROQ_API_KEY to your environment variables."
        : "Sorry, the AI coach is temporarily unavailable. Please try again.";

      res.status(500).json({ 
        error: errorMessage,
        debug: process.env.NODE_ENV !== 'production' ? error.message : undefined
      });
    }
  };

  app.post("/api/finance-coach", coachHandler);
  app.post("/api/coach", coachHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
