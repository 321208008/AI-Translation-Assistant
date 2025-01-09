# AI Translate

一个强大的多模型 AI 翻译工具，支持多种主流 AI 模型的文本翻译功能。

## 功能特点

- 支持多种 AI 模型翻译服务：
  - DeepSeek
  - Qwen (通义千问)
  - Zhipu (智谱)
  - OpenAI GPT-4
  - Tencent Hunyuan (腾讯混元)
- 支持多语言互译
- 简洁直观的用户界面
- 实时翻译响应

## 环境要求

- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器

## 安装步骤

1. 克隆项目到本地：
```bash
git clone [项目地址]
cd ai-translate
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
```

3. 配置环境变量：
   - 复制 `.env.example` 文件并重命名为 `.env.local`
   - 填入所需的 API 密钥：

```env
# Tencent Cloud API
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
NEXT_PUBLIC_TENCENT_API_KEY=your_tencent_api_key

# AI Model API Keys
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_ZHIPU_API_KEY=your_zhipu_api_key
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
NEXT_PUBLIC_QWEN_API_KEY=your_qwen_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

## 使用说明

1. 访问应用主页
2. 在输入框中输入需要翻译的文本
3. 选择目标语言
4. 选择想要使用的 AI 模型服务
5. 点击翻译按钮获取翻译结果

## API 密钥获取方式

- DeepSeek API：访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册并获取
- Qwen API：访问 [通义千问官网](https://dashscope.aliyun.com/) 注册并获取
- Zhipu API：访问 [智谱 AI 官网](https://open.bigmodel.cn/) 注册并获取
- OpenAI API：访问 [OpenAI 官网](https://platform.openai.com/) 注册并获取
- Tencent Hunyuan API：访问 [腾讯云官网](https://cloud.tencent.com/) 注册并获取

## 注意事项

- 请确保所有必要的 API 密钥都已正确配置
- 不同 AI 模型可能有不同的响应时间和翻译风格
- 建议在正式使用前先测试各个模型的翻译效果

## 广告集成

本项目已集成 Google AdSense，可通过配置相应的广告代码来展示广告内容。

## 开源协议

MIT License 