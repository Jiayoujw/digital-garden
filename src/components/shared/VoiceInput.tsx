'use client';

import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  lang?: string;
}

export function VoiceInput({ onTranscript, lang }: VoiceInputProps) {
  const { locale } = useLanguage();
  const speechLang = lang ?? (locale === 'zh' ? 'zh-CN' : 'en-US');
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
      setInterim(interimTranscript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [speechLang, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterim('');
  }, []);

  if (!supported) {
    return (
      <span className="text-[10px] text-[var(--color-text-muted)]" title="Speech recognition not supported in this browser">
        🎤✕
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
          listening
            ? 'bg-[var(--color-danger)] text-white animate-pulse'
            : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
        }`}
        title={listening ? (locale === 'zh' ? '点击停止' : 'Click to stop') : (locale === 'zh' ? '语音输入' : 'Voice input')}
      >
        {listening ? '⏹' : '🎤'}
        {listening && (
          <span className="hidden sm:inline">
            {locale === 'zh' ? '录音中...' : 'Recording...'}
          </span>
        )}
      </button>
      {listening && interim && (
        <div className="absolute top-full mt-1 left-0 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text-secondary)] shadow-lg max-w-xs whitespace-normal z-30">
          {interim}
        </div>
      )}
    </div>
  );
}
