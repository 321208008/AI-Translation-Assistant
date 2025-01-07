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
    if (!file || !file.type.includes('pdf')) {
      throw new Error('请提供有效的PDF文件')
    }

    // 将文件转换为base64
    const pdfContent = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        // 确保只获取base64数据部分
        const base64 = base64Data.split(',')[1] || base64Data
        resolve(base64)
      }
      reader.readAsDataURL(file)
    })

    return await retryWithDelay(async () => {
      const response = await fetch('/api/file/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: pdfContent,
          filename: file.name,
          service: 'kimi'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'PDF处理失败')
      }

      const data = await response.json()
      if (!data.text) {
        throw new Error('无法解析返回结果')
      }

      return data.text
    })
  } catch (error: any) {
    console.error('PDF处理错误:', error)
    throw new Error(error.message || 'PDF处理失败')
  }
} 