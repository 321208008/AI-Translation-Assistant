"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { Upload, Image as ImageIcon, Languages, Wand2, Mic, MicOff, Video, Loader2, FileText, FileType, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { extractTextFromImage, translateText, improveText } from '@/lib/gemini'
import { getLanguageCategories, getLanguagesByCategory } from '@/lib/languages'
import { useI18n } from '@/lib/i18n/use-translations'
import { TencentASRService } from '@/lib/tencent-asr'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { translateWithDeepSeek } from '@/lib/deepseek'
import { translateWithQwen } from '@/lib/qwen'
import { extractTextWithGemini } from '@/lib/gemini'
import { extractVideoFrames, analyzeVideoContent, extractTextWithZhipu, extractFileContent, translateWithZhipu } from '@/lib/zhipu'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { extractTextWithDeepseek } from '@/lib/deepseek'
import { extractPDFWithKimi } from '@/lib/kimi'

export default function Home() {
  const { toast } = useToast()
  const { t } = useI18n()
  const [image, setImage] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [activeTab, setActiveTab] = useState('text')
  const [asrService, setAsrService] = useState('tencent')
  const asrServiceRef = useRef<TencentASRService | null>(null)
  const recognition = useRef<any>(null)
  const [translationService, setTranslationService] = useState('deepseek')
  const [ocrService, setOcrService] = useState('tencent')
  const [sourceText, setSourceText] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('')
  const [isFileProcessing, setIsFileProcessing] = useState(false)
  const [fileService, setFileService] = useState('deepseek')

  useEffect(() => {
    asrServiceRef.current = new TencentASRService();
  }, [asrService]);

  useEffect(() => {
    console.log('Current selected language:', selectedLanguage)
  }, [selectedLanguage])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      toast({
        title: t('error.invalidFile'),
        description: t('error.invalidFileDesc'),
        variant: "destructive"
      })
    }
  }, [toast, t])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExtractText = async () => {
    if (!image) {
      toast({
        title: t('error.noImage'),
        description: t('error.noImageDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      let text: string
      switch (ocrService) {
        case 'gemini':
          text = await extractTextFromImage(image)
          break
        case 'zhipu':
          text = await extractTextWithZhipu(image)
          break
        case 'tencent':
          const base64Data = image.split(',')[1]
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64Data }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || '文字识别失败')
          }

          const data = await response.json()
          text = data.text
          break
        default:
          const defaultBase64Data = image.split(',')[1]
          const defaultResponse = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: defaultBase64Data }),
          })

          if (!defaultResponse.ok) {
            const error = await defaultResponse.json()
            throw new Error(error.message || '文字识别失败')
          }

          const defaultData = await defaultResponse.json()
          text = defaultData.text
      }
      setExtractedText(text)
      toast({
        title: t('success.extracted'),
        description: t('success.description')
      })
    } catch (error: any) {
      toast({
        title: t('error.extracting'),
        description: error.message || t('error.extractingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTranslate = async () => {
    if (!extractedText || !selectedLanguage) {
      toast({
        title: t('error.translating'),
        description: t('error.noLanguage'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      let result: string
      switch (translationService) {
        case 'deepseek':
          result = await translateWithDeepSeek(extractedText, selectedLanguage)
          break
        case 'qwen':
          result = await translateWithQwen(extractedText, selectedLanguage)
          break
        case 'gemini':
          result = await translateText(extractedText, selectedLanguage)
          break
        case 'zhipu':
          result = await translateWithZhipu(extractedText, selectedLanguage)
          break
        default:
          result = await translateWithDeepSeek(extractedText, selectedLanguage)
      }
      setTranslatedText(result)
      toast({
        title: t('success.translated'),
        description: t('success.description')
      })
    } catch (error: any) {
      console.error('翻译错误:', error)
      toast({
        title: t('error.translating'),
        description: error.message || t('error.translatingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImprove = async () => {
    if (!translatedText) {
      toast({
        title: t('error.noTranslation'),
        description: t('error.noTranslationDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const improved = await improveText(translatedText, selectedLanguage)
      setTranslatedText(improved)
      toast({
        title: t('success.improved'),
        description: t('success.description')
      })
    } catch (error) {
      toast({
        title: t('error.improving'),
        description: t('error.improvingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleSpeechRecognition = async () => {
    if (!asrServiceRef.current) {
      toast({
        title: t('error.speechNotSupported'),
        description: t('error.speechNotSupportedDesc'),
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      if (recognition.current) {
        recognition.current.stop();
        recognition.current = null;
      }
      setIsListening(false);
      setInterimText('');
    } else {
      const rec = await asrServiceRef.current.recognizeStream(
        (text, isFinal) => {
          if (isFinal) {
            setExtractedText(text);
            setInterimText('');
            toast({
              title: t('success.speechRecognized'),
              description: t('success.description')
            });
          } else {
            setInterimText(text);
          }
        },
        (error) => {
          toast({
            title: t('error.speechRecognition'),
            description: error,
            variant: "destructive"
          });
          setIsListening(false);
        }
      );

      if (rec) {
        recognition.current = rec;
        rec.start();
        setIsListening(true);
      }
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: t('error.invalidAudioFile'),
        description: t('error.invalidAudioFileDesc'),
        variant: "destructive"
      });
      return;
    }

    if (!asrServiceRef.current) {
      toast({
        title: t('error.speechNotSupported'),
        description: t('error.speechNotSupportedDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await asrServiceRef.current.recognizeAudio(
        file,
        (progress) => {
          setInterimText(progress);
        },
        (error) => {
          toast({
            title: t('error.audioRecognition'),
            description: error,
            variant: "destructive"
          });
        }
      );
      
      setExtractedText(text);
      setInterimText('');
      toast({
        title: t('success.audioRecognized'),
        description: t('success.description')
      });
    } catch (error) {
      toast({
        title: t('error.audioProcessing'),
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextTranslate = async () => {
    if (!sourceText) {
      toast({
        title: t('error.noText'),
        description: t('error.noTextDesc'),
        variant: "destructive"
      })
      return
    }

    if (!selectedLanguage) {
      toast({
        title: t('error.noLanguage'),
        description: t('error.noLanguageDesc'),
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      let result: string
      switch (translationService) {
        case 'deepseek':
          result = await translateWithDeepSeek(sourceText, selectedLanguage)
          break
        case 'qwen':
          result = await translateWithQwen(sourceText, selectedLanguage)
          break
        case 'gemini':
          result = await translateText(sourceText, selectedLanguage)
          break
        case 'zhipu':
          result = await translateWithZhipu(sourceText, selectedLanguage)
          break
        default:
          result = await translateWithDeepSeek(sourceText, selectedLanguage)
      }
      setTranslatedText(result)
      toast({
        title: t('success.translated'),
        description: t('success.description')
      })
    } catch (error: any) {
      toast({
        title: t('error.translating'),
        description: error.message || t('error.translatingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: t('error.invalidVideoFile'),
        description: t('error.invalidVideoFileDesc'),
        variant: "destructive"
      });
      return;
    }

    setVideoFile(file);
    setIsProcessing(true);
    try {
      // 提取视频帧
      const frames = await extractVideoFrames(file);
      
      // 使用智谱AI分析视频内容
      const text = await analyzeVideoContent(frames);
      
      setExtractedText(text);
      toast({
        title: t('success.videoExtracted'),
        description: t('success.description')
      });
    } catch (error: any) {
      toast({
        title: t('error.videoProcessing'),
        description: error.message || t('error.videoProcessingDesc'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsFileProcessing(true)
      setFileContent('')
      
      const content = await extractPDFWithKimi(file)
      setFileContent(content)
      toast({
        title: t('success.fileExtracted'),
        description: t('success.description')
      })
    } catch (error: any) {
      console.error('文件处理错误:', error)
      toast({
        title: t('error.fileProcessing'),
        description: error.message || t('error.fileProcessingDesc'),
        variant: "destructive"
      })
    } finally {
      setIsFileProcessing(false)
    }
  }, [t])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-4 md:p-6">
        <Tabs defaultValue="text" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 h-auto mb-6">
            <TabsTrigger value="text" className="data-[state=active]:bg-muted py-2">
              <Languages className="w-4 h-4 mr-2" />
              {t('tabs.text')}
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-muted py-2">
              <ImageIcon className="w-4 h-4 mr-2" />
              {t('tabs.image')}
            </TabsTrigger>
            <TabsTrigger value="file" className="data-[state=active]:bg-muted py-2">
              <FileType className="w-4 h-4 mr-2" />
              {t('tabs.pdf')}
            </TabsTrigger>
            <TabsTrigger value="speech" className="data-[state=active]:bg-muted py-2">
              {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {t('tabs.speech')}
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-muted py-2">
              <Video className="w-4 h-4 mr-2" />
              {t('tabs.video')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <div className="flex flex-col items-center justify-center gap-4">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={t('enterText')}
                className="w-full max-w-2xl h-32 p-4 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Select 
                  onValueChange={(value) => {
                    console.log('Selected language:', value)
                    setSelectedLanguage(value)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageCategories().map(category => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {getLanguagesByCategory(category).map(language => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.nativeName} ({language.name})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setTranslationService} defaultValue="deepseek">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="qwen">通义千问</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="zhipu">智谱GLM4</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleTextTranslate}
                  disabled={!sourceText || !selectedLanguage || isProcessing}
                  className="w-full sm:w-40"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{t('translating')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Languages className="mr-2 h-4 w-4" />
                      <span>{t('translate')}</span>
                    </div>
                  )}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleImprove}
                        disabled={!translatedText || isProcessing}
                        variant="outline"
                        className="w-full sm:w-40"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('improve')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('improveTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {translatedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('translatedText')}</h3>
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="flex flex-col items-center justify-center gap-4">
              <Card
                className={`w-full max-w-xl h-48 flex items-center justify-center border-2 border-dashed ${
                  isDragging ? 'border-primary' : 'border-muted-foreground'
                } relative overflow-hidden`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {image ? (
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt="Uploaded"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">{t('dragAndDrop')}</p>
                    <div className="relative">
                      <Button variant="secondary" size="sm">
                        {t('selectImage')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                  <Select onValueChange={setOcrService} defaultValue="tencent">
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder={t('selectOCRService')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tencent">腾讯云</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="zhipu">智谱GLM4</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleExtractText}
                    disabled={!image || isProcessing}
                    className="w-full sm:w-40"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{t('extracting')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{t('extract')}</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                  <Select onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {getLanguageCategories().map(category => (
                        <SelectGroup key={category}>
                          <SelectLabel>{category}</SelectLabel>
                          {getLanguagesByCategory(category).map(language => (
                            <SelectItem key={language.code} value={language.name}>
                              {language.nativeName} ({language.name})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setTranslationService} defaultValue="deepseek">
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder={t('selectService')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="qwen">通义千问</SelectItem>
                      <SelectItem value="gemini">Gemini</SelectItem>
                      <SelectItem value="zhipu">智谱GLM4</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleTranslate}
                    disabled={!extractedText || !selectedLanguage || isProcessing}
                    className="w-full sm:w-40"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>{t('translating')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Languages className="mr-2 h-4 w-4" />
                        <span>{t('translate')}</span>
                      </div>
                    )}
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleImprove}
                          disabled={!translatedText || isProcessing}
                          variant="outline"
                          className="w-full sm:w-40"
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          {t('improve')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('improveTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {extractedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('extractedText')}</h3>
                  <p className="whitespace-pre-wrap">{extractedText}</p>
                </div>
              )}

              {translatedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('translatedText')}</h3>
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="file">
            <div className="flex flex-col items-center justify-center gap-4">
              <Card className={cn(
                "w-full max-w-2xl border-2 border-dashed relative",
                isDragging ? "border-primary" : "border-gray-300 dark:border-gray-700"
              )}>
                {fileContent ? (
                  <div className="p-4">
                    <textarea
                      value={fileContent}
                      readOnly
                      className="w-full h-64 p-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <FileType className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">{t('dragAndDropPDF')}</p>
                    <div className="relative">
                      <Button variant="secondary" size="sm" disabled={isFileProcessing}>
                        {isFileProcessing ? t('processing') : t('selectPDF')}
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(file)
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isFileProcessing}
                        />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Select onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageCategories().map(category => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {getLanguagesByCategory(category).map(language => (
                          <SelectItem key={language.code} value={language.name}>
                            {language.nativeName} ({language.name})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setTranslationService} defaultValue="deepseek">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="qwen">通义千问</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="zhipu">智谱GLM4</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={async () => {
                    if (fileContent && selectedLanguage) {
                      try {
                        setIsProcessing(true)
                        let result: string
                        switch (translationService) {
                          case 'deepseek':
                            result = await translateWithDeepSeek(fileContent, selectedLanguage)
                            break
                          case 'qwen':
                            result = await translateWithQwen(fileContent, selectedLanguage)
                            break
                          case 'gemini':
                            result = await translateText(fileContent, selectedLanguage)
                            break
                          case 'zhipu':
                            result = await translateWithZhipu(fileContent, selectedLanguage)
                            break
                          default:
                            result = await translateWithDeepSeek(fileContent, selectedLanguage)
                        }
                        setTranslatedText(result)
                        toast({
                          title: t('success.translated'),
                          description: t('success.description')
                        })
                      } catch (error: any) {
                        console.error('翻译错误:', error)
                        toast({
                          title: t('error.translating'),
                          description: error.message || t('error.translatingDesc'),
                          variant: "destructive"
                        })
                      } finally {
                        setIsProcessing(false)
                      }
                    } else {
                      toast({
                        title: t('error.translating'),
                        description: t('error.noLanguage'),
                        variant: "destructive"
                      })
                    }
                  }}
                  className="w-full sm:w-40"
                  disabled={!fileContent || !selectedLanguage || isProcessing}
                >
                  <Languages className="mr-2 h-4 w-4" />
                  {isProcessing ? t('translating') : t('translate')}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleImprove}
                        disabled={!translatedText || isProcessing}
                        variant="outline"
                        className="w-full sm:w-40"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('improve')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('improveTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {translatedText && (
                <div className="w-full max-w-2xl mx-auto mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('translatedText')}</h3>
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="speech">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center">
                <div className="relative w-[240px]">
                  <Button
                    variant="default"
                    className="w-full"
                    disabled={isProcessing || isListening}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('uploadAudio')}
                  </Button>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessing || isListening}
                  />
                </div>

                <Button
                  onClick={toggleSpeechRecognition}
                  variant={isListening ? "destructive" : "outline"}
                  className="w-[240px]"
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      {t('stopListening')}
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      {t('startListening')}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Select onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageCategories().map(category => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {getLanguagesByCategory(category).map(language => (
                          <SelectItem key={language.code} value={language.name}>
                            {language.nativeName} ({language.name})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setTranslationService} defaultValue="deepseek">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="qwen">通义千问</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="zhipu">智谱GLM4</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleTranslate}
                  disabled={!extractedText || !selectedLanguage || isProcessing}
                  className="w-full sm:w-40"
                >
                  <Languages className="mr-2 h-4 w-4" />
                  {isProcessing ? t('translating') : t('translate')}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleImprove}
                        disabled={!translatedText || isProcessing}
                        variant="outline"
                        className="w-full sm:w-40"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('improve')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('improveTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {isProcessing && (
                <div className="w-full max-w-md p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
                </div>
              )}
              
              {interimText && (
                <div className="w-full max-w-md p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{interimText}</p>
                </div>
              )}

              {extractedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('extractedText')}</h3>
                  <p className="whitespace-pre-wrap">{extractedText}</p>
                </div>
              )}

              {translatedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('translatedText')}</h3>
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl justify-center">
                <div className="relative w-[240px] mx-auto">
                  <Button
                    variant="default"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    {t('uploadVideo')}
                  </Button>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {videoFile && (
                <div className="text-sm text-gray-500">
                  {videoFile.name}
                </div>
              )}

              {isProcessing && (
                <div className="w-full max-w-md p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t('processing')}</p>
                </div>
              )}

              {extractedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('extractedText')}</h3>
                  <p className="whitespace-pre-wrap">{extractedText}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Select onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {getLanguageCategories().map(category => (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {getLanguagesByCategory(category).map(language => (
                          <SelectItem key={language.code} value={language.name}>
                            {language.nativeName} ({language.name})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setTranslationService} defaultValue="deepseek">
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder={t('selectService')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="qwen">通义千问</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="zhipu">智谱GLM4</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleTranslate}
                  disabled={!extractedText || !selectedLanguage || isProcessing}
                  className="w-full sm:w-40"
                >
                  <Languages className="mr-2 h-4 w-4" />
                  {isProcessing ? t('translating') : t('translate')}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleImprove}
                        disabled={!translatedText || isProcessing}
                        variant="outline"
                        className="w-full sm:w-40"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {t('improve')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('improveTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {translatedText && (
                <div className="w-full max-w-2xl mx-auto p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-medium mb-2">{t('translatedText')}</h3>
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}