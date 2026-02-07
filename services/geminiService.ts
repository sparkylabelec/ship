import { GoogleGenAI } from "@google/genai";
import { User, Ship } from "../types";

// Note: API key is exclusively obtained from process.env.API_KEY as per guidelines.

export const getCrewOptimizationAdvice = async (users: User[], ships: Ship[]) => {
  // Fix: Always use a new instance with the direct process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    다음은 현재 선박 인력 배정 데이터입니다.
    선박 정보: ${JSON.stringify(ships)}
    사용자 정보: ${JSON.stringify(users)}

    1. 정원 초과 상태인 선박이 있는지 확인하십시오.
    2. 선장 또는 기관장이 배정되지 않은 선박이 있는지 확인하십시오.
    3. 인력 운영 효율성을 높이기 위한 재배치 제안을 3가지 내외로 한글로 요약하여 제공하십시오.
    반드시 마크다운 형식을 사용하십시오.
  `;

  try {
    // Fix: Correct generateContent usage with required model and contents as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Access .text property directly, not as a method.
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};