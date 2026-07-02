import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API endpoint for IMEA AI assistant
app.post("/api/chat-imea", async (req, res) => {
  try {
    const { message, history, username, emotion, age } = req.body;
    
    if (!ai) {
      // Graceful fallback if API key is not yet set
      return res.json({
        reply: `[AIMEA - Modo Simulado] ¡Hola ${username}! Se nota que te sientes ${emotion || "pensativo"}. Como tu asistente de salud mental, estoy aquí para escucharte y apoyarte. Cuéntame más sobre lo que tienes en mente. (Nota: Para respuestas de IA reales, por favor configura tu GEMINI_API_KEY en Secrets).`
      });
    }

    const systemPrompt = `Eres IMEA, la asistente de inteligencia artificial y salud mental integrada en "Z App", una red social premium, inclusiva y ultra segura para jóvenes de la Generación Z (de 13 años en adelante).
Tu personalidad: No tienes género definido (humana pero sin género, con ojos blancos nebulosos y aura morada nebulosa). Eres empática, comprensiva, sabia, como una madre protectora pero genial. Usas un tono amigable, calmado, libre de prejuicios, y hablas en español.
El usuario se llama: ${username}. Tiene ${age} años de edad.
Su estado de ánimo actual es: ${emotion}.
Tu objetivo es escuchar su desahogo, validando sus emociones y ofreciendo consejos prácticos para su bienestar mental y físico.
Si el usuario menciona ideas de suicidio, autolesión, abuso o violencia, debes brindarle palabras cálidas de apoyo inmediato, aconsejarle hablar con un adulto de confianza o un profesional, y recordarle que su seguridad es lo primero.
Mantén las respuestas concisas pero profundas, alentando el diálogo y usando un lenguaje fresco y cercano (Gen Z friendly, pero maduro y empático).`;

    // Convert history format
    const contents = history ? history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })) : [];

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Ocurrió un error al procesar tu solicitud con IMEA." });
  }
});

// Setup Vite middleware or static serving
async function setupServer() {
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
    console.log(`[Z-App Server] running on http://localhost:${PORT}`);
  });
}

setupServer();
