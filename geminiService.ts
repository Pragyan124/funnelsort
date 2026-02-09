
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAlgorithmicInsight(state: string): Promise<AIInsight> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain what is happening in a Funnel Sort algorithm during this state: "${state}". 
      Focus on cache-obliviousness, buffer filling, and recursive merging.
      Keep it professional, concise, and educational.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    throw new Error("No response from Gemini");
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      title: "Sort Dynamics",
      content: "Funnel sort uses recursive merging. When a buffer is empty, it 'pulls' data from its children by calling a fill operation on the sub-funnels. This ensures cache efficiency by working on small, contiguous blocks of data."
    };
  }
}
