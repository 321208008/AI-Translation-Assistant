import { Configuration, OpenAIApi } from 'openai';

export async function translateWithDeepSeek(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API key not found');
  }

  const configuration = new Configuration({
    apiKey,
    basePath: 'https://api.deepseek.com/v1',
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Keep the original formatting and only output the translated text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translation = response.data.choices[0]?.message?.content;
    if (!translation) {
      throw new Error('No translation received');
    }

    return translation;
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

  const configuration = new Configuration({
    apiKey,
    basePath: 'https://api.qwen.ai/v1',
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Keep the original formatting and only output the translated text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translation = response.data.choices[0]?.message?.content;
    if (!translation) {
      throw new Error('No translation received');
    }

    return translation;
  } catch (error: any) {
    console.error('Qwen translation error:', error);
    throw new Error(error.message || 'Translation failed');
  }
} 