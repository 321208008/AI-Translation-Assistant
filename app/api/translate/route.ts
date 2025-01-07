import { NextResponse } from 'next/server';
import { translateWithZhipu } from '@/lib/zhipu';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage, service } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, message: '未提供文本' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { success: false, message: '未提供目标语言' },
        { status: 400 }
      );
    }

    let result: string;

    switch (service) {
      case 'zhipu':
        result = await translateWithZhipu(text, targetLanguage);
        break;
      default:
        result = await translateWithZhipu(text, targetLanguage);
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('翻译错误:', error);
    return NextResponse.json(
      { success: false, message: error.message || '翻译失败' },
      { status: 500 }
    );
  }
} 