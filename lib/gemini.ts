"use client"

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// 重试函数
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0 || error?.status !== 429) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithDelay(fn, retries - 1, delay * backoff, backoff);
  }
}

// 使用 Gemini-1.5-flash 进行图片文字提取
export async function extractTextFromImage(imageData: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    return await retryWithDelay(async () => {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData.split(",")[1]
          }
        },
        "Extract all text from this image and return it as plain text. Please maintain the original text structure and layout as much as possible. If there are multiple languages in the image, please identify and preserve them all.",
      ]);
      const response = await result.response;
      return response.text();
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    if (error?.message?.includes('not found') || error?.message?.includes('deprecated')) {
      console.error('Model not available:', error);
      throw new Error('当前模型不可用，请联系开发者更新');
    }
    console.error('Error extracting text:', error);
    throw error;
  }
}

// 添加别名导出
export const extractTextWithGemini = extractTextFromImage;

// 使用 Gemini Pro 进行文本翻译
export async function translateText(text: string, targetLang: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  try {
    return await retryWithDelay(async () => {
      // 分段处理长文本
      const segments = text.split('\n\n');
      const translatedSegments = [];
      
      for (const segment of segments) {
        if (!segment.trim()) {
          translatedSegments.push('');
          continue;
        }
        
        const result = await model.generateContent([
          `Translate to ${targetLang}:`,
          segment.trim()
        ]);
        
        const response = await result.response;
        translatedSegments.push(response.text().trim());
      }
      
      return translatedSegments.join('\n\n');
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    if (error?.message?.includes('blocked') || error?.message?.includes('SAFETY')) {
      console.error('Content was blocked:', error);
      throw new Error('翻译内容被阻止，请尝试修改文本');
    }
    console.error('Error translating text:', error);
    throw error;
  }
}

// 使用 Gemini Pro 进行文本优化
export async function improveText(text: string, targetLang: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  try {
    return await retryWithDelay(async () => {
      const prompt = `请对以下${targetLang}文本进行润色，使其更加流畅自然。

原文：
${text}

要求：
- 直接返回润色后的文本
- 不要添加任何解释或说明
- 保持段落和换行格式
- 保持标点符号的使用`;
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.1,
          maxOutputTokens: 2048,
        },
      });
      
      const response = await result.response;
      return response.text();
    });
  } catch (error: any) {
    if (error?.status === 429) {
      console.error('API quota exceeded. Please try again later.');
      throw new Error('API 配额已超限，请稍后再试');
    }
    console.error('Error improving text:', error);
    throw error;
  }
}