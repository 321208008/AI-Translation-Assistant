"use client"

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface TaskResponse {
  Response: {
    Data: {
      TaskId: number;
    };
    RequestId: string;
  };
}

interface StatusResponse {
  Response: {
    Data: {
      Status: number;
      Result: string;
    };
    RequestId: string;
  };
}

export class TencentASRService {
  private taskQueue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;

  private async processQueue() {
    if (this.isProcessing || this.taskQueue.length === 0) return;

    this.isProcessing = true;
    try {
      const task = this.taskQueue.shift();
      if (task) {
        await task();
      }
    } finally {
      this.isProcessing = false;
      if (this.taskQueue.length > 0) {
        await this.processQueue();
      }
    }
  }

  private addToQueue(task: () => Promise<void>) {
    this.taskQueue.push(task);
    this.processQueue();
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // 清理时间戳
  private cleanTimestamps(text: string): string {
    // 移除形如 [0:1.740,0:3.480] 的时间戳
    return text.replace(/\[\d+:\d+\.\d+,\d+:\d+\.\d+\]\s*/g, '');
  }

  async recognizeAudio(
    file: File,
    onProgress: (text: string) => void,
    onError: (error: string) => void
  ): Promise<string> {
    try {
      const base64Data = await this.fileToBase64(file);
      
      return new Promise((resolve, reject) => {
        this.addToQueue(async () => {
          try {
            // 创建识别任务
            const createResponse = await fetch('/api/asr/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                engineType: '16k_zh',
                channelNum: 1,
                resTextFormat: 0,
                sourceType: 1,
                data: base64Data,
              }),
            });

            if (!createResponse.ok) {
              const errorData = await createResponse.json();
              throw new Error(errorData.error || '创建识别任务失败');
            }

            const createData: TaskResponse = await createResponse.json();
            const taskId = createData.Response.Data.TaskId;

            // 定期查询任务状态
            const checkStatus = async () => {
              const statusResponse = await fetch('/api/asr/status', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  taskId,
                }),
              });

              if (!statusResponse.ok) {
                const errorData = await statusResponse.json();
                throw new Error(errorData.error || '查询任务状态失败');
              }

              const statusData: StatusResponse = await statusResponse.json();
              const status = statusData.Response.Data.Status;
              let resultText = statusData.Response.Data.Result;

              // 清理时间戳
              if (resultText) {
                resultText = this.cleanTimestamps(resultText);
              }

              if (status === 2) { // 成功
                resolve(resultText);
              } else if (status === 3) { // 失败
                reject(new Error("识别失败"));
              } else { // 进行中
                if (resultText) {
                  onProgress(resultText);
                }
                setTimeout(checkStatus, 1000);
              }
            };

            await checkStatus();
          } catch (error: any) {
            reject(error);
          }
        });
      });
    } catch (error: any) {
      onError(error.message || "音频识别失败");
      throw error;
    }
  }

  async recognizeStream(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ) {
    // 实时语音识别使用浏览器原生 API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('浏览器不支持语音识别');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      onResult(text, result.isFinal);
    };

    recognition.onerror = (event: any) => {
      onError(`语音识别错误: ${event.error}`);
    };

    return recognition;
  }
} 