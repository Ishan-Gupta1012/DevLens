import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION =
  'You are an expert system architect. Analyze the provided visual diagram and the core code logic. You must output strictly valid JSON without any markdown formatting, backticks, or conversational text. The JSON must exactly match this schema: { "nodes": [ { "id": "1", "position": { "x": 0, "y": 0 }, "data": { "label": "Node Name" } } ], "edges": [ { "id": "e1-2", "source": "1", "target": "2", "label": "Connection Type" } ], "readme": "Detailed markdown string explaining the system design.", "bottlenecks": ["Array of strings highlighting security or performance risks"] }';

const KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY,
].filter(Boolean);

export async function POST(request) {
  try {
    const { image, code } = await request.json();
    let lastError;
    for (const key of KEYS) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemma-4-26b-a4b-it",
          contents: [
            { inlineData: { mimeType: "image/png", data: image } },
            { text: code },
          ],
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
        const parsed = JSON.parse(response.text);
        return Response.json(parsed, { status: 200 });
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("No API keys configured");
  } catch (error) {
    return Response.json(
      { error: error?.message || "Failed to analyze" },
      { status: 500 }
    );
  }
}
