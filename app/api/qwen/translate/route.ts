import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate the text directly without any explanations.'
            },
            {
              role: 'user',
              content: `Translate to ${targetLang}:\n${text}`
            }
          ]
        },
        parameters: {
          temperature: 0.1,
          max_tokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || '翻译请求失败' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ text: result.output.text });
  } catch (error: any) {
    console.error('Error in Qwen translation:', error);
    return NextResponse.json(
      { error: error.message || '翻译服务出错' },
      { status: 500 }
    );
  }
} 