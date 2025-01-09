import OpenAI from 'openai';

// 使用 DeepSeek API 进行文本翻译
export async function translateWithDeepSeek(text: string, targetLanguage: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage,
        service: 'deepseek'
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
    console.error('DeepSeek translation error:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
}

// 使用通义千问 API 进行文本翻译
export async function translateWithQwen(text: string, targetLanguage: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage,
        service: 'qwen'
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
    console.error('Qwen translation error:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
}

// 使用智谱 GLM4 API 进行文本翻译
export async function translateWithZhipu(text: string, targetLanguage: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage,
        service: 'zhipu'
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
    console.error('Zhipu translation error:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
}

// 使用腾讯混元 API 进行文本翻译
export async function translateWithHunyuan(text: string, targetLang: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage: targetLang,
        service: 'hunyuan'
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

// 使用 OpenAI 4o-mini API 进行文本翻译
export async function translateWith4oMini(text: string, targetLanguage: string) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        targetLanguage,
        service: '4o-mini'
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
    console.error('OpenAI translation error:', error);
    throw new Error(error.message || '翻译失败，请稍后重试');
  }
} 