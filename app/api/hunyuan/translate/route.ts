import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { text, targetLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    console.log('Processing request:', { text, targetLang });

    const client = new OpenAI({
      apiKey: process.env.TENCENT_API_KEY,
      baseURL: "https://api.hunyuan.cloud.tencent.com/v1",
    });

    const params = {
      model: "hunyuan-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的翻译助手，请直接翻译文本，不要添加任何解释。"
        },
        {
          role: "user",
          content: `将以下文本翻译成${targetLang}：\n\n${text}`
        }
      ],
      temperature: 0.1,
      top_p: 0.7,
      stream: false,
      enable_enhancement: true
    };

    console.log('Request params:', params);

    // @ts-ignore
    const completion = await client.chat.completions.create(params);
    console.log('API response:', completion);

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('API响应格式不正确');
    }

    const translatedText = completion.choices[0].message.content.trim();
    console.log('Translated text:', translatedText);

    return NextResponse.json({ text: translatedText });
  } catch (error: any) {
    console.error('Error in Hunyuan translation:', error);
    return NextResponse.json(
      { error: error.message || '翻译服务出错' },
      { status: 500 }
    );
  }
} 