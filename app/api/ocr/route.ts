import { NextResponse } from 'next/server'
import * as tencentcloud from 'tencentcloud-sdk-nodejs-ocr'

const OcrClient = tencentcloud.ocr.v20181119.Client

interface TextDetection {
  DetectedText: string;
  Confidence: number;
  Polygon: Array<{
    X: number;
    Y: number;
  }>;
  AdvancedInfo: string;
}

interface OCRResponse {
  TextDetections: TextDetection[];
  Language: string;
  RequestId: string;
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
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { success: false, message: '未找到图片数据' },
        { status: 400 }
      )
    }

    const result = await client.GeneralBasicOCR({
      ImageBase64: image,
    }) as OCRResponse

    if (!result || !result.TextDetections || result.TextDetections.length === 0) {
      return NextResponse.json(
        { success: false, message: '未识别到文字' },
        { status: 400 }
      )
    }

    const text = result.TextDetections.map((item: TextDetection) => item.DetectedText).join('\n')

    return NextResponse.json({
      success: true,
      text
    })
  } catch (error: any) {
    console.error('腾讯云OCR错误:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'OCR识别失败' },
      { status: 500 }
    )
  }
} 