
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Book } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizForBook(book: Book): Promise<QuizQuestion> {
  // 속도 최적화를 위해 매우 간결하고 구조적인 프롬프트 사용
  const prompt = `Task: Create a 4-choice Korean quiz for children.
Book: '${book.title}' by ${book.author}
Content: ${book.description}
Format: JSON only.
Fields: bookTitle, question, options(4 strings), correctAnswerIndex(0-3), explanation(friendly).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // 최적화: 추론 단계를 0으로 설정하여 지연 시간 최소화 (1초 내외 응답)
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              minItems: 4,
              maxItems: 4
            },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["bookTitle", "question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    });

    return JSON.parse(response.text) as QuizQuestion;
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return {
      bookTitle: book.title,
      question: `${book.title}에 대해 가장 기억에 남는 장면은 무엇인가요?`,
      options: ["주인공의 용기", "친구와의 우정", "따뜻한 나눔", "새로운 모험"],
      correctAnswerIndex: 0,
      explanation: "독서는 정답보다 여러분이 느낀 마음이 더 중요해요!"
    };
  }
}
