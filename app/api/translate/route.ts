import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { sign } from '@/lib/server/tencent-sign';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage, service } = await request.json();

    if (!text || !targetLanguage || !service) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let result: string;

    switch (service) {
      case 'deepseek':
        result = await translateWithDeepSeek(text, targetLanguage);
        break;
      case 'qwen':
        result = await translateWithQwen(text, targetLanguage);
        break;
      case 'zhipu':
        result = await translateWithZhipu(text, targetLanguage);
        break;
      case '4o-mini':
        result = await translateWith4oMini(text, targetLanguage);
        break;
      case 'hunyuan':
        result = await translateWithHunyuan(text, targetLanguage);
        break;
      default:
        throw new Error('不支持的翻译服务');
    }

    return NextResponse.json({ text: result });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error.message || '翻译失败' },
      { status: 500 }
    );
  }
}

async function translateWithDeepSeek(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.deepseek.com/v1'
  });

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
}

async function translateWithQwen(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('Qwen API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  });

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
}

async function translateWithZhipu(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_ZHIPU_API_KEY;
  if (!apiKey) {
    throw new Error('Zhipu API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://open.bigmodel.cn/api/paas/v4'
  });

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
}

async function translateWith4oMini(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.openai.com/v1'
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
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
}

async function translateWithHunyuan(text: string, targetLanguage: string) {
  const apiKey = process.env.NEXT_PUBLIC_TENCENT_API_KEY;
  if (!apiKey) {
    throw new Error('Tencent API key not found');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.hunyuan.cloud.tencent.com/v1'
  });

  const response = await openai.chat.completions.create({
    model: 'hunyuan-turbo',
    messages: [
      {
        role: 'system',
        content: `你是一个专业的翻译助手，请直接翻译文本，不要添加任何解释。`
      },
      {
        role: 'user',
        content: `将以下文本翻译成${targetLanguage}：\n\n${text}`
      }
    ],
    temperature: 0.1,
    top_p: 0.7,
    // @ts-expect-error key is not yet public
    enable_enhancement: true
  });

  return response.choices[0].message.content || '';
} 