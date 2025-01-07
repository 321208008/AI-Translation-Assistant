import { NextResponse } from 'next/server'

const KIMI_API_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY
const KIMI_API_URL = 'https://api.moonshot.cn/v1'

// 设置较短的超时时间
const TIMEOUT = 25000 // 25 seconds

// 带超时的 fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout = TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { file, filename, service } = await request.json()

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      )
    }

    if (service !== 'kimi') {
      return NextResponse.json(
        { error: '不支持的服务' },
        { status: 400 }
      )
    }

    if (!KIMI_API_KEY) {
      return NextResponse.json(
        { error: '未配置API密钥' },
        { status: 500 }
      )
    }

    // 第一步：上传文件
    const formData = new FormData()
    const fileBlob = new Blob([Buffer.from(file, 'base64')], { type: 'application/pdf' })
    const pdfFile = new File([fileBlob], filename, { type: 'application/pdf' })
    formData.append('file', pdfFile)
    formData.append('purpose', 'file-extract')

    const uploadResponse = await fetchWithTimeout(`${KIMI_API_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json().catch(() => ({ error: { message: '文件上传失败' } }))
      console.error('KIMI文件上传错误:', error)
      throw new Error(error.error?.message || '文件上传失败')
    }

    const fileObject = await uploadResponse.json()

    // 第二步：获取文件内容
    const contentResponse = await fetchWithTimeout(`${KIMI_API_URL}/files/${fileObject.id}/content`, {
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`
      }
    })

    if (!contentResponse.ok) {
      const error = await contentResponse.json().catch(() => ({ error: { message: '文件内容获取失败' } }))
      console.error('KIMI文件内容获取错误:', error)
      throw new Error(error.error?.message || '文件内容获取失败')
    }

    const fileContent = await contentResponse.text()

    // 第三步：使用文件内容进行对话
    const messages = [
      {
        role: 'system',
        content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手。请提取文件中的所有文字内容，保持原文的格式和换行，不需要总结或解释。'
      },
      {
        role: 'system',
        content: fileContent
      },
      {
        role: 'user',
        content: '请直接返回文件的原始内容，保持格式，不要添加任何解释或总结。'
      }
    ]

    const chatResponse = await fetchWithTimeout(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'moonshot-v1-32k',
        messages,
        temperature: 0.3
      })
    })

    if (!chatResponse.ok) {
      const error = await chatResponse.json().catch(() => ({ error: { message: 'API请求失败' } }))
      console.error('KIMI API错误:', error)
      throw new Error(error.error?.message || 'API请求失败')
    }

    const data = await chatResponse.json()
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('KIMI API响应格式错误:', data)
      throw new Error('API返回格式错误')
    }

    return NextResponse.json({
      text: data.choices[0].message.content.trim()
    })
  } catch (error: any) {
    console.error('PDF处理错误:', error)
    // 处理 AbortError
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请尝试上传更小的文件' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'PDF处理失败' },
      { status: error.status || 500 }
    )
  }
} 