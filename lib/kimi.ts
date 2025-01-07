import { encode } from 'base64-arraybuffer'

const KIMI_API_KEY = process.env.NEXT_PUBLIC_KIMI_API_KEY
const KIMI_API_URL = 'https://api.moonshot.cn/v1'

// 重试函数
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0 || error.message.includes('API密钥')) {
      throw error
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryWithDelay(fn, retries - 1, delay * backoff, backoff)
  }
}

export async function extractPDFWithKimi(file: File): Promise<string> {
  try {
    // 将文件转换为 base64
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const response = await fetch('/api/file/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64String,
        filename: file.name,
        service: 'kimi'
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || '文件处理失败')
    }

    const data = await response.json()
    if (!data.text) {
      throw new Error('文件内容获取失败')
    }

    return data.text
  } catch (error: any) {
    console.error('文件处理错误:', error)
    throw error
  }
} 