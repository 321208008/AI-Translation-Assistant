# AI 翻译助手

一个功能强大的多语言翻译工具，支持文本、图片、PDF、语音和视频内容的翻译。

## 功能特点

- 🌍 支持多种语言翻译
  - 东亚语言（中文、日语、韩语等）
  - 欧洲语言（英语、法语、德语等）
  - 南亚语言（印地语、孟加拉语等）
  - 东南亚语言（泰语、越南语等）
  - 中东语言（阿拉伯语、波斯语等）

- 🤖 多种 AI 翻译引擎
  - DeepSeek
  - 通义千问
  - Gemini
  - 智谱 GLM4

- 📝 多种内容格式支持
  - 文本翻译
  - 图片 OCR 识别并翻译
  - PDF 文档翻译
  - 语音识别并翻译
  - 视频内容提取并翻译

- ✨ 其他特性
  - 实时语音识别
  - 翻译结果优化
  - 深色/浅色主题切换
  - 响应式设计，支持移动端
  - Google AdSense 自动广告集成

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/yourusername/ai-translate.git
cd ai-translate
```

2. 安装依赖
```bash
npm install
# 或者使用 yarn
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件，填入必要的 API 密钥：
- TENCENT_SECRET_ID（腾讯云 API）
- TENCENT_SECRET_KEY（腾讯云 API）
- GEMINI_API_KEY（Google Gemini API）
- ZHIPU_API_KEY（智谱 API）
- DEEPSEEK_API_KEY（DeepSeek API）
- QWEN_API_KEY（通义千问 API）

4. 配置 Google AdSense
   - 登录 [Google AdSense](https://www.google.com/adsense)
   - 获取你的 AdSense ID（格式如：ca-pub-xxxxxxxxxxxxxxxx）
   - 在 `app/layout.tsx` 中找到 AdSense 组件并替换为你的 ID
   - AdSense 会自动在合适的位置展示广告，无需手动创建广告位

5. 启动开发服务器
```bash
npm run dev
# 或者使用 yarn
yarn dev
```

6. 构建生产版本
```bash
npm run build
# 或者使用 yarn
yarn build
```

## 使用说明

1. 文本翻译
   - 在文本框中输入或粘贴要翻译的文本
   - 选择目标语言
   - 选择翻译服务
   - 点击翻译按钮

2. 图片翻译
   - 上传图片或拖拽图片到指定区域
   - 选择 OCR 服务提取文字
   - 选择目标语言和翻译服务
   - 点击翻译按钮

3. PDF 翻译
   - 上传 PDF 文件
   - 等待文本提取完成
   - 选择目标语言和翻译服务
   - 点击翻译按钮

4. 语音翻译
   - 点击麦克风按钮开始录音
   - 或上传音频文件
   - 等待语音识别完成
   - 选择目标语言和翻译服务
   - 点击翻译按钮

5. 视频翻译
   - 上传视频文件
   - 等待视频内容提取完成
   - 选择目标语言和翻译服务
   - 点击翻译按钮

## 技术栈

- Next.js 13
- TypeScript
- Tailwind CSS
- Radix UI
- Zustand
- 多个 AI API 集成
- Google AdSense

## 注意事项

- 确保所有必要的 API 密钥都已正确配置
- 图片 OCR 支持常见的图片格式（PNG, JPG, JPEG）
- PDF 翻译支持文本 PDF，不支持扫描版 PDF
- 语音识别目前支持主流语言
- 视频内容提取可能需要较长时间，取决于视频长度和复杂度
- AdSense 广告可能需要一段时间才会显示，这取决于 Google 的审核流程
- 确保你的网站符合 [AdSense 合规政策](https://support.google.com/adsense/answer/48182)

## 许可证

MIT License 