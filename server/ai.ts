import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

export async function generateRecommendations(skills: string[], bio: string) {
  const client = getAiClient();
  const defaultResp = {
    predictedInterests: skills.length > 0 ? skills.slice(0, 3) : ["Web Development", "Artificial Intelligence"],
    courseIds: ["crs_next", "crs_node"],
    reasoning: "Based on your interest in technology and software learning, we recommend starting with modern web frameworks and design architectures."
  };

  if (!client) {
    console.warn("GEMINI_API_KEY is not defined. Using local matching fallback recommendations.");
    // Smart local fallback matching
    const matches: string[] = [];
    const lowerSkills = skills.map(s => s.toLowerCase());
    const lowerBio = bio.toLowerCase();

    if (lowerSkills.includes("react") || lowerSkills.includes("typescript") || lowerSkills.includes("next.js") || lowerBio.includes("web") || lowerBio.includes("frontend")) {
      matches.push("crs_next");
    }
    if (lowerSkills.includes("tensorflow") || lowerSkills.includes("python") || lowerSkills.includes("machine learning") || lowerBio.includes("ai") || lowerBio.includes("ml")) {
      matches.push("crs_tf");
    }
    if (lowerSkills.includes("figma") || lowerSkills.includes("ui") || lowerSkills.includes("ux") || lowerSkills.includes("design") || lowerBio.includes("design")) {
      matches.push("crs_design");
    }
    if (lowerSkills.includes("node") || lowerSkills.includes("graphql") || lowerSkills.includes("express") || lowerBio.includes("backend")) {
      matches.push("crs_node");
    }

    if (matches.length > 0) {
      defaultResp.courseIds = matches;
      defaultResp.reasoning = `Matched courses matching your active skills: ${skills.join(", ")}. Enjoy customized learning!`;
    }
    return defaultResp;
  }

  try {
    const prompt = `User Skills: ${skills.join(", ")}\nUser Bio: ${bio}\nAvailable courses are:\n- crs_next: Mastering Next.js 15 & Modern React Essentials\n- crs_tf: Intro to TensorFlow Lite & Edge Intelligence\n- crs_design: Interactive UI: Motion, Figma, and Tailwind CSS\n- crs_node: Scale-Out Backends: Express, GraphQL & WebSockets\n\nAnalyze the user profile and predict their top learning interests (such as Frontend, Backend, UI/UX Design, or AI Engineering). Then recommend the top 2-3 course IDs that perfectly fit them, and write a concise 1-2 sentence friendly professional reasoning explanation.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedInterests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 2-3 predicted technical fields of interest (e.g. AI, Front-End, Design)."
            },
            courseIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended course IDs from: crs_next, crs_tf, crs_design, crs_node."
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief 1-2 sentence friendly explanation of why these were recommended."
            }
          },
          required: ["predictedInterests", "courseIds", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return defaultResp;
  } catch (error) {
    console.error("Gemini recommendation generation error:", error);
    return defaultResp;
  }
}
