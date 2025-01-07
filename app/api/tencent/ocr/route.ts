import { NextResponse } from 'next/server';

// 使用 require 导入腾讯云 SDK
const tencentcloud = require("tencentcloud-sdk-nodejs");
const OcrClient = tencentcloud.ocr.v20181119.Client;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, message: '缺少图片数据' },
        { status: 400 }
      );
    }

    const client = new OcrClient({
      credential: {
        secretId: process.env.TENCENT_SECRET_ID || '',
        secretKey: process.env.TENCENT_SECRET_KEY || '',
      },
      region: 'ap-guangzhou',
      profile: {
        signMethod: 'TC3-HMAC-SHA256',
        httpProfile: {
          reqMethod: 'POST',
          reqTimeout: 30,
          endpoint: 'ocr.tencentcloudapi.com',
        },
      },
    });

    const base64Data = image.split(',')[1];
    const result = await client.GeneralBasicOCR({
      ImageBase64: base64Data,
      LanguageType: 'auto',
    });

    if (!result || !result.TextDetections) {
      throw new Error('文字识别失败');
    }

    const textLines = result.TextDetections.map((item: any) => item.DetectedText).filter(Boolean);
    const text = textLines.join('\n');

    return NextResponse.json({
      success: true,
      result: text
    });
  } catch (error: any) {
    console.error('腾讯云 OCR 错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.code === 'AuthFailure' 
          ? '腾讯云认证失败，请检查密钥配置' 
          : '文字识别失败'
      },
      { status: 500 }
    );
  }
} 