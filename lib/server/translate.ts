import OpenAI from 'openai';

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