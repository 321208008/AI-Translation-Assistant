"use client"

const API_URL = 'https://api.deepseek.com/v1/chat/completions'

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
    if (retries === 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithDelay(fn, retries - 1, delay * backoff, backoff);
  }
}

// 使用 DeepSeek API 进行文本翻译
export async function translateWithDeepSeek(text: string, targetLang: string) {
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
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a professional translator. Translate the text directly without any explanations.'
              },
              {
                role: 'user',
                content: `Translate to ${targetLang}:\n${segment.trim()}`
              }
            ],
            temperature: 0.1,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || '翻译请求失败');
        }

        const result = await response.json();
        const translatedText = result.choices[0].message.content.trim();
        translatedSegments.push(translatedText);
      }
      
      return translatedSegments.join('\n\n');
    });
  } catch (error: any) {
    console.error('Error translating with DeepSeek:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
}

export async function extractTextWithDeepseek(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/file/extract', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '文件识别失败')
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || '文件识别失败')
    }

    return data.result
  } catch (error: any) {
    console.error('DeepSeek文件识别错误:', error)
    throw error
  }
} 