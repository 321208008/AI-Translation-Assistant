import { NextResponse } from 'next/server'

if (!process.env.NEXT_PUBLIC_QWEN_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_QWEN_API_KEY environment variable')
}

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { message: '缺少图片数据' },
        { status: 400 }
      )
    }

    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-vl-ocr',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                },
                min_pixels: 28 * 28 * 4,
                max_pixels: 28 * 28 * 1280
              },
              {
                type: 'text',
                text: 'Read all the text in the image.'
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '文字识别失败')
    }

    const result = await response.json()
    const text = result.choices[0].message.content
    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('通义千问OCR错误:', error)
    return NextResponse.json(
      { message: error.message || '文字识别失败' },
      { status: 500 }
    )
  }
} 