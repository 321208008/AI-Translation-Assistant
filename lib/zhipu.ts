const ZHIPU_API_KEY = process.env.NEXT_PUBLIC_ZHIPU_API_KEY
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const VISION_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

interface Message {
  role: 'user' | 'assistant'
  content: string | {
    type: string
    text?: string
    image_url?: {
      url: string
    }
  }[]
}

// Base64 URL 编码
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// 将字符串转换为 Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

// 将 Uint8Array 转换为 Base64URL 字符串
function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  return base64UrlEncode(
    Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('')
  )
}

async function getZhipuToken() {
  if (!ZHIPU_API_KEY) {
    throw new Error('智谱API密钥未配置')
  }

  const [apiId, apiKey] = ZHIPU_API_KEY.split('.')
  if (!apiId || !apiKey) {
    throw new Error('智谱API密钥格式错误')
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const expiration = timestamp + 3600  // 1小时后过期

  const header = {
    alg: 'HS256',
    sign_type: 'SIGN'
  }

  const payload = {
    api_key: apiId,
    exp: expiration,
    timestamp
  }

  const headerBase64 = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const payloadBase64 = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  const signContent = `${headerBase64}.${payloadBase64}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signContent)
  )

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signContent}.${signatureBase64}`
}

export async function translateWithZhipu(text: string, targetLanguage: string): Promise<string> {
  try {
    const token = await getZhipuToken()
    const prompt = `请将以下文本翻译成${targetLanguage}，只返回翻译结果，不要包含任何其他内容：\n\n${text}`

    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        model: 'glm-4-air',
        messages,
        stream: false,
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '翻译失败')
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error: any) {
    console.error('智谱AI翻译错误:', error)
    throw new Error(error.message || '翻译失败')
  }
}

export async function extractVideoFrames(videoFile: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve([base64Data]);
    };
    reader.onerror = () => {
      reject(new Error('视频处理失败'));
    };
    reader.readAsDataURL(videoFile);
  });
}

export async function analyzeVideoContent(frames: string[]): Promise<string> {
  try {
    const token = await getZhipuToken()
    const videoBase64 = frames[0]

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        model: 'glm-4v-plus',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别视频中的所有文字内容，包括字幕、标题、显示的文本等。只需要返回文字内容，不需要其他描述。'
              },
              {
                type: 'video_url',
                video_url: {
                  url: `data:video/mp4;base64,${videoBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.95,
        top_p: 0.7,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('智谱AI响应错误:', error)
      throw new Error(error.error?.message || '视频分析失败')
    }

    const data = await response.json()
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('智谱AI响应格式错误:', data)
      throw new Error('视频分析结果格式错误')
    }
    
    const result = data.choices[0].message.content.trim()
    if (!result) {
      throw new Error('未识别到文字内容')
    }

    // 去除重复内容
    const lines = result.split('\n')
    const uniqueLines = Array.from(new Set(lines.filter(line => line.trim())))
    const cleanedText = uniqueLines.join('\n')
    
    return cleanedText
  } catch (error: any) {
    console.error('智谱AI视频分析错误:', error)
    throw new Error(error.message || '视频分析失败')
  }
}

export async function extractTextWithZhipu(imageBase64: string): Promise<string> {
  try {
    const token = await getZhipuToken()
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别图片中的所有文字内容，只返回文字，不需要其他描述。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`
                }
              }
            ]
          }
        ],
        temperature: 0.95,
        top_p: 0.7,
        max_tokens: 1024
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('智谱AI响应错误:', error)
      throw new Error(error.error?.message || '文字识别失败')
    }

    const data = await response.json()
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('智谱AI响应格式错误:', data)
      throw new Error('文字识别结果格式错误')
    }
    
    const result = data.choices[0].message.content.trim()
    if (!result) {
      throw new Error('未识别到文字内容')
    }
    
    return result
  } catch (error: any) {
    console.error('智谱AI文字识别错误:', error)
    throw new Error(error.message || '文字识别失败')
  }
}

export async function extractFileContent(file: File): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).replace(/^data:.*?;base64,/, '')
          const token = await getZhipuToken()

          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            },
            body: JSON.stringify({
              model: 'glm-4v-flash',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: '请识别文件中的所有文字内容，只返回文字，不需要其他描述。'
                    },
                    {
                      type: 'image_url',
                      image_url: {
                        url: `data:${file.type};base64,${base64Data}`
                      }
                    }
                  ]
                }
              ],
              temperature: 0.95,
              top_p: 0.7,
              max_tokens: 1024
            })
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('智谱AI响应错误:', error)
            reject(new Error(error.error?.message || '文件识别失败'))
            return
          }

          const data = await response.json()
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('智谱AI响应格式错误:', data)
            reject(new Error('文件识别结果格式错误'))
            return
          }

          const result = data.choices[0].message.content.trim()
          if (!result) {
            reject(new Error('未识别到文字内容'))
            return
          }

          resolve(result)
        } catch (error: any) {
          console.error('智谱AI文件识别错误:', error)
          reject(new Error(error.message || '文件识别失败'))
        }
      }
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      reader.readAsDataURL(file)
    })
  } catch (error: any) {
    console.error('智谱AI文件识别错误:', error)
    throw new Error(error.message || '文件识别失败')
  }
} 