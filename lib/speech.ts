"use client"

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const windowWithWebkit = window as IWindow;
      const SpeechRecognition = windowWithWebkit.SpeechRecognition || windowWithWebkit.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public start(onResult: (text: string, isFinal: boolean) => void, onError: (error: string) => void) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      const isFinal = result.isFinal;
      onResult(text, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError('Error starting speech recognition');
      this.isListening = false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
} 