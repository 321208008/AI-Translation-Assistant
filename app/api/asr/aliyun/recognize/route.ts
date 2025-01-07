import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audioUrl, appKey, token, taskId } = await request.json();

    // 调用阿里云语音识别 API
    const response = await fetch('https://nls-gateway.aliyuncs.com/stream/v1/asr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NLS-Token': token,
      },
      body: JSON.stringify({
        appkey: appKey,
        audio_url: audioUrl,
        format: 'wav',
        sample_rate: 16000,
        enable_intermediate_result: true,
        enable_punctuation_prediction: true,
        enable_inverse_text_normalization: true,
      }),
    });

    if (!response.ok) {
      throw new Error('阿里云 API 请求失败');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '识别失败' },
      { status: 500 }
    );
  }
} 