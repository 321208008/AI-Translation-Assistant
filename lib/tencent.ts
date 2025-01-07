"use client"

import { delay } from './utils'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

async function retryWithDelay<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY)
      return retryWithDelay(fn, retries - 1)
    }
    throw error
  }
}

export async function extractTextWithTencent(imageBase64: string): Promise<string> {
  try {
    const response = await retryWithDelay(() =>
      fetch('/api/tencent/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      })
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '文字识别失败');
    }

    const data = await response.json();
    
    if (!data.success || !data.result) {
      throw new Error(data.message || '文字识别失败');
    }

    return data.result;
  } catch (error: any) {
    console.error('Error extracting text with Tencent:', error);
    throw error;
  }
} 