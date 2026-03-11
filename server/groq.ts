import { cache } from './cache';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function callGroq(prompt: string, systemPrompt: string, cachePrefix: string) {
  if (!prompt || prompt.trim() === '') {
    throw new Error("Input cannot be empty");
  }

  const cacheKey = cache.normalizeKey(cachePrefix, prompt);
  const cachedResponse = await cache.get<any>(cacheKey);
  
  if (cachedResponse) {
    console.log(`[Cache] Hit for ${cachePrefix}`);
    return cachedResponse;
  }

  // Check API Key existence at runtime to be safe
  const apiKey = process.env.GROQ_API_KEY;
  console.log(`[Groq Debug] API Key exists: ${!!apiKey}`);

  if (!apiKey) {
    console.error("[Groq Debug] GROQ_API_KEY is missing from environment variables.");
    throw new Error("GROQ_API_KEY is not set.");
  }

  console.log(`[Groq Debug] Sending request to https://api.groq.com/openai/v1/chat/completions`);
  
  if (typeof fetch === 'undefined') {
    console.error("[Groq Debug] fetch is not defined in this environment. Please ensure you are using Node.js 18+ or install node-fetch.");
    throw new Error("Server environment issue: fetch is not defined.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400
    })
  });

  console.log(`[Groq Debug] Response Status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Groq Debug] Error Body: ${errorText}`);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(content);
    console.log(`[Groq Debug] Request success for ${cachePrefix}`);
    await cache.set(cacheKey, parsed, 86400); // Cache for 24 hours
    return parsed;
  } catch (e) {
    console.error("[Groq Debug] Failed to parse response as JSON:", content);
    throw new Error("Failed to parse Groq response as JSON");
  }
}
