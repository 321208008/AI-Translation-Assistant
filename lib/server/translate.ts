import OpenAI from 'openai';

// 使用 DeepSeek API 进行文本翻译
export async function translateWithDeepSeek(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com/v1'
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error: any) {
    console.error('DeepSeek translation error:', error);
    throw new Error(error.message || 'Translation failed');
  }
}

// 使用通义千问 API 进行文本翻译
export async function translateWithQwen(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('Qwen API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Qwen translation error:', error);
    throw new Error(error.message || 'Translation failed');
  }
}

// 使用智谱 GLM4 API 进行文本翻译
export async function translateWithZhipu(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('Zhipu API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4'
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'glm-4',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, no explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error: any) {
    console.error('Zhipu translation error:', error);
    throw new Error(error.message || 'Translation failed');
  }
}

// 使用腾讯混元 API 进行文本翻译
export async function translateWithHunyuan(text: string, targetLang: string) {
  try {
    const response = await fetch('/api/hunyuan/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLang,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '翻译请求失败');
    }

    if (!result.text) {
      throw new Error('翻译结果为空');
    }

    return result.text.trim();
  } catch (error: any) {
    console.error('Error translating with Hunyuan:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
} 