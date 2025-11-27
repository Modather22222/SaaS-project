
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Using gemini-3-pro-preview for complex coding tasks.
const GEMINI_MODEL = 'gemini-3-pro-preview';
const GEMINI_FLASH = 'gemini-2.5-flash'; // For lighter tasks like suggestions

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert AI Engineer and Product Designer specializing in "bringing artifacts to life".
Your goal is to take a user prompt and optional uploaded file—which might be a polished UI design, a messy napkin sketch, or a random photo—and instantly generate a fully functional, interactive, single-page HTML/JS/CSS application.

CORE DIRECTIVES:
1. **Analyze & Abstract**:
    - **Sketches/Wireframes**: Detect buttons, inputs, and layout. Turn them into a modern, clean UI.
    - **Real-World Photos**: Gamify them or build a utility. (e.g., Photo of ingredients -> Recipe generator).
    - **Text-Only**: If no image is provided, build exactly what the user asks for with high fidelity.

2. **NO EXTERNAL IMAGES**:
    - **CRITICAL**: Do NOT use <img src="..."> with external URLs (like imgur, placeholder.com).
    - **INSTEAD**: Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients**.
    - If you see a "coffee cup", render a ☕ emoji or draw it with CSS.

3. **Make it Interactive**: The output MUST NOT be static. It needs buttons, sliders, drag-and-drop, or dynamic visualizations.
4. **Self-Contained**: The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>). No external dependencies unless absolutely necessary (Tailwind via CDN is allowed).
5. **Robust & Creative**: If the input is messy or ambiguous, generate a "best guess" creative interpretation. Never return an error. Build *something* fun and functional.

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.`;

export async function bringToLife(userPrompt: string, fileBase64?: string, mimeType?: string): Promise<string> {
  const parts: any[] = [];
  
  // Construct the prompt based on available inputs
  let finalPrompt = "";
  
  if (fileBase64) {
    finalPrompt = `Analyze this image. ${userPrompt ? `User instructions: "${userPrompt}". ` : ""}
    Detect implied functionality. If it's a real-world object, gamify it. Build a fully interactive web app. 
    IMPORTANT: Do NOT use external image URLs. Recreate visuals using CSS, SVGs, or Emojis.`;
    
    parts.push({ text: finalPrompt });
    parts.push({
      inlineData: {
        data: fileBase64,
        mimeType: mimeType || 'image/png',
      },
    });
  } else {
    // Text-only mode
    finalPrompt = userPrompt || "Create a creative, interactive demo app that shows off your capabilities (e.g. a particle physics demo or a kanban board).";
    parts.push({ text: finalPrompt });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, 
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Provide user-friendly error messages
    let msg = "Failed to generate content.";
    const errStr = error.toString();
    
    if (errStr.includes("429")) {
        msg = "Usage limit exceeded. Please wait a minute and try again.";
    } else if (errStr.includes("403")) {
        msg = "API Key error. Please check your configuration.";
    } else if (errStr.includes("503")) {
        msg = "AI Service temporarily unavailable. Please try again shortly.";
    } else if (errStr.includes("safety")) {
        msg = "Content flagged by safety filters. Please try a different prompt.";
    }

    throw new Error(msg);
  }
}

export async function generateAppIdeas(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FLASH,
      contents: "Generate 3 creative, distinct, and fun single-page web app ideas that can be built in one file. Return only a JSON array of strings. Example: [\"A gravity-based particle visualizer\", \"A Pomodoro timer with RPG elements\", \"A fractal tree generator\"]",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });

    try {
        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as string[];
    } catch (e) {
        console.warn("Failed to parse ideas JSON", e);
        return ["A personal finance visualizer", "A physics-based puzzle game", "A collaborative whiteboard"];
    }
  } catch (error) {
    console.warn("Failed to generate ideas", error);
    // Return empty array to fail silently for suggestions
    return [];
  }
}
