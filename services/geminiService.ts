import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BOMItem } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateBOMSuggestions = async (
  moduleName: string,
  context: string = ""
): Promise<BOMItem[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        component: {
          type: Type.STRING,
          description: "The name of the electronic component (e.g., Resistor, Capacitor, IC).",
        },
        value: {
          type: Type.STRING,
          description: "The technical value or specification (e.g., 10k, 10uF, ATmega328).",
        },
        totalQuantity: {
          type: Type.INTEGER,
          description: "Total quantity needed for the build.",
        },
        pcbQuantity: {
          type: Type.INTEGER,
          description: "Quantity per PCB.",
        },
      },
      required: ["component", "value", "totalQuantity", "pcbQuantity"],
    },
  };

  const prompt = `
    Generate a realistic Bill of Materials (BOM) for an electronics module named: "${moduleName}".
    Context/Description: ${context || "Standard electronics module"}.
    Provide a list of 5-10 common components that would be found in such a device.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert electronics engineer assisting with BOM creation.",
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Transform to BOMItem format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any, index: number) => ({
      id: generateId(),
      sNo: index + 1,
      component: item.component,
      value: item.value,
      totalQuantity: item.totalQuantity,
      pcbQuantity: item.pcbQuantity,
      selected: false,
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
