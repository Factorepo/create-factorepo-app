import { GoogleGenAI } from "@google/genai";

import { env } from "./env";

export const geminiClient = new GoogleGenAI({
  vertexai: true,
  project: env.GOOGLE_CLOUD_PROJECT,
  location: env.GOOGLE_CLOUD_LOCATION,
});
