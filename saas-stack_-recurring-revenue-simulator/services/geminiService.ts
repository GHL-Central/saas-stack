
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationParams, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSimulation(params: SimulationParams, finalMrr: number, totalRevenue: number): Promise<AIAnalysis> {
  const prompt = `
    Analyze this recurring revenue simulation:
    - Starting Customers: ${params.startingCustomers}
    - Monthly New Customers: ${params.monthlyNewCustomers}
    - Monthly Price: $${params.arpu}
    - Churn Rate: ${params.churnRate}%
    - Duration: ${params.months} months
    - Resulting Monthly Recurring Revenue (MRR): $${finalMrr.toLocaleString()}
    - Total Cumulative Revenue: $${totalRevenue.toLocaleString()}

    Explain why these numbers matter. Compare the "stacking" effect of subscriptions vs one-time sales. 
    Provide actionable insights on how churn impacts the ceiling of the business.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            verdict: { type: Type.STRING }
          },
          required: ["headline", "insights", "verdict"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      headline: "The Power of Compound Growth",
      insights: [
        "Recurring revenue creates a stable baseline that builds month over month.",
        "Even small churn rates can significantly impact long-term scalability.",
        "New customer acquisition is the engine, but retention is the fuel tank."
      ],
      verdict: "A subscription model transforms a treadmill business into an escalator."
    };
  }
}
