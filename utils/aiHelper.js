import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateQuizWithAI = async (topic, difficulty, numQuestions = 5) => {
  try {
    const prompt = `
    Generate ${numQuestions} multiple-choice questions about "${topic}" with difficulty "${difficulty}".
    Each question must have exactly 4 options, 1 correct answer, and a short explanation.
    Format the response as valid JSON only (no extra text).
    Example:
    [
      {
        "questionText": "string",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "string",
        "explanation": "string"
      }
    ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    // Extract raw content
    const raw = response.choices[0].message.content.trim();

    // Clean possible code fences like ```json
    const cleanJson = raw.replace(/```json|```/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(cleanJson);
    } catch (err) {
      console.error("❌ JSON parse error from AI:", err.message);
      throw new Error("AI returned invalid JSON");
    }

    return questions;
  } catch (error) {
    console.error("❌ AI Quiz generation failed, using fallback:", error.message);

    // ✅ Fallback mock questions so system doesn’t crash
    return Array(numQuestions).fill({
      questionText: `Sample question about ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: "This is a mock explanation since AI failed.",
    });
  }
};
