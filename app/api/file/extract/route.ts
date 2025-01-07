import { NextResponse } from 'next/server'
import { extractTextWithDeepseek } from '@/lib/deepseek'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: '未找到文件' },
        { status: 400 }
      )
    }

    const result = await extractTextWithDeepseek(file)
    
    return NextResponse.json({
      success: true,
      result
    })
  } catch (error: any) {
    console.error('文件处理错误:', error)
    return NextResponse.json(
      { success: false, message: error.message || '文件处理失败' },
      { status: 500 }
    )
  }
} 