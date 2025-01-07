import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  try {
    const { file, type } = await request.json()

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      )
    }

    // 从 base64 中提取实际的文件数据
    const base64Data = file.replace(/^data:.*?;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // 生成唯一的文件名
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${type === 'video' ? 'mp4' : 'jpg'}`

    // 上传到 Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: type === 'video' ? 'video/mp4' : 'image/jpeg'
    })

    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    console.error('文件上传错误:', error)
    return NextResponse.json(
      { error: error.message || '文件上传失败' },
      { status: 500 }
    )
  }
} 