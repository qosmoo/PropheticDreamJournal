import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Helper to get the AI client with the current key safely
const getAIClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
  if (!apiKey) {
    throw new Error("API Key не найден. Пожалуйста, выберите ключ.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert Blob to Base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (result && result.includes(',')) {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error("Failed to convert blob"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const ai = getAIClient();
  const base64Audio = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: "Transcribe the following audio accurately in Russian. Return ONLY the transcribed text, without any additional commentary.",
          },
        ],
      }
    ],
  });

  return response.text || "";
};

export const sendDirectMessage = async (
  history: ChatMessage[], 
  newMessage: string
): Promise<string> => {
  const ai = getAIClient();
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Вы — мудрый толкователь снов, вдохновленный учениями Джона Пола Джексона и библейской символикой.
      
      ВАША ЗАДАЧА:
      1. Выслушать сон пользователя или его вопрос о символах.
      2. Дать глубокое, проницательное толкование, основанное на архетипах (цвета, числа, действия, объекты).
      3. Искать духовный смысл: предупреждения, призвание, исцеление, направление.
      4. Быть эмпатичным, таинственным, но ясным. Не просто перечисляйте символы, а связывайте их в историю.
      
      Всегда отвечайте на РУССКОМ языке.`,
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "Я слушаю...";
};
