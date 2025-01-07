"use client"

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    language: string = 'zh-CN'
  ) {
    if (!this.recognition) {
      onError('语音识别在当前浏览器不可用');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      this.recognition.lang = language;

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        onResult(text, result.isFinal);
      };

      this.recognition.onerror = (event) => {
        onError(`语音识别错误: ${event.error}`);
        this.stopListening();
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition?.start();
        }
      };

      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError(`启动语音识别失败: ${error}`);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
} 